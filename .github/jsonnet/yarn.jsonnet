{
  yarn(ifClause=null, prod=false, workingDirectory=null)::
    $.step(
      'yarn' + (if prod then '-prod' else ''),
      run='yarn --cache-folder .yarncache --frozen-lockfile --prefer-offline' + (if prod then ' --prod' else '') + ' || yarn --cache-folder .yarncache --frozen-lockfile --prefer-offline' + (if prod then ' --prod' else ''),
      ifClause=ifClause,
      workingDirectory=workingDirectory
    ),

  setNpmToken(ifClause=null, workingDirectory=null):: $.setGynzyNpmToken(ifClause=ifClause, workingDirectory=workingDirectory),

  setGynzyNpmToken(ifClause=null, workingDirectory=null)::
    $.step(
      'set gynzy npm_token',
      run=
      |||
        cat <<EOF > .npmrc
        registry=https://npm.gynzy.net/
        always-auth="true"
        "//npm.gynzy.net/:_authToken"="${NPM_TOKEN}"
        EOF
      |||,
      env={
        NPM_TOKEN: $.secret('npm_token'),
      },
      ifClause=ifClause,
      workingDirectory=workingDirectory,
    ),

  setGithubNpmToken(ifClause=null, workingDirectory=null)::
    $.step(
      'set github npm_token',
      run=
      |||
        cat <<EOF > .npmrc
        @gynzy:registry=https://npm.pkg.github.com
        always-auth=true
        //npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
        EOF
      |||,
      env={
        NODE_AUTH_TOKEN: $.secret('GITHUB_TOKEN'),
      },
      ifClause=ifClause,
      workingDirectory=workingDirectory,
    ),

  checkoutAndYarn(cacheName=null, ifClause=null, fullClone=false, ref=null, prod=false, workingDirectory=null)::
    $.checkout(ifClause=ifClause, fullClone=fullClone, ref=ref) +
    $.setGynzyNpmToken(ifClause=ifClause, workingDirectory=workingDirectory) +
    (if cacheName == null then [] else $.fetchYarnCache(cacheName, ifClause=ifClause, workingDirectory=workingDirectory)) +
    $.yarn(ifClause=ifClause, prod=prod, workingDirectory=workingDirectory),

  fetchYarnCache(cacheName, ifClause=null, workingDirectory=null):: $.step(
    'download yarn cache',
    run=
    |||
      set +e;
      echo "Downloading yarn cache && node_modules"
      wget -q -O - "https://storage.googleapis.com/files-gynzy-com-test/yarn-cache/${CACHE_NAME}.tar.gz" | tar xfz -
      if [ $? -ne 0 ]; then
        # download failed. cleanup node_modules because it can contain a yarn integrity file but not have all the data as specified
        echo "Cache download failed, cleanup up caches and run yarn without cache"
        find . -type d -name 'node_modules' | xargs rm -rf
        rm -rf .yarncache
        echo "Cleanup complete"
      else
        echo "Finished downloading yarn cache && node_modules"
      fi
    |||,
    ifClause=ifClause,
    workingDirectory=workingDirectory,
    env={
      CACHE_NAME: cacheName,
    },
  ),

  updateYarnCachePipeline(cacheName, appsDir='packages', image=null, useCredentials=null)::
    $.pipeline(
      'update-yarn-cache',
      [
        $.ghJob(
          'update-yarn-cache',
          image=image,
          useCredentials=useCredentials,
          ifClause="${{ github.event.deployment.environment == 'production' || github.event.deployment.environment == 'prod' }}",
          steps=[
            $.checkout() +
            $.setGynzyNpmToken() +
            $.yarn(),
            $.action(
              'setup auth',
              'google-github-actions/auth@v1',
              with={
                credentials_json: $.secret('SERVICE_JSON'),
              },
              id='auth',
            ),
            $.action('setup-gcloud', 'google-github-actions/setup-gcloud@v0'),
            $.step(
              'upload-yarn-cache',
              |||
                set -e

                echo "Creating cache archive"
                # v1
                ls "${APPS_DIR}/*/node_modules" -1 -d 2>/dev/null | xargs tar -czf "${CACHE_NAME}.tar.gz" .yarncache node_modules

                echo "Upload cache"
                gsutil cp "${CACHE_NAME}.tar.gz" "gs://files-gynzy-com-test/yarn-cache/${CACHE_NAME}.tar.gz.tmp"
                gsutil mv "gs://files-gynzy-com-test/yarn-cache/${CACHE_NAME}.tar.gz.tmp" "gs://files-gynzy-com-test/yarn-cache/${CACHE_NAME}.tar.gz"

                echo "Upload finished"
              |||,
              env={
                CACHE_NAME: cacheName,
                APPS_DIR: appsDir,
              }
            ),
          ],
        ),
      ],
      event='deployment',
    ),

  configureGoogleAuth(secret):: $.step(
    'activate google service account',
    run=
    |||
      printf '%s' "${SERVICE_JSON}" > gce.json;
      gcloud auth activate-service-account --key-file=gce.json;
      gcloud --quiet auth configure-docker;
      rm gce.json
    |||,
    env={ SERVICE_JSON: secret },
  ),

  yarnPublish(isPr=true, ifClause=null)::
    $.step(
      'publish',
      |||
        bash -c 'set -xeo pipefail;

        cp package.json package.json.bak;

        VERSION=$(yarn version --non-interactive 2>/dev/null | grep "Current version" | grep -o -P '[0-9a-zA-Z_.-]+$' );
        if [[ ! -z "${PR_NUMBER}" ]]; then
          echo "Setting tag/version for pr build.";
          TAG=pr-$PR_NUMBER;
          PUBLISHVERSION="$VERSION-pr$PR_NUMBER.$GITHUB_RUN_NUMBER";
        elif [[ "${GITHUB_REF_TYPE}" == "tag" ]]; then
          if [[ "${GITHUB_REF_NAME}" != "${VERSION}" ]]; then
            echo "Tag version does not match package version. They should match. Exiting";
            exit 1;
          fi
          echo "Setting tag/version for release/tag build.";
          PUBLISHVERSION=$VERSION;
          TAG="latest";
        elif [[ "${GITHUB_REF_TYPE}" == "branch" && "${GITHUB_REF_NAME}" == "main" ]] || [[ "${GITHUB_EVENT_NAME}" == "deployment" ]]; then
          echo "Setting tag/version for release/tag build.";
          PUBLISHVERSION=$VERSION;
          TAG="latest";
        else
          exit 1
        fi

        yarn publish --non-interactive --no-git-tag-version --tag "$TAG" --new-version "$PUBLISHVERSION";

        mv package.json.bak package.json;
        ';
      |||,
      env={} + (if isPr then { PR_NUMBER: '${{ github.event.number }}' } else {}),
      ifClause=ifClause,
    ),

  yarnPublishToRepositories(isPr, repositories, ifClause=null)::
    (std.flatMap(function(repository)
                   if repository == 'gynzy' then [$.setGynzyNpmToken(ifClause=ifClause), $.yarnPublish(isPr=isPr, ifClause=ifClause)]
                   else if repository == 'github' then [$.setGithubNpmToken(ifClause=ifClause), $.yarnPublish(isPr=isPr, ifClause=ifClause)]
                   else error 'Unknown repository type given.',
                 repositories)),


  yarnPublishPreviewJob(
    image='node:18',
    useCredentials=false,
    gitCloneRef='${{ github.event.pull_request.head.sha }}',
    buildSteps=[$.step('build', 'yarn build')],
    checkVersionBump=true,
    repositories=['gynzy'],
    onChangedFiles=false,
    changedFilesHeadRef=null,
    changedFilesBaseRef=null,
    runsOn=null,
  ):
    local ifClause = (if onChangedFiles != false then "steps.changes.outputs.package == 'true'" else null);
    $.ghJob(
      'yarn-publish-preview',
      runsOn=runsOn,
      image='node:18',
      useCredentials=false,
      steps=
      [$.checkoutAndYarn(ref=gitCloneRef, fullClone=false)] +
      (if onChangedFiles != false then $.testForChangedFiles({ package: onChangedFiles }, headRef=changedFilesHeadRef, baseRef=changedFilesBaseRef) else []) +
      (if checkVersionBump then [
         $.action('check-version-bump', uses='del-systems/check-if-version-bumped@v1', with={
           token: '${{ github.token }}',
         }, ifClause=ifClause),
       ] else []) +
      (if onChangedFiles != false then std.map(function(step) std.map(function(s) s { 'if': ifClause }, step), buildSteps) else buildSteps) +
      $.yarnPublishToRepositories(isPr=true, repositories=repositories, ifClause=ifClause),
      permissions={ packages: 'write', contents: 'read', 'pull-requests': 'read' },
    ),

  yarnPublishJob(
    image='node:18',
    useCredentials=false,
    gitCloneRef='${{ github.sha }}',
    buildSteps=[$.step('build', 'yarn build')],
    repositories=['gynzy'],
    onChangedFiles=false,
    changedFilesHeadRef=null,
    changedFilesBaseRef=null,
    ifClause=null,
    runsOn=null,
  ):
    local stepIfClause = (if onChangedFiles != false then "steps.changes.outputs.package == 'true'" else null);
    $.ghJob(
      'yarn-publish',
      image='node:18',
      runsOn=runsOn,
      useCredentials=false,
      steps=
      [$.checkoutAndYarn(ref=gitCloneRef, fullClone=false)] +
      (if onChangedFiles != false then $.testForChangedFiles({ package: onChangedFiles }, headRef=changedFilesHeadRef, baseRef=changedFilesBaseRef) else []) +
      (if onChangedFiles != false then std.map(function(step) std.map(function(s) s { 'if': stepIfClause }, step), buildSteps) else buildSteps) +
      $.yarnPublishToRepositories(isPr=false, repositories=repositories, ifClause=stepIfClause),
      permissions={ packages: 'write', contents: 'read', 'pull-requests': 'read' },
      ifClause=ifClause,
    ),
}
