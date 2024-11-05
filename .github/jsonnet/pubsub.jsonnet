local base = import 'base.jsonnet';
local misc = import 'misc.jsonnet';
local yarn = import 'yarn.jsonnet';

{
  deletePrPubsubSubscribersJob(needs=null)::
    base.ghJob(
      'delete-pubsub-pr-subscribers',
      useCredentials=false,
      image='google/cloud-sdk:alpine',
      steps=[
        yarn.configureGoogleAuth(misc.secret('GCE_NEW_TEST_JSON')),
        base.step('install jq', 'apk add jq'),
        base.step('show auth', 'gcloud auth list'),
        base.step('wait for pod termination', 'sleep 60'),
        base.step(
          'delete subscriptions', "\n           gcloud --project gynzy-test-project pubsub subscriptions list --format json | jq -r '.[].name' | grep -- '-pr-${{ github.event.number }}' | xargs -r gcloud --project gynzy-test-project pubsub subscriptions delete"
        ),
      ],
      needs=needs,
    ),

}
