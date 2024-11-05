local base = import 'base.jsonnet';
local cache = import 'cache.jsonnet';
local images = import 'images.jsonnet';
local misc = import 'misc.jsonnet';

{
  yarn(ifClause=null, prod=false, workingDirectory=null)::
    base.step(
      'yarn' + (if prod then '-prod' else ''),
      run='yarn --cache-folder .yarncache --frozen-lockfile --prefer-offline' + (if prod then ' --prod' else '') + ' || yarn --cache-folder .yarncache --frozen-lockfile --prefer-offline' + (if prod then ' --prod' else ''),
      ifClause=ifClause,
      workingDirectory=workingDirectory
    ),

  setNpmToken(ifClause=null, workingDirectory=null):: self.setGynzyNpmToken(ifClause=ifClause, workingDirectory=workingDirectory),

  setGynzyNpmToken(ifClause=null, workingDirectory=null)::
    base.step(
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
        NPM_TOKEN: misc.secret('npm_token'),
      },
      ifClause=ifClause,
      workingDirectory=workingDirectory,
    ),

  setGithubNpmToken(ifClause=null, workingDirectory=null)::
    base.step(
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
        NODE_AUTH_TOKEN: misc.secret('GITHUB_TOKEN'),
      },
      ifClause=ifClause,
      workingDirectory=workingDirectory,
    ),

  checkoutAndYarn(cacheName=null, ifClause=null, fullClone=false, ref=null, prod=false, workingDirectory=null, source='gynzy')::
    misc.checkout(ifClause=ifClause, fullClone=fullClone, ref=ref) +
    (if source == 'gynzy' then self.setGynzyNpmToken(ifClause=ifClause, workingDirectory=workingDirectory) else []) +
    (if source == 'github' then self.setGithubNpmToken(ifClause=ifClause, workingDirectory=workingDirectory) else []) +
    (if cacheName == null then [] else self.fetchYarnCache(cacheName, ifClause=ifClause, workingDirectory=workingDirectory)) +
    self.yarn(ifClause=ifClause, prod=prod, workingDirectory=workingDirectory),

  fetchYarnCache(cacheName, ifClause=null, workingDirectory=null)::
    cache.fetchCache(
      cacheName=cacheName,
      folders=['.yarncache'],
      additionalCleanupCommands=["find . -type d -name 'node_modules' | xargs rm -rf"],
      ifClause=ifClause,
      workingDirectory=workingDirectory
    ),

  updateYarnCachePipeline(cacheName, appsDir='packages', image=null, useCredentials=null)::
    base.pipeline(
      'update-yarn-cache',
      [
        base.ghJob(
          'update-yarn-cache',
          image=image,
          useCredentials=useCredentials,
          ifClause="${{ github.event.deployment.environment == 'production' || github.event.deployment.environment == 'prod' }}",
          steps=[
            misc.checkout() +
            self.setGynzyNpmToken() +
            self.yarn(),
            base.action(
              'setup auth',
              'google-github-actions/auth@v2',
              with={
                credentials_json: misc.secret('SERVICE_JSON'),
              },
              id='auth',
            ),
            base.action('setup-gcloud', 'google-github-actions/setup-gcloud@v2'),
            cache.uploadCache(
              cacheName=cacheName,
              tarCommand='ls "' + appsDir + '/*/node_modules" -1 -d 2>/dev/null | xargs tar -c .yarncache node_modules',
            ),
          ],
        ),
      ],
      event='deployment',
    ),

  configureGoogleAuth(secret):: base.step(
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
    base.step(
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
        elif [[ "${GITHUB_REF_TYPE}" == "branch" && ( "${GITHUB_REF_NAME}" == "main" || "${GITHUB_REF_NAME}" == "master" ) ]] || [[ "${GITHUB_EVENT_NAME}" == "deployment" ]]; then
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
                   if repository == 'gynzy' then [self.setGynzyNpmToken(ifClause=ifClause), self.yarnPublish(isPr=isPr, ifClause=ifClause)]
                   else if repository == 'github' then [self.setGithubNpmToken(ifClause=ifClause), self.yarnPublish(isPr=isPr, ifClause=ifClause)]
                   else error 'Unknown repository type given.',
                 repositories)),


  yarnPublishPreviewJob(
    image='mirror.gcr.io/node:18',
    useCredentials=false,
    gitCloneRef='${{ github.event.pull_request.head.sha }}',
    buildSteps=[base.step('build', 'yarn build')],
    checkVersionBump=true,
    repositories=['gynzy'],
    onChangedFiles=false,
    changedFilesHeadRef=null,
    changedFilesBaseRef=null,
    runsOn=null,
  )::
    local ifClause = (if onChangedFiles != false then "steps.changes.outputs.package == 'true'" else null);
    base.ghJob(
      'yarn-publish-preview',
      runsOn=runsOn,
      image='mirror.gcr.io/node:18',
      useCredentials=false,
      steps=
      [self.checkoutAndYarn(ref=gitCloneRef, fullClone=false)] +
      (if onChangedFiles != false then misc.testForChangedFiles({ package: onChangedFiles }, headRef=changedFilesHeadRef, baseRef=changedFilesBaseRef) else []) +
      (if checkVersionBump then [
         base.action('check-version-bump', uses='del-systems/check-if-version-bumped@v1', with={
           token: '${{ github.token }}',
         }, ifClause=ifClause),
       ] else []) +
      (if onChangedFiles != false then std.map(function(step) std.map(function(s) s { 'if': ifClause }, step), buildSteps) else buildSteps) +
      self.yarnPublishToRepositories(isPr=true, repositories=repositories, ifClause=ifClause),
      permissions={ packages: 'write', contents: 'read', 'pull-requests': 'read' },
    ),

  yarnPublishJob(
    image='mirror.gcr.io/node:18',
    useCredentials=false,
    gitCloneRef='${{ github.sha }}',
    buildSteps=[base.step('build', 'yarn build')],
    repositories=['gynzy'],
    onChangedFiles=false,
    changedFilesHeadRef=null,
    changedFilesBaseRef=null,
    ifClause=null,
    runsOn=null,
  )::
    local stepIfClause = (if onChangedFiles != false then "steps.changes.outputs.package == 'true'" else null);
    base.ghJob(
      'yarn-publish',
      image='mirror.gcr.io/node:18',
      runsOn=runsOn,
      useCredentials=false,
      steps=
      [self.checkoutAndYarn(ref=gitCloneRef, fullClone=false)] +
      (if onChangedFiles != false then misc.testForChangedFiles({ package: onChangedFiles }, headRef=changedFilesHeadRef, baseRef=changedFilesBaseRef) else []) +
      (if onChangedFiles != false then std.map(function(step) std.map(function(s) s { 'if': stepIfClause }, step), buildSteps) else buildSteps) +
      self.yarnPublishToRepositories(isPr=false, repositories=repositories, ifClause=stepIfClause),
      permissions={ packages: 'write', contents: 'read', 'pull-requests': 'read' },
      ifClause=ifClause,
    ),
}
