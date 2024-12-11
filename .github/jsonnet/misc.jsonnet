local base = import 'base.jsonnet';
local images = import 'images.jsonnet';

{
  checkout(ifClause=null, fullClone=false, ref=null, preferSshClone=true)::
    local with = (if fullClone then { 'fetch-depth': 0 } else {}) + (if ref != null then { ref: ref } else {});
    local sshSteps = (if (preferSshClone) then
                        base.step(
                          'check for ssh/git binaries',
                          |||
                            if command -v git;
                              then
                                echo "gitBinaryExists=true" >> $GITHUB_OUTPUT;
                                echo "Git binary exists";
                              else
                                echo "Attempt to install git binary";
                                if command -v apk; then
                                  echo "apk exists";
                                  apk add git && echo "gitBinaryExists=true" >> $GITHUB_OUTPUT;
                                elif command -v apt; then
                                  echo "apt exists";
                                  apt update && apt install -y git && echo "gitBinaryExists=true" >> $GITHUB_OUTPUT;
                                else
                                  echo "No package manager found, unable to install git cli binary";
                                  echo "gitBinaryExists=false" >> $GITHUB_OUTPUT;
                                fi;
                            fi;

                            if command -v ssh;
                              then
                                echo "sshBinaryExists=true" >> $GITHUB_OUTPUT;
                                echo "SSH binary exists";
                                exit 0;
                              else
                                echo "Attempt to install ssh binary";
                                if command -v apk; then
                                  echo "apk exists";
                                  apk add openssh-client && echo "sshBinaryExists=true" >> $GITHUB_OUTPUT && exit 0;
                                elif command -v apt; then
                                  echo "apt exists";
                                  apt update && apt install -y openssh-client && echo "sshBinaryExists=true" >> $GITHUB_OUTPUT && exit 0;
                                else
                                  echo "No package manager found, unable to install ssh cli binary";
                                  echo "sshBinaryExists=false" >> $GITHUB_OUTPUT;
                                fi;
                            fi;
                            echo "sshBinaryExists=false" >> $GITHUB_OUTPUT;
                          |||,
                          id='check-binaries',
                        ) else []);

    // strip the ${{ }} from the IfClause so we can inject and add our own if clause
    local localIfClause = (if ifClause == null then null else std.strReplace(std.strReplace(ifClause, '${{ ', ''), ' }}', ''));

    if (preferSshClone) then
      sshSteps +
      base.action(
        'Check out repository code via ssh',
        'actions/checkout@v4',
        with=with + (if preferSshClone then { 'ssh-key': '${{ secrets.VIRKO_GITHUB_SSH_KEY }}' } else {}),
        ifClause='${{ ' + (if ifClause == null then '' else '( ' + localIfClause + ' ) && ') + " ( steps.check-binaries.outputs.sshBinaryExists == 'true' && steps.check-binaries.outputs.gitBinaryExists == 'true' ) }}",
      ) +
      base.action(
        'Check out repository code via https',
        'actions/checkout@v4',
        with=with,
        ifClause='${{ ' + (if ifClause == null then '' else '( ' + localIfClause + ' ) && ') + " ( steps.check-binaries.outputs.sshBinaryExists == 'false' || steps.check-binaries.outputs.gitBinaryExists == 'false' ) }}",
      ) +
      base.step('git safe directory', "command -v git && git config --global --add safe.directory '*' || true")
    else
      self.checkoutWithoutSshMagic(ifClause, fullClone, ref),

  checkoutWithoutSshMagic(ifClause=null, fullClone=false, ref=null)::
    local with = (if fullClone then { 'fetch-depth': 0 } else {}) + (if ref != null then { ref: ref } else {});
    base.action(
      'Check out repository code',
      'actions/checkout@v4',
      with=with,
      ifClause=ifClause
    ) +
    base.step('git safe directory', "command -v git && git config --global --add safe.directory '*' || true"),

  lint(service)::
    base.step('lint-' + service,
              './node_modules/.bin/eslint "./packages/' + service + '/{app,lib,tests,config,addon}/**/*.js" --quiet'),

  lintAll()::
    base.step('lint', 'yarn lint'),

  verifyGoodFences()::
    base.step('verify-good-fences', 'yarn run gf'),

  improvedAudit()::
    base.step('audit', 'yarn improved-audit'),

  verifyJsonnetWorkflow()::
    base.pipeline(
      'misc',
      [
        self.verifyJsonnet(fetch_upstream=false),
      ],
      event='pull_request',
    ),

  verifyJsonnet(fetch_upstream=true, runsOn=null)::
    base.ghJob(
      'verify-jsonnet-gh-actions',
      runsOn=runsOn,
      image=images.jsonnet_bin_image,
      steps=[
              self.checkout(ref='${{ github.event.pull_request.head.sha }}'),
              base.step('remove-workflows', 'rm -f .github/workflows/*'),
            ] +
            (
              if fetch_upstream then [base.step('fetch latest lib-jsonnet',
                                                ' rm -rf .github/jsonnet/;\n                mkdir .github/jsonnet/;\n                cd .github;\n                curl https://files.gynzy.net/lib-jsonnet/v1/jsonnet-prod.tar.gz | tar xvzf -;\n              ')] else []
            )
            + [
              base.step('generate-workflows', 'jsonnet -m .github/workflows/ -S .github.jsonnet;'),
              base.step('git workaround', 'git config --global --add safe.directory $PWD'),
              base.step('check-jsonnet-diff', 'git diff --exit-code'),
              base.step(
                'possible-causes-for-error',
                'echo "Possible causes: \n' +
                '1. You updated jsonnet files, but did not regenerate the workflows. \n' +
                "To fix, run 'yarn github:generate' locally and commit the changes. If this helps, check if your pre-commit hooks work.\n" +
                '2. You used the wrong jsonnet binary. In this case, the newlines at the end of the files differ.\n' +
                'To fix, install the go binary. On mac, run \'brew uninstall jsonnet && brew install jsonnet-go\'"',
                ifClause='failure()',
              ),
            ],
    ),

  updatePRDescriptionPipeline(
    bodyTemplate,
    titleTemplate='',
    baseBranchRegex=null,
    headBranchRegex=null,
    bodyUpdateAction='suffix',
    titleUpdateAction='prefix',
    otherOptions={},
  )::
    base.pipeline(
      'update-pr-description',
      event={
        pull_request: { types: ['opened'] },
      },
      jobs=[
        base.ghJob(
          'update-pr-description',
          steps=[
            base.action(
              'update-pr-description',
              'gynzy/pr-update-action@v2',
              with={
                'repo-token': '${{ secrets.GITHUB_TOKEN }}',
                [if baseBranchRegex != null then 'base-branch-regex']: baseBranchRegex,
                [if headBranchRegex != null then 'head-branch-regex']: headBranchRegex,
                'title-template': titleTemplate,
                'body-template': bodyTemplate,
                'body-update-action': bodyUpdateAction,
                'title-update-action': titleUpdateAction,
              } + otherOptions,
            ),
          ],
          useCredentials=false,
        ),
      ],
      permissions={
        'pull-requests': 'write',
      },
    ),

  // Create a markdown table.
  //
  // The headers array and each row array must have the same length.
  //
  // Parameters:
  // headers: a list of headers for the table
  // rows: a list of rows, where each row is a list of values
  //
  // Returns:
  // a markdown table as a string
  markdownTable(headers, rows)::
    local renderLine = function(line) '| ' + std.join(' | ', line) + ' |\n';
    local renderedHeader = renderLine(headers) + renderLine(std.map(function(x) '---', headers));

    local renderedRows = std.map(
      function(line)
        assert std.length(headers) == std.length(line) : 'Headers and rows must have the same length';
        renderLine(line),
      rows
    );
    renderedHeader + std.join('', renderedRows),

  // Create a collapsable markdown section.
  //
  // Parameters:
  // title: the title of the section
  // content: the content of the section
  //
  // Returns:
  // a collapsable markdown section as a string
  markdownCollapsable(title, content)::
    '<details>\n' +
    '<summary>' + title + '</summary>\n\n' +
    content + '\n' +
    '</details>\n',

  // Create a markdown table with preview links.
  //
  // Parameters:
  // environments: a list of environment names
  // apps: a list of apps, where each app is an object with the following fields:
  //   - name: the name of the app
  //   - linkToLinear: a list of environment names for which to create a preview link in Linear
  //   - environment names: the environment links
  //     - the key is the environment name
  //     - the value is the link, or an object with the link name as the key and the link as the value. This is useful for multiple links per environment.
  //
  // Returns:
  // a markdown table with preview links as a string
  //
  // Example:
  // misc.previewLinksTable(
  //   ['pr', 'acceptance', 'test', 'prod'],
  //   [
  //     {
  //       name: 'app1',
  //       pr: 'https://pr-link',
  //       acceptance: 'https://acceptance-link',
  //       test: 'https://test-link',
  //       prod: 'https://prod-link',
  //     },
  //     {
  //       name: 'app2',
  //       linkToLinear: ['pr', 'acceptance'],
  //       pr: 'https://pr-link',
  //       acceptance: 'https://acceptance-link',
  //       test: 'https://test-link',
  //       prod: {
  //         prod-nl: 'https://prod-link/nl',
  //         prod-en: 'https://prod-link/en',
  //       },
  //     },
  //   ],
  // )
  previewLinksTable(environments, apps)::
    local headers = ['Application'] + environments;
    local rows = std.map(
      function(app)
        [app.name] + std.map(
          function(env)
            if !std.objectHas(app, env) then
              '-'
            else
              local link = app[env];
              if std.isObject(link) then
                std.join(' - ', std.map(function(linkName) '[' + linkName + '](' + link[linkName] + ')', std.objectFields(link)))
              else
                '[' + env + '](' + link + ')',
          environments
        )
      ,
      apps
    );
    local linearLinks = std.flatMap(
      function(app) std.flatMap(
        function(env)
          if std.isObject(app[env]) then
            std.map(
              function(linkName)
                '[' + std.strReplace(std.strReplace(app.name + ' ' + env + ' ' + linkName, '(', ''), ')', '') + ' preview]' +
                '(' + app[env][linkName] + ')',
              std.objectFields(app[env])
            )
          else
            ['[' + std.strReplace(std.strReplace(app.name + ' ' + env, '(', ''), ')', '') + ' preview](' + app[env] + ')'],

        app.linkToLinear,
      ),
      std.filter(function(app) std.objectHas(app, 'linkToLinear'), apps)
    );
    self.markdownTable(headers, rows) + self.markdownCollapsable('Linear links', std.join('\n', linearLinks)),

  shortServiceName(name)::
    assert name != null;
    std.strReplace(std.strReplace(name, 'gynzy-', ''), 'unicorn-', ''),

  secret(secretName)::
    '${{ secrets.' + secretName + ' }}',

  pollUrlForContent(url, expectedContent, name='verify-deploy', attempts='100', interval='2000', ifClause=null)::
    base.action(
      name,
      'gynzy/wait-for-http-content@v1',
      with={
        url: url,
        expectedContent: expectedContent,
        attempts: attempts,
        interval: interval,
      },
      ifClause=ifClause,
    ),

  cleanupOldBranchesPipelineCron(protectedBranchRegex='^(main|master|gynzy|upstream)$')::
    base.pipeline(
      'purge-old-branches',
      [
        base.ghJob(
          'purge-old-branches',
          useCredentials=false,
          steps=[
            base.step('setup', 'apk add git bash'),
            self.checkout(),
            base.action(
              'Run delete-old-branches-action',
              'beatlabs/delete-old-branches-action@6e94df089372a619c01ae2c2f666bf474f890911',
              with={
                repo_token: '${{ github.token }}',
                date: '3 months ago',
                dry_run: false,
                delete_tags: false,
                extra_protected_branch_regex: protectedBranchRegex,
                extra_protected_tag_regex: '^v.*',
                exclude_open_pr_branches: true,
              },
              env={
                GIT_DISCOVERY_ACROSS_FILESYSTEM: 'true',
              }
            ),
          ],
        ),
      ],
      event={
        schedule: [{ cron: '0 12 * * 1' }],
      },
    ),

  // Test if the changed files match the given glob patterns.
  // Can test for multiple pattern groups, and sets multiple outputs.
  //
  // Parameters:
  // changedFiles: a map of grouped glob patterns to test against.
  //   The map key is the name of the group.
  //   The map value is a list of glob patterns (as string, can use * and **) to test against.
  //
  // Outputs:
  // steps.changes.outputs.<group>: true if the group matched, false otherwise
  //
  // Permissions:
  // Requires the 'pull-requests': 'read' permission
  //
  // Example:
  // misc.testForChangedFiles({
  //   'app': ['packages/*/app/**/*', 'package.json'],
  //   'lib': ['packages/*/lib/**/*'],
  // })
  //
  // This will set the following outputs:
  // - steps.changes.outputs.app: true if any of the changed files match the patterns in the 'app' group
  // - steps.changes.outputs.lib: true if any of the changed files match the patterns in the 'lib' group
  //
  // These can be tested as in an if clause as follows:
  // if: steps.changes.outputs.app == 'true'
  //
  // See https://github.com/dorny/paths-filter for more information.
  testForChangedFiles(changedFiles, headRef=null, baseRef=null)::
    [
      base.step('git safe directory', 'git config --global --add safe.directory $PWD'),
      base.action(
        'check-for-changes',
        uses='dorny/paths-filter@v2',
        id='changes',
        with={
               filters: |||
                 %s
               ||| % std.manifestYamlDoc(changedFiles),
               token: '${{ github.token }}',
             } +
             (if headRef != null then { ref: headRef } else {}) +
             (if baseRef != null then { base: baseRef } else {}),
      ),
    ],

  // Wait for the given jobs to finish.
  // Exits successfully if all jobs are successful, otherwise exits with an error.
  //
  // Parameters:
  // name: the name of the github job
  // jobs: a list of job names to wait for
  //
  // Returns:
  // a job that waits for the given jobs to finish
  awaitJob(name, jobs)::
    local dependingJobs = std.flatMap(
      function(job)
        local jobNameArray = std.objectFields(job);
        if std.length(jobNameArray) == 1 then [jobNameArray[0]] else [],
      jobs
    );
    [
      base.ghJob(
        'await-' + name,
        ifClause='${{ always() }}',
        needs=dependingJobs,
        useCredentials=false,
        steps=[
          base.step(
            'success',
            'exit 0',
            ifClause="${{ contains(join(needs.*.result, ','), 'success') }}"
          ),
          base.step(
            'failure',
            'exit 1',
            ifClause="${{ contains(join(needs.*.result, ','), 'failure') }}"
          ),
        ],
      ),
    ],

  // Post a job to a kubernetes cluster
  //
  // Parameters:
  // name: the name of the github job
  // job_name: the name of the job to be posted
  // cluster: the cluster to post the job to. This should be an object from the clusters module
  // image: the image to use for the job
  // environment: a map of environment variables to pass to the job
  // command: the command to run in the job (optional)
  // ifClause: the condition under which to run the job (optional)
  postJob(name, job_name, cluster, image, environment, command='', ifClause=null)::
    base.action(
      name,
      'docker://' + images.job_poster_image,
      ifClause=ifClause,
      env={
        JOB_NAME: job_name,
        IMAGE: image,
        COMMAND: command,
        ENVIRONMENT: std.join(' ', std.objectFields(environment)),
        GCE_JSON: cluster.secret,
        GKE_PROJECT: cluster.project,
        GKE_ZONE: cluster.zone,
        GKE_CLUSTER: cluster.name,
        NODESELECTOR_TYPE: cluster.jobNodeSelectorType,
      } + environment,
    ),

  // Auto approve PRs made by specific users. Usefull for renovate PRs.
  //
  // Parameters:
  // users: a list of users to auto approve PRs for. Defaults to gynzy-virko.
  autoApprovePRs(users=['gynzy-virko'])::
    base.pipeline(
      'auto-approve-prs',
      [
        base.ghJob(
          'auto-approve',
          steps=[
            base.action(
              'auto-approve-prs',
              'hmarr/auto-approve-action@v4',
            ),
          ],
          useCredentials=false,
          ifClause='${{ ' + std.join(' || ', std.map(function(user) "github.actor == '" + user + "'", users)) + ' }}',
        ),
      ],
      permissions={
        'pull-requests': 'write',
      },
      event={
        pull_request: { types: ['opened'] },
      },
    ),
}
