{
  notifiyDeployFailure(channel='#dev-deployments', name='notify-failure', environment='production')::
    $.action(
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
    $.action(
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
}
