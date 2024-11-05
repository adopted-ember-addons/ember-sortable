local base = import 'base.jsonnet';
local images = import 'images.jsonnet';
local misc = import 'misc.jsonnet';
local notifications = import 'notifications.jsonnet';
local yarn = import 'yarn.jsonnet';

local pulumiSetupSteps =
  base.action(
    'auth',
    uses='google-github-actions/auth@v2',
    id='auth',
    with={
      credentials_json: misc.secret('PULUMI_SERVICE_ACCOUNT'),
    }
  ) +
  base.action('setup-gcloud', uses='google-github-actions/setup-gcloud@v2') +
  base.action('pulumi-cli-setup', 'pulumi/actions@v5') +
  base.action('jsonnet-setup', 'kobtea/setup-jsonnet-action@v1');

{
  pulumiPreview(
    stack,
    pulumiDir=null,
    stepName='pulumi-preview-' + stack,
    environmentVariables={},
  )::
    base.action(
      name=stepName,
      uses='pulumi/actions@v5',
      with={
        command: 'preview',
        'stack-name': stack,
        'work-dir': pulumiDir,
        'comment-on-pr': true,
        'github-token': '${{ secrets.GITHUB_TOKEN }}',
        upsert: true,
        refresh: true,
      },
      env={
        PULUMI_CONFIG_PASSPHRASE: '${{ secrets.PULUMI_CONFIG_PASSPHRASE }}',
      } + environmentVariables,
    ),

  pulumiDeploy(
    stack,
    pulumiDir=null,
    stepName='pulumi-deploy-' + stack,
    environmentVariables={},
  )::
    base.action(
      name=stepName,
      uses='pulumi/actions@v5',
      with={
        command: 'up',
        'stack-name': stack,
        'work-dir': pulumiDir,
        upsert: true,
        refresh: true,
      },
      env={
        PULUMI_CONFIG_PASSPHRASE: '${{ secrets.PULUMI_CONFIG_PASSPHRASE }}',
      } + environmentVariables,
    ),

  pulumiDestroy(
    stack,
    pulumiDir=null,
    stepName='pulumi-destroy-' + stack,
    environmentVariables={},
  )::
    // pulumi destroy is a destructive operation, so we only want to run it on stacks that contain pr-
    assert std.length(std.findSubstr('pr-', stack)) > 0;

    base.action(
      name=stepName,
      uses='pulumi/actions@v5',
      with={
        command: 'destroy',
        remove: true,
        'stack-name': stack,
        'work-dir': pulumiDir,
        refresh: true,
      },
      env={
        PULUMI_CONFIG_PASSPHRASE: '${{ secrets.PULUMI_CONFIG_PASSPHRASE }}',
      } + environmentVariables,
    ),

  pulumiPreviewJob(
    stack,
    pulumiDir=null,
    yarnDir=null,
    gitCloneRef='${{ github.event.pull_request.head.sha }}',
    cacheName=null,
    image=images.default_pulumi_node_image,
    yarnNpmSource=null,
    environmentVariables={},
    additionalSetupSteps=[],
  )::
    base.ghJob(
      'pulumi-preview-' + stack,
      image=image,
      useCredentials=false,
      steps=[
        yarn.checkoutAndYarn(ref=gitCloneRef, cacheName=cacheName, fullClone=false, workingDirectory=yarnDir, source=yarnNpmSource),
        pulumiSetupSteps,
        additionalSetupSteps,
        self.pulumiPreview(stack, pulumiDir=pulumiDir, environmentVariables=environmentVariables),
      ],
    ),

  pulumiPreviewTestJob(
    stack='test',
    pulumiDir=null,
    yarnDir=null,
    yarnNpmSource=null,
    gitCloneRef='${{ github.event.pull_request.head.sha }}',
    cacheName=null,
    image=images.default_pulumi_node_image,
    environmentVariables={},
    additionalSetupSteps=[],
  )::
    self.pulumiPreviewJob(
      stack,
      pulumiDir=pulumiDir,
      yarnDir=yarnDir,
      yarnNpmSource=yarnNpmSource,
      gitCloneRef=gitCloneRef,
      cacheName=cacheName,
      image=image,
      environmentVariables=environmentVariables,
      additionalSetupSteps=additionalSetupSteps,
    ),

  pulumiPreviewProdJob(
    stack='prod',
    pulumiDir=null,
    yarnDir=null,
    yarnNpmSource=null,
    gitCloneRef='${{ github.event.pull_request.head.sha }}',
    cacheName=null,
    image=images.default_pulumi_node_image,
    environmentVariables={},
    additionalSetupSteps=[],
  )::
    self.pulumiPreviewJob(
      stack,
      pulumiDir=pulumiDir,
      yarnDir=yarnDir,
      yarnNpmSource=yarnNpmSource,
      gitCloneRef=gitCloneRef,
      cacheName=cacheName,
      image=image,
      environmentVariables=environmentVariables,
      additionalSetupSteps=additionalSetupSteps,
    ),

  pulumiPreviewTestAndProdJob(
    pulumiDir=null,
    yarnDir=null,
    yarnNpmSource=null,
    gitCloneRef='${{ github.event.pull_request.head.sha }}',
    cacheName=null,
    image=images.default_pulumi_node_image,
    productionStack='prod',
    testStack='test',
    environmentVariables={},
    additionalSetupSteps=[],
  )::
    base.ghJob(
      'pulumi-preview',
      image=image,
      useCredentials=false,
      steps=[
        yarn.checkoutAndYarn(ref=gitCloneRef, cacheName=cacheName, fullClone=false, workingDirectory=yarnDir, source=yarnNpmSource),
        pulumiSetupSteps,
        additionalSetupSteps,
        self.pulumiPreview(testStack, pulumiDir=pulumiDir, environmentVariables=environmentVariables),
        self.pulumiPreview(productionStack, pulumiDir=pulumiDir, environmentVariables=environmentVariables),
      ],
    ),

  pulumiDeployJob(
    stack,
    pulumiDir=null,
    yarnDir=null,
    yarnNpmSource=null,
    gitCloneRef='${{ github.sha }}',
    cacheName=null,
    ifClause=null,
    image=images.default_pulumi_node_image,
    jobName='pulumi-deploy-' + stack,
    notifyOnFailure=true,
    environmentVariables={},
    additionalSetupSteps=[],
  )::
    base.ghJob(
      name=jobName,
      ifClause=ifClause,
      image=image,
      useCredentials=false,
      steps=[
        yarn.checkoutAndYarn(ref=gitCloneRef, cacheName=cacheName, fullClone=false, workingDirectory=yarnDir, source=yarnNpmSource),
        pulumiSetupSteps,
        additionalSetupSteps,
        self.pulumiDeploy(stack, pulumiDir=pulumiDir, stepName=jobName, environmentVariables=environmentVariables),
        if notifyOnFailure then notifications.notifiyDeployFailure(environment=stack) else [],
      ]
    ),

  pulumiDeployTestJob(
    stack='test',
    pulumiDir=null,
    yarnDir=null,
    yarnNpmSource=null,
    gitCloneRef='${{ github.sha }}',
    cacheName=null,
    image=images.default_pulumi_node_image,
    ifClause="${{ github.event.deployment.environment == 'test' }}",
    environmentVariables={},
    additionalSetupSteps=[],
  )::
    self.pulumiDeployJob(
      stack,
      pulumiDir=pulumiDir,
      yarnDir=yarnDir,
      yarnNpmSource=yarnNpmSource,
      gitCloneRef=gitCloneRef,
      cacheName=cacheName,
      ifClause=ifClause,
      image=image,
      environmentVariables=environmentVariables,
      additionalSetupSteps=additionalSetupSteps,
    ),

  pulumiDeployProdJob(
    stack='prod',
    pulumiDir=null,
    yarnDir=null,
    yarnNpmSource=null,
    gitCloneRef='${{ github.sha }}',
    cacheName=null,
    image=images.default_pulumi_node_image,
    ifClause="${{ github.event.deployment.environment == 'prod' || github.event.deployment.environment == 'production' }}",
    environmentVariables={},
    additionalSetupSteps=[],
  )::
    self.pulumiDeployJob(
      stack,
      pulumiDir=pulumiDir,
      yarnDir=yarnDir,
      yarnNpmSource=yarnNpmSource,
      gitCloneRef=gitCloneRef,
      cacheName=cacheName,
      ifClause=ifClause,
      image=image,
      environmentVariables=environmentVariables,
      additionalSetupSteps=additionalSetupSteps,
    ),

  pulumiDestroyJob(
    stack,
    pulumiDir=null,
    yarnDir=null,
    yarnNpmSource=null,
    gitCloneRef='${{ github.sha }}',
    cacheName=null,
    ifClause=null,
    image=images.default_pulumi_node_image,
    jobName='pulumi-destroy-' + stack,
    notifyOnFailure=true,
    environmentVariables={},
    additionalSetupSteps=[],
  )::
    base.ghJob(
      name=jobName,
      ifClause=ifClause,
      image=image,
      useCredentials=false,
      steps=[
        yarn.checkoutAndYarn(ref=gitCloneRef, cacheName=cacheName, fullClone=false, workingDirectory=yarnDir, source=yarnNpmSource),
        pulumiSetupSteps,
        additionalSetupSteps,
        self.pulumiDestroy(stack, pulumiDir=pulumiDir, stepName=jobName, environmentVariables=environmentVariables),
        if notifyOnFailure then notifications.notifiyDeployFailure(environment=stack) else [],
      ],
    ),


  pulumiDefaultPipeline(
    pulumiDir='.',
    yarnDir=null,
    yarnNpmSource=null,
    cacheName=null,
    deployTestWithProd=false,
    image=images.default_pulumi_node_image,
    testStack='test',
    productionStack='prod',
    environmentVariables={},
    additionalSetupSteps=[],
  )::
    base.pipeline(
      'pulumi-preview',
      [
        self.pulumiPreviewTestAndProdJob(
          pulumiDir=pulumiDir,
          yarnDir=yarnDir,
          yarnNpmSource=yarnNpmSource,
          cacheName=cacheName,
          image=image,
          productionStack=productionStack,
          testStack=testStack,
          environmentVariables=environmentVariables,
          additionalSetupSteps=additionalSetupSteps,
        ),
      ],
    ) +
    base.pipeline(
      'pulumi-deploy',
      [
        self.pulumiDeployTestJob(
          pulumiDir=pulumiDir,
          yarnDir=yarnDir,
          yarnNpmSource=yarnNpmSource,
          cacheName=cacheName,
          image=image,
          environmentVariables=environmentVariables,
          additionalSetupSteps=additionalSetupSteps,
          ifClause=if deployTestWithProd then "${{ github.event.deployment.environment == 'test' || github.event.deployment.environment == 'prod' || github.event.deployment.environment == 'production' }}" else "${{ github.event.deployment.environment == 'test' }}"
        ),
        self.pulumiDeployProdJob(
          pulumiDir=pulumiDir,
          yarnDir=yarnDir,
          yarnNpmSource=yarnNpmSource,
          cacheName=cacheName,
          image=image,
          stack=productionStack,
          environmentVariables=environmentVariables,
          additionalSetupSteps=additionalSetupSteps,
        ),
      ],
      event='deployment',
    ),
}
