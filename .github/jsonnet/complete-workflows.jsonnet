{
  /*
    @param {string[]} repositories - The repositories to publish to
    @param {boolean} isPublicFork - Whether the repository is a public fork
    @param {boolean} checkVersionBump - Whether to assert if the version was bumped (recommended)
    @param {ghJob} testJob - a job to be ran during PR to assert tests. can be an array of jobs
    @param {string} branch - the branch to run the publish-prod job on
  */
  workflowJavascriptPackage(repositories=['gynzy'], isPublicFork=true, checkVersionBump=true, testJob=null, branch='main')::
    local runsOn = (if isPublicFork then 'ubuntu-latest' else null);

    $.pipeline(
      'misc',
      [$.verifyJsonnet(fetch_upstream=false, runsOn=runsOn)],
    ) +
    $.pipeline(
      'publish-prod',
      [
        $.yarnPublishJob(repositories=repositories, runsOn=runsOn),
      ],
      event={ push: { branches: [ branch ] } },
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
