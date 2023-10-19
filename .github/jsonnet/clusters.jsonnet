{
  clusters: {
    test: {
      project: 'gynzy-test-project',
      name: 'test',
      zone: 'europe-west4-b',
      secret: '${{ secrets.GCE_NEW_TEST_JSON }}',
    },

    prod: {
      project: 'unicorn-985',
      name: 'prod-europe-west4',
      zone: 'europe-west4',
      secret: '${{ secrets.GCE_JSON }}',
    },

    'gynzy-intern': {
      project: 'gynzy-intern',
      name: 'gynzy-intern',
      zone: 'europe-west4',
      secret: '${{ secrets.CONTINUOUS_DEPLOYMENT_GCE_JSON }}',
    },
  },
}
