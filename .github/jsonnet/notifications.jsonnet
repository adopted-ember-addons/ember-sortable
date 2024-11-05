local base = import 'base.jsonnet';

{
  notifiyDeployFailure(channel='#dev-deployments', name='notify-failure', environment='production')::
    base.action(
      name,
      'act10ns/slack@v2',
      with={
        status: '${{ job.status }}',
        channel: channel,
        'webhook-url': '${{ secrets.SLACK_WEBHOOK_DEPLOY_NOTIFICATION }}',
        message: 'Deploy of job ${{ github.job }} to env: ' + environment + ' failed!',
      },
      ifClause='failure()',
    ),

  sendSlackMessage(channel='#dev-deployments', stepName='sendSlackMessage', message=null, ifClause=null)::
    base.action(
      stepName,
      'act10ns/slack@v2',
      with={
        status: 'starting',
        channel: channel,
        'webhook-url': '${{ secrets.SLACK_WEBHOOK_DEPLOY_NOTIFICATION }}',
        message: message,
      },
      ifClause=ifClause,
    ),

  // This action is used to create a deployment marker in New Relic.
  // GUID is the entity guid of the application in New Relic. It can be found by All Entities > (select service) > Metadata > Entity GUID
  newrelicCreateDeploymentMarker(stepName='newrelic-deployment', entityGuid)::
    base.action(
      stepName,
      'newrelic/deployment-marker-action@v2.5.0',
      with={
        apiKey: $.secret('NEWRELIC_API_KEY'),
        guid: entityGuid,
        commit: '${{ github.sha }}',
        version: '${{ github.sha }}',
      },
    ),
}
