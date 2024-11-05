local base = import 'base.jsonnet';
local clusters = import 'clusters.jsonnet';
local images = import 'images.jsonnet';
local misc = import 'misc.jsonnet';

local testProjectId = '5da5889579358e19bf4b16ea';
local prodProjectId = '5dde7f71a6f239a82fa155f4';

// clusterId can be found in the collections-page url:
// https://cloud.mongodb.com/v2/<projectId>#/metrics/replicaSet/<clusterId>/explorer

local testProjectSettings = {
  projectId: testProjectId,
  gke_cluster: clusters.test,
  CIUsername: 'github-actions',
  CIPassword: misc.secret('MONGO_CI_PASSWORD_TEST'),
  lifecycle: 'test',
  type: 'mongodb',
};
local prodProjectSettings = {
  projectId: prodProjectId,
  gke_cluster: clusters.prod,
  CIUsername: 'github-actions',
  CIPassword: misc.secret('MONGO_CI_PASSWORD_PROD'),
  lifecycle: 'prod',
  type: 'mongodb',
};

{
  // List of available MongoDB clusters.
  mongo_clusters: {
    test: testProjectSettings {
      name: 'test',
      connectionString: 'test-pri.kl1s6.gcp.mongodb.net',
      clusterId: '5db8186b79358e06a806d134',
    },

    prod: prodProjectSettings {
      name: 'prod',
      connectionString: 'prod-pri.silfd.gcp.mongodb.net',
      clusterId: '5dde8398cf09a237555dda74',
      description: 'This cluster contains data for the scores service. It was the first mongoCluster created, and unfortunately named "prod".',
    },
    'board-prod': prodProjectSettings {
      name: 'board-prod',
      connectionString: 'board-prod-pri.silfd.mongodb.net',
      clusterId: '61b0820f1ddfbc0366c41ddc',
    },
    'adaptive-learning-prod': prodProjectSettings {
      name: 'adaptive-learning-prod',
      connectionString: 'adaptive-learning-prod-pri.silfd.mongodb.net',
      clusterId: '6239cfa3b065b60fe7af89bb',
    },
    'accounts-prod': prodProjectSettings {
      name: 'accounts-prod',
      connectionString: 'accounts-prod-pri.silfd.mongodb.net',
      clusterId: '6322ef3b3f5f105b67ecb904',
    },
    'interaction-prod': prodProjectSettings {
      name: 'interaction-prod',
      connectionString: 'interaction-prod-pri.silfd.mongodb.net',
      clusterId: '63d7bfaf42209e2ca71398ce',
    },
    'answers-prod': prodProjectSettings {
      name: 'answers-prod',
      connectionString: 'answers-prod-pri.silfd.mongodb.net',
      clusterId: '5dde7f71a6f239a82fa155f4',
    },
  },
  // TODO: remove
  mongo_servers: self.mongo_clusters,

  // Generate a deeplink to the Atlas UI for a given cluster and database.
  //
  // If the database is null, the link will point to the cluster overview.
  // Otherwise, it will point to the database explorer.
  //
  // Parameters:
  // cluster: The MongoDB cluster. One of the objects from the mongo_servers list.
  // database: The name of the database (optional).
  //
  // Returns:
  // string The deeplink to the Atlas UI.
  atlasDeeplink(mongoCluster, database=null)::
    if database == null || mongoCluster.clusterId == null then
      'https://cloud.mongodb.com/v2/' + mongoCluster.projectId + '#clusters/detail/' + mongoCluster.name
    else
      'https://cloud.mongodb.com/v2/' + mongoCluster.projectId + '#/metrics/replicaSet/' + mongoCluster.clusterId + '/explorer/' + database,

  // Copy a MongoDB database to a new database.
  // It does this by posting a job that runs the mongo-action image with the clone task.
  //
  // Parameters:
  // service: The name of the service.
  // mongoCluster: The MongoDB cluster to connect to. One of the objects from the mongo_servers list.
  // testDatabase: The name of the source database.
  // prDatabase: The name of the PR database.
  //
  // Returns:
  // The job definition.
  copyMongoDatabase(service, mongoCluster, testDatabase, prDatabase)::
    assert std.length(std.findSubstr('_pr_', prDatabase)) > 0;  // target db gets deleted. must contain _pr_

    misc.postJob(
      name='copy-mongo-db',
      job_name='mongo-copy-' + service + '-${{ github.run_number }}-${{ github.run_attempt }}',
      cluster=mongoCluster.gke_cluster,
      image=images.mongo_job_image,
      environment={
        TASK: 'clone',
        MONGO_SRC: testDatabase,
        MONGO_DST: prDatabase,
        MONGO_HOST: mongoCluster.connectionString,
        MONGO_USER: mongoCluster.CIUsername,
        MONGO_PASS: mongoCluster.CIPassword,
      },
    ),

  // Delete a MongoDB PR database.
  // It does this by posting a job that runs the mongo-action image with the delete task.
  //
  // Parameters:
  // service: The name of the service.
  // mongoCluster: The MongoDB cluster to connect to. One of the objects from the mongo_servers list.
  // prDatabase: The name of the PR database.
  //
  // Returns:
  // The job definition.
  deleteMongoPrDatabase(service, mongoCluster, prDatabase)::
    assert std.length(std.findSubstr('_pr_', prDatabase)) > 0;  // target db gets deleted. must contain _pr_

    misc.postJob(
      name='delete-mongo-db',
      job_name='mongo-delete-' + service + '-${{ github.run_number }}-${{ github.run_attempt }}',
      cluster=mongoCluster.gke_cluster,
      image=images.mongo_job_image,
      environment={
        TASK: 'delete',
        MONGO_DST: prDatabase,
        MONGO_HOST: mongoCluster.connectionString,
        MONGO_USER: mongoCluster.CIUsername,
        MONGO_PASS: mongoCluster.CIPassword,
      },
    ),
  // Sync the indexes of a MongoDB database with the current codebase.
  //
  // Parameters:
  // service: The name of the service.
  // image: The name of the Docker image to use.
  // mongoCluster: The MongoDB cluster to connect to. One of the objects from the mongo_servers list.
  // database: The name of the database.
  // ifClause: The condition to run the job.
  //
  // Returns:
  // The job definition.
  mongoSyncIndexes(service, image, mongoCluster, database, ifClause=null)::
    misc.postJob(
      name='sync-mongo-indexes-' + mongoCluster.name + '-' + database,
      job_name='mongo-sync-' + service + '-${{ github.run_number }}-${{ github.run_attempt }}',
      cluster=mongoCluster.gke_cluster,
      image=image,
      environment={
        SERVICE: service,
        MONGO_SYNC_INDEXES: 'true',
        MONGO_DB: database,
        MONGO_HOST: mongoCluster.connectionString,
        MONGO_USER: mongoCluster.CIUsername,
        MONGO_PASS: mongoCluster.CIPassword,
        IS_ATLAS_MONGO: 'true',
      },
      ifClause=ifClause,
      command='docker/mongo-sync-indexes.sh',
    ),

  // Generate a diff of the indexes of a MongoDB database and the currect codebase.
  // The diff is posted as a comment on the pull request.
  //
  // Parameters:
  // service: The name of the service.
  // image: The name of the Docker image to use.
  // mongoCluster: The MongoDB cluster to connect to. One of the objects from the mongo_servers list.
  // database: The name of the database.
  //
  // Returns:
  // The job definition.
  mongoDiffIndexes(service, image, mongoCluster, database)::
    local mongoDBLink = self.atlasDeeplink(mongoCluster, database);

    misc.postJob(
      name='diff-mongo-indexes-' + mongoCluster.name + '-' + database,
      job_name='mongo-diff-' + service + '-${{ github.run_number }}-${{ github.run_attempt }}',
      cluster=mongoCluster.gke_cluster,
      image=image,
      environment={
        SERVICE: service,
        MONGO_DIFF_INDEXES: 'true',
        GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
        GITHUB_PR: '${{ github.event.number }}',
        MONGO_DB: database,
        MONGO_HOST: mongoCluster.connectionString,
        MONGO_USER: mongoCluster.CIUsername,
        MONGO_PASS: mongoCluster.CIPassword,
        MONGO_CLUSTER: mongoCluster.name,
        MONGO_DEEPLINK: mongoDBLink,
        IS_ATLAS_MONGO: 'true',
      },
      command='docker/mongo-sync-indexes.sh',
    ),
}
