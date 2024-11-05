local base = import 'base.jsonnet';
local images = import 'images.jsonnet';
local misc = import 'misc.jsonnet';
local yarn = import 'yarn.jsonnet';

{
  postReleaseToNewRelicJob(
    apps,
    cacheName=null,
    source='gynzy',
  )::
    base.ghJob(
      'post-newrelic-release',
      image='mirror.gcr.io/node:20.17',
      useCredentials=false,
      ifClause="${{ github.event.deployment.environment == 'production' }}",
      steps=[
        yarn.checkoutAndYarn(ref='${{ github.sha }}', cacheName=cacheName, source=source),
        base.step(
          'post-newrelic-release',
          'node .github/scripts/newrelic.js',
          env={
            NEWRELIC_API_KEY: misc.secret('NEWRELIC_API_KEY'),
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
