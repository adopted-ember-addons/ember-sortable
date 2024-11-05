local base = import 'base.jsonnet';
local images = import 'images.jsonnet';
local misc = import 'misc.jsonnet';
local notifications = import 'notifications.jsonnet';

{
  _assertMergeShaIsLatestCommit(branch, sha='${{ github.sha }}', repository='${{ github.repository }}')::
    [
      base.step('install jq curl', 'apk add --no-cache jq curl'),
      base.step(
        'assert merge sha is latest commit',
        |||
          HEAD_SHA=$(curl -L -H "Accept: application/vnd.github+json" -H "Authorization: Bearer ${GITHUB_TOKEN}" -H "X-GitHub-Api-Version: 2022-11-28" https://api.github.com/repos/${GITHUB_REPOSITORY}/branches/${TARGET_BRANCH} | jq -r .commit.sha);
          if [ ${HEAD_SHA} == ${PR_MERGE_COMMIT_SHA} ]; then
            echo "Merge sha is latest commit on branch ${TARGET_BRANCH}! HEAD_SHA: ${HEAD_SHA} PR_MERGE_COMMIT_SHA: ${PR_MERGE_COMMIT_SHA}";
            echo "CREATE_DEPLOY_EVENT=true" >> $GITHUB_OUTPUT
          else
            echo "Merge sha is not latest commit on branch ${TARGET_BRANCH}! HEAD_SHA: ${HEAD_SHA} PR_MERGE_COMMIT_SHA: ${PR_MERGE_COMMIT_SHA}";
            echo "CREATE_DEPLOY_EVENT=false" >> $GITHUB_OUTPUT
          fi
        |||,
        env={
          PR_MERGE_COMMIT_SHA: sha,
          GITHUB_REPOSITORY: repository,
          TARGET_BRANCH: branch,
          GITHUB_TOKEN: '${{ github.token }}',
        },
        id='assert-merge-sha-is-latest-commit',
      ),
    ],

  /*
   * Creates a production deployment event on pr-close if all of the following conditions are met:
   * - the pr is merged
   * - the pr is merged into the default branch
   * - the merge sha is the latest commit on the default branch.
   *   this prevents a deployment from beeing created in a specific edge case:
   *   - PR A is merged into PR B
   *   - PR B is merged into the default branch
   *   - now github closes both PRs and without this additional sanity check, both would create a deploy event
   *
   * For more complex deployment scenarios, use the branchMergeDeploymentEventHook instead
   *
   * params:
   *   deployToTest {boolean} - if true, a deployment event is also created for the test environment
   *   prodBranch {string|null} - the branch to deploy to production. defaults to the default branch of the repository. but can be set to a differring release branch
   *   testBranch {string|null} - the branch to deploy to test. defaults to the default branch of the repository. but can be set to a differring test branch
   *   extraDeployTargets {string[]} - deploy targets to create deployment events for. defaults to ['production']. these targets will triger based on the configured prodBranch
   *   runsOn {string|null} - the name of the runner to run this job on. defaults to null, which will later on means the default self hosted runner will be used
   *   notifyOnTestDeploy {boolean} - if true, a slack message is sent when a test deployment is created
  */
  masterMergeDeploymentEventHook(deployToTest=false, prodBranch=null, testBranch=null, deployTargets=['production'], runsOn=null, notifyOnTestDeploy=false)::
    local branches = [
      {
        branch: (if prodBranch != null then prodBranch else '_default_'),
        deployments: deployTargets,
        notifyOnDeploy: true,
      },
    ] + (if deployToTest then [
           {
             branch: (if testBranch != null then testBranch else '_default_'),
             deployments: ['test'],
             notifyOnDeploy: notifyOnTestDeploy,
           },
         ] else []);

    self.branchMergeDeploymentEventHook(branches, runsOn=runsOn),


  /*
   * Creates a production deployment event on pr-close if all of the following conditions are met:
   * - the pr is merged
   * - the pr is merged into the default branch
   * - the merge sha is the latest commit on the default branch.
   *   this prevents a deployment from beeing created in a specific edge case:
   *   - PR A is merged into PR B
   *   - PR B is merged into the default branch
   *   - now github closes both PRs and without this additional sanity check, both would create a deploy event
   *
   * params:
   *   branches {{branch: string, deployments: string[], notifyOnDeploy: boolean}[]} - an array of the branches to create deployment events for.
   *     Each branch object has the following properties:
   *       branch {string} - the branch to which the PR has to be merged into. If '_default_' is used, the default branch of the repository is used.
   *       deployments {string[]} - the environments to deploy to. e.g. ['production', 'test']
   *       notifyOnDeploy {boolean} - if true, a slack message is sent when a deployment is created
   *   runsOn {string|null} - the name of the runner to run this job on. defaults to null, which will later on means the default self hosted runner will be used
   */
  branchMergeDeploymentEventHook(branches, runsOn=null)::
    base.pipeline(
      'create-merge-deployment',
      [
        (
          local branchName = if branch.branch == '_default_' then '${{ github.event.pull_request.base.repo.default_branch }}' else branch.branch;
          local branchNameForJob = if branch.branch == '_default_' then 'default-branch' else branch.branch;
          local branchNameInExpression = if branch.branch == '_default_' then 'github.event.pull_request.base.repo.default_branch' else "'" + branch.branch + "'";

          local ifClause = '${{ github.event.pull_request.base.ref == ' + branchNameInExpression + " && steps.assert-merge-sha-is-latest-commit.outputs.CREATE_DEPLOY_EVENT == 'true' }}";

          base.ghJob(
            'create-merge-deployment-' + branchNameForJob + '-to-' + std.join('-', branch.deployments),
            useCredentials=false,
            runsOn=runsOn,
            permissions={ deployments: 'write', contents: 'read' },
            ifClause="${{ github.event.pull_request.merged == true}}",
            steps=self._assertMergeShaIsLatestCommit(branch=branchName) +
                  std.map(
                    function(deploymentTarget)
                      base.action(
                        'publish-deploy-' + deploymentTarget + '-event',
                        'chrnorm/deployment-action@v2',
                        ifClause=ifClause,
                        with={
                          token: misc.secret('VIRKO_GITHUB_TOKEN'),
                          environment: deploymentTarget,
                          'auto-merge': 'false',
                          ref: '${{ github.event.pull_request.head.sha }}',
                          description: 'Auto deploy ' + deploymentTarget + ' on PR merge. pr: ${{ github.event.number }} ref: ${{ github.event.pull_request.head.sha }}',
                          payload: '{ "pr" : ${{ github.event.number }}, "branch": "${{ github.head_ref }}", "base_ref": "${{ github.event.pull_request.base.sha }}", "head_ref": "${{ github.event.pull_request.head.sha }}" }',
                        }
                      ),
                    branch.deployments,
                  ) +
                  (
                    if branch.notifyOnDeploy then
                      [
                        notifications.sendSlackMessage(
                          message='Deploy to ' + std.join(' and ', branch.deployments) + ' of <https://github.com/${{ github.action_repository }}/pulls/${{ github.event.number }}|*PR ${{ github.event.number }}*> started!\nTitle: ${{ github.event.pull_request.title }}\nBranch: ${{ github.head_ref }}',
                          ifClause=ifClause,
                        ),
                      ]
                    else []
                  ),
          )
        )
        for branch in branches
      ],
      event={
        pull_request: {
          types: ['closed'],
        },
      },
    ),

  /*
   * Generate a github ifClause for the provided deployment targets:
   */
  deploymentTargets(targets)::
    '${{ ' + std.join(' || ', std.map(function(target) "github.event.deployment.environment == '" + target + "'", targets)) + ' }}',
}
