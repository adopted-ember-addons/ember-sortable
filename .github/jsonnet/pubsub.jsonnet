{
  deletePrPubsubSubscribersJob(needs=null)::
    $.ghJob(
      'delete-pubsub-pr-subscribers',
      useCredentials=false,
      image='google/cloud-sdk:alpine',
      steps=[
        $.configureGoogleAuth($.secret('GCE_NEW_TEST_JSON')),
        $.step('install jq', 'apk add jq'),
        $.step('show auth', 'gcloud auth list'),
        $.step('wait for pod termination', 'sleep 60'),
        $.step(
          'delete subscriptions', "\n           gcloud --project gynzy-test-project pubsub subscriptions list --format json | jq -r '.[].name' | grep -- '-pr-${{ github.event.number }}' | xargs -r gcloud --project gynzy-test-project pubsub subscriptions delete"
        ),
      ],
      needs=needs,
    ),

}
