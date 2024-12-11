local base = import 'base.jsonnet';
local images = import 'images.jsonnet';

{
  database_servers: {
    test: {
      type: 'mysql',
      server: 'test-ams',
      region: 'europe-west4',
      project: 'unicorn-985',
      lifecycle: 'test',
    },
    'test-ams-8': {
      type: 'mysql',
      server: 'test-ams-8',
      region: 'europe-west4',
      project: 'unicorn-985',
      lifecycle: 'test',
    },
    'eu-w4-unicorn-production': {
      type: 'mysql',
      server: 'eu-w4-unicorn-production',
      region: 'europe-west4',
      project: 'unicorn-985',
    },
    'gynzy-test': {
      type: 'mysql',
      server: 'gynzy-test',
      region: 'europe-west4',
      project: 'gynzy-1090',
      lifecycle: 'test',
    },
    'gynzy-production': {
      type: 'mysql',
      server: 'gynzy-production',
      region: 'europe-west4',
      project: 'gynzy-1090',
    },
    'eu-w4-licenses-v8': {
      type: 'mysql',
      server: 'eu-w4-licenses-v8',
      region: 'europe-west4',
      project: 'unicorn-985',
    },
    'eu-w4-curriculum-v8': {
      type: 'mysql',
      server: 'eu-w4-curriculum-v8',
      region: 'europe-west4',
      project: 'unicorn-985',
    },
    'eu-w4-enrollments-v8': {
      type: 'mysql',
      server: 'eu-w4-enrollments-v8',
      region: 'europe-west4',
      project: 'unicorn-985',
    },
    'eu-w4-board-v8': {
      type: 'mysql',
      server: 'eu-w4-board-v8',
      region: 'europe-west4',
      project: 'unicorn-985',
    },
    'eu-w4-accounts-v8': {
      type: 'mysql',
      server: 'eu-w4-accounts-v8',
      region: 'europe-west4',
      project: 'unicorn-985',
    },
    'eu-w4-metrics-v8': {
      type: 'mysql',
      server: 'eu-w4-metrics-v8',
      region: 'europe-west4',
      project: 'unicorn-985',
    },
    'eu-w4-groups-v8': {
      type: 'mysql',
      server: 'eu-w4-groups-v8',
      region: 'europe-west4',
      project: 'unicorn-985',
    },
  },

  copyDatabase(mysqlActionOptions)::
    assert std.length(std.findSubstr('_pr_', mysqlActionOptions.database_name_target)) > 0;  // target db gets deleted. must contain _pr_

    // overwrite and set task to clone
    // delete database by setting it to null and calling prune afterwards
    local pluginOptions = std.prune(mysqlActionOptions { task: 'clone', database: null });

    base.action(
      'copy-database',
      images.mysql_action_image,
      with=pluginOptions
    ),

  deleteDatabase(mysqlActionOptions)::
    assert std.length(std.findSubstr('_pr_', mysqlActionOptions.database_name_target)) > 0;  // this fn deletes the database. destination db must contain _pr_

    // overwrite and set task to clone
    // delete database by setting it to null and calling prune afterwards
    local pluginOptions = std.prune(mysqlActionOptions { task: 'remove', database: null });

    base.action(
      'delete-database',
      images.mysql_action_image,
      with=pluginOptions
    ),
}
