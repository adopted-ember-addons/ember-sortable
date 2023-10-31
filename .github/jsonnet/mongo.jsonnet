{
  mongo_servers: {
    test: {
      type: 'mongo',
      name: 'test',
      connectionString: 'test-pri.kl1s6.gcp.mongodb.net',
      gke_cluster: 'test',
      gke_project: 'gynzy-test-project',
      gke_zone: 'europe-west4-b',
      password_secret: 'mongodb-pass-test',
      gce_json: $.secret('gce_new_test_json'),
      lifecycle: 'test',
      projectId: '5da5889579358e19bf4b16ea' // test
    },

    prod: {
      type: 'mongo',
      name: 'prod',
      connectionString: 'prod-pri.silfd.gcp.mongodb.net',
      projectId: '5dde7f71a6f239a82fa155f4', // prod
    },
    'board-prod': {
      type: 'mongo',
      name: 'board-prod',
      connectionString: 'board-prod-pri.silfd.mongodb.net',
      projectId: '5dde7f71a6f239a82fa155f4', // prod
    },
    'adaptive-learning-prod': {
      type: 'mongo',
      name: 'adaptive-learning-prod',
      connectionString: 'adaptive-learning-prod-pri.silfd.mongodb.net',
      projectId: '5dde7f71a6f239a82fa155f4', // prod
    },
    'accounts-prod': {
      type: 'mongo',
      name: 'accounts-prod',
      connectionString: 'accounts-prod-pri.silfd.mongodb.net',
      projectId: '5dde7f71a6f239a82fa155f4', // prod
    },
    'interaction-prod': {
      type: 'mongo',
      name: 'interaction-prod',
      connectionString: 'interaction-prod-pri.silfd.mongodb.net',
      projectId: '5dde7f71a6f239a82fa155f4', // prod
    },
  },

  copyMongoDatabase(mongoActionsOptions)::
    assert std.length(std.findSubstr('_pr_', mongoActionsOptions.MONGO_DST)) > 0;  // target db gets deleted. must contain _pr_

    $.action(
      'copy-mongo-db',
      $.mongo_action_image,
      env=mongoActionsOptions { TASK: 'clone' }
    ),

  deleteMongoPrDatabase(mongoActionsOptions)::
    assert std.length(std.findSubstr('_pr_', mongoActionsOptions.MONGO_DST)) > 0;  // target db gets deleted. must contain _pr_

    $.action(
      'delete-mongo-db',
      $.mongo_action_image,
      env=mongoActionsOptions { TASK: 'delete' }
    ),
}
