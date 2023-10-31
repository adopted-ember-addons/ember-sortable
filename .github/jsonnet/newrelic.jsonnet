{
  postReleaseToNewRelicJob(
    apps,

  )::
    $.ghJob(
      'post-newrelic-release',
      image=$.default_backend_nest_image,
      useCredentials=false,
      ifClause="${{ github.event.deployment.environment == 'production' }}",
      steps=[
        $.checkoutAndYarn(ref='${{ github.sha }}'),
        $.step(
          'post-newrelic-release',
          'node .github/scripts/newrelic.js',
          env={
            NEWRELIC_API_KEY: $.secret('NEWRELIC_API_KEY'),
            NEWRELIC_APPS: std.join(
              ' ', std.flatMap(
                function(app)
                  if std.objectHas(app, 'newrelicApps') then
                    app.newrelicApps else [],
                apps
              )
            ),
            GIT_COMMIT: '${{ github.sha }}',
            DRONE_SOURCE_BRANCH: '${{ github.event.deployment.payload.branch }}',
          }
        ),
      ],
    ),
}
