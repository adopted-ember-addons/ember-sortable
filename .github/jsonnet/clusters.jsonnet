local misc = import 'misc.jsonnet';

{
  test: {
    project: 'gynzy-test-project',
    name: 'test',
    zone: 'europe-west4-b',
    secret: misc.secret('GCE_NEW_TEST_JSON'),
    jobNodeSelectorKey: 'type',
    jobNodeSelectorValue: 'preemptible',
  },

  prod: {
    project: 'unicorn-985',
    name: 'prod-europe-west4',
    zone: 'europe-west4',
    secret: misc.secret('GCE_JSON'),
    jobNodeSelectorKey: 'worker',
    jobNodeSelectorValue: 'true',
  },

  'gynzy-intern': {
    project: 'gynzy-intern',
    name: 'gynzy-intern',
    zone: 'europe-west4',
    secret: misc.secret('CONTINUOUS_DEPLOYMENT_GCE_JSON'),
    jobNodeSelectorKey: 'type',
    jobNodeSelectorValue: 'worker',
  },
}
