{
  /*
    @param {string[]} repositories - The repositories to publish to
    @param {boolean} isPublicFork - Whether the repository is a public fork
  */
  workflowJavascriptPackage(repositories=['gynzy'], isPublicFork=true, runTest=false, checkVersionBump=true)::
    local runsOn = (if isPublicFork then 'ubuntu-latest' else null);

    $.pipeline(
      'misc',
      [$.verifyJsonnet(fetch_upstream=false, runsOn=runsOn)],
    ) +
    $.pipeline(
      'publish-prod',
      [
        $.yarnPublishJob(repositories, runsOn=runsOn),
      ],
      event={ push: { branches: ['${{ github.event.pull_request.base.ref }}'] } },
    ) +
    $.pipeline(
      'pr',
      [
        $.yarnPublishPreviewJob(repositories=repositories, runsOn=runsOn, checkVersionBump=checkVersionBump),
      ] +
      (if runTest then
         [$.ghJob(
           'test',
           runsOn=runsOn,
           image='node:18',
           useCredentials=false,
           steps=[
             $.checkoutAndYarn(ref='${{ github.event.pull_request.head.ref }}'),
             $.step('test', 'yarn test'),
           ]
         )]
       else [])
    ),
}
