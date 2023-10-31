{
  _assertMergeShaIsLatestCommit(branch, sha='${{ github.sha }}', repository='${{ github.repository }}')::
    [
      $.step('install jq curl', 'apk add --no-cache jq curl'),
      $.step(
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

  masterMergeDeploymentEventHook(deployToTest=false, prodBranch=null, testBranch=null)::
    $.pipeline(
      'create-merge-deployment',
      [
        $.ghJob(
          'create-merge-deployment-prod',
          useCredentials=false,
          permissions={ deployments: 'write', contents: 'read' },
          ifClause="${{ github.actor != 'gynzy-virko' && github.event.pull_request.merged == true}}",
          steps=$._assertMergeShaIsLatestCommit(branch=(if prodBranch != null then prodBranch else '${{ github.event.pull_request.base.repo.default_branch }}')) +
                [
                  $.action(
                    'publish-deploy-prod-event',
                    'chrnorm/deployment-action@v2',
                    ifClause='${{ github.event.pull_request.base.ref == ' + (if prodBranch != null then "'" + prodBranch + "'" else 'github.event.pull_request.base.repo.default_branch') + " && steps.assert-merge-sha-is-latest-commit.outputs.CREATE_DEPLOY_EVENT == 'true' }}",
                    with={
                      token: $.secret('VIRKO_GITHUB_TOKEN'),
                      environment: 'production',
                      'auto-merge': 'false',
                      ref: '${{ github.event.pull_request.head.sha }}',
                      description: 'Auto deploy production on PR merge. pr: ${{ github.event.number }} ref: ${{ github.event.pull_request.head.sha }}',
                      payload: '{ "pr" : ${{ github.event.number }}, "branch": "${{ github.head_ref }}", "base_ref": "${{ github.event.pull_request.base.sha }}", "head_ref": "${{ github.event.pull_request.head.sha }}" }',
                    }
                  ),
                  $.sendSlackMessage(
                    message='Deploy to prod of pr: ${{ github.event.number }} with title: ${{ github.event.pull_request.title }} branch: ${{ github.head_ref }} started!',
                    ifClause='${{ github.event.pull_request.base.ref == ' + (if prodBranch != null then "'" + prodBranch + "'" else 'github.event.pull_request.base.repo.default_branch') + " && steps.assert-merge-sha-is-latest-commit.outputs.CREATE_DEPLOY_EVENT == 'true' }}",
                  ),
                ],
        ),
      ] +
      (if deployToTest == true then
         [
           $.ghJob(
             'create-merge-deployment-test',
             useCredentials=false,
             permissions={ deployments: 'write', contents: 'read' },
             ifClause="${{ github.actor != 'gynzy-virko' && github.event.pull_request.merged == true}}",
             steps=$._assertMergeShaIsLatestCommit(branch=(if testBranch != null then testBranch else '${{ github.event.pull_request.base.repo.default_branch }}')) +
                   [
                     $.action(
                       'publish-deploy-test-event',
                       'chrnorm/deployment-action@v2',
                       ifClause='${{ github.event.pull_request.base.ref == ' + (if testBranch != null then "'" + testBranch + "'" else 'github.event.pull_request.base.repo.default_branch') + " && steps.assert-merge-sha-is-latest-commit.outputs.CREATE_DEPLOY_EVENT == 'true' }}",
                       with={
                         token: $.secret('VIRKO_GITHUB_TOKEN'),
                         environment: 'test',
                         'auto-merge': 'false',
                         ref: '${{ github.event.pull_request.head.sha }}',
                         description: 'Auto deploy test on PR merge. pr: ${{ github.event.number }} ref: ${{ github.event.pull_request.head.sha }}',
                         payload: '{ "pr" : ${{ github.event.number }}, "branch": "${{ github.head_ref }}", "base_ref": "${{ github.event.pull_request.base.sha }}", "head_ref": "${{ github.event.pull_request.head.sha }}" }',
                       }
                     ),
                   ],
           ),
         ] else []),
      event={
        pull_request: {
          types: ['closed'],
        },
      },
    ),
}
