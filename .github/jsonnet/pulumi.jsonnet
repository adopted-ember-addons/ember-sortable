{
  local pulumiSetupSteps = [
    $.action(
      'auth',
      uses='google-github-actions/auth@v1',
      id='auth',
      with={
        credentials_json: $.secret('PULUMI_SERVICE_ACCOUNT'),
      }
    ),
    $.action('setup-gcloud', uses='google-github-actions/setup-gcloud@v0'),
    $.action('pulumi-cli-setup', 'pulumi/actions@v4'),
  ],

  pulumiPreview(
    stack,
    pulumiDir=null,
  ): $.action(
    'pulumi-preview-' + stack,
    uses='pulumi/actions@v4',
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
    }
  ),

  pulumiPreviewJob(
    stack,
    pulumiDir=null,
    yarnDir=null,
    gitCloneRef='${{ github.event.pull_request.head.sha }}',
    cacheName=null,
  ): $.ghJob(
    'pulumi-preview-' + stack,
    image='node:18',
    useCredentials=false,
    steps=[$.checkoutAndYarn(ref=gitCloneRef, cacheName=cacheName, fullClone=false, workingDirectory=yarnDir)] +
          pulumiSetupSteps +
          [$.pulumiPreview(stack, pulumiDir=pulumiDir)],
  ),

  pulumiPreviewTestJob(
    stack='test',
    pulumiDir=null,
    yarnDir=null,
    gitCloneRef='${{ github.event.pull_request.head.sha }}',
    cacheName=null,
  ): $.pulumiPreviewJob(stack, pulumiDir=pulumiDir, yarnDir=yarnDir, gitCloneRef=gitCloneRef, cacheName=cacheName),

  pulumiPreviewProdJob(
    stack='prod',
    pulumiDir=null,
    yarnDir=null,
    gitCloneRef='${{ github.event.pull_request.head.sha }}',
    cacheName=null,
  ): $.pulumiPreviewJob(stack, pulumiDir=pulumiDir, yarnDir=yarnDir, gitCloneRef=gitCloneRef, cacheName=cacheName),

  pulumiPreviewTestAndProdJob(
    pulumiDir=null,
    yarnDir=null,
    gitCloneRef='${{ github.event.pull_request.head.sha }}',
    cacheName=null,
  ): $.ghJob(
    'pulumi-preview',
    image='node:18',
    useCredentials=false,
    steps=[$.checkoutAndYarn(ref=gitCloneRef, cacheName=cacheName, fullClone=false, workingDirectory=yarnDir)] +
          pulumiSetupSteps +
          [
            $.pulumiPreview('test', pulumiDir=pulumiDir),
            $.pulumiPreview('prod', pulumiDir=pulumiDir),
          ],
  ),

  pulumiDeployJob(
    stack,
    pulumiDir=null,
    yarnDir=null,
    gitCloneRef='${{ github.sha }}',
    cacheName=null,
    ifClause=null,
  ): $.ghJob(
    'pulumi-deploy-' + stack,
    ifClause=ifClause,
    image='node:18',
    useCredentials=false,
    steps=[$.checkoutAndYarn(ref=gitCloneRef, cacheName=cacheName, fullClone=false, workingDirectory=yarnDir)] +
          pulumiSetupSteps +
          [
            $.action(
              'pulumi-deploy-' + stack,
              uses='pulumi/actions@v4',
              with={
                command: 'up',
                'stack-name': stack,
                'work-dir': pulumiDir,
                upsert: true,
                refresh: true,
              },
              env={
                PULUMI_CONFIG_PASSPHRASE: '${{ secrets.PULUMI_CONFIG_PASSPHRASE }}',
              }
            ),
            $.notifiyDeployFailure(),
          ],
  ),

  pulumiDeployTestJob(
    stack='test',
    pulumiDir=null,
    yarnDir=null,
    gitCloneRef='${{ github.sha }}',
    cacheName=null,
    ifClause="${{ github.event.deployment.environment == 'test' }}",
  ): $.pulumiDeployJob(stack, pulumiDir=pulumiDir, yarnDir=yarnDir, gitCloneRef=gitCloneRef, cacheName=cacheName, ifClause=ifClause),

  pulumiDeployProdJob(
    stack='prod',
    pulumiDir=null,
    yarnDir=null,
    gitCloneRef='${{ github.sha }}',
    cacheName=null,
    ifClause="${{ github.event.deployment.environment == 'prod' || github.event.deployment.environment == 'production' }}",
  ): $.pulumiDeployJob(stack, pulumiDir=pulumiDir, yarnDir=yarnDir, gitCloneRef=gitCloneRef, cacheName=cacheName, ifClause=ifClause),

  pulumiDefaultPipeline(
    pulumiDir='.',
    yarnDir=null,
    cacheName=null,
    deployTestWithProd=false,
  ):
    $.pipeline(
      'pulumi-preview',
      [
        $.pulumiPreviewTestAndProdJob(pulumiDir=pulumiDir, yarnDir=yarnDir, cacheName=cacheName),
      ],
    ) +
    $.pipeline(
      'pulumi-deploy',
      [
        $.pulumiDeployTestJob(pulumiDir=pulumiDir, yarnDir=yarnDir, cacheName=cacheName, ifClause=if deployTestWithProd then "${{ github.event.deployment.environment == 'test' || github.event.deployment.environment == 'prod' || github.event.deployment.environment == 'production' }}" else "${{ github.event.deployment.environment == 'test' }}"),
        $.pulumiDeployProdJob(pulumiDir=pulumiDir, yarnDir=yarnDir, cacheName=cacheName),
      ],
      event='deployment',
    ),
}
