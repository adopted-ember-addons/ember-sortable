{
  /*
    @param {string[]} repositories - The repositories to publish to
    @param {boolean} isPublicFork - Whether the repository is a public fork
    @param {boolean} checkVersionBump - Whether to assert if the version was bumped (recommended)
    @param {ghJob} testJob - a job to be ran during PR to assert tests. can be an array of jobs
  */
  workflowJavascriptPackage(repositories=['gynzy'], isPublicFork=true, checkVersionBump=true, testJob=null)::
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
      (if testJob != null then
         [testJob]
       else [])
    ),
}
