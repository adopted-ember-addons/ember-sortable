local base = import 'base.jsonnet';
local clusters = import 'clusters.jsonnet';
local databases = import 'databases.jsonnet';
local images = import 'images.jsonnet';
local misc = import 'misc.jsonnet';
local services = import 'services.jsonnet';

{
  deployHelm(
    cluster,
    release,
    values,
    chartPath,
    delete=false,
    useHelm3=true,
    title=null,
    ifClause=null,
    ttl=null,
    namespace='default',
    version='${{ github.event.pull_request.head.sha }}'
  )::
    base.action(
      (if title == null then if delete then 'delete-helm' else 'deploy-helm' else title),
      images.helm_action_image,
      with={
             clusterProject: cluster.project,
             clusterLocation: cluster.zone,
             clusterName: cluster.name,
             clusterSaJson: cluster.secret,
             release: release,
             namespace: namespace,
             chart: chartPath,
             atomic: 'false',
             token: '${{ github.token }}',
             version: version,
             values: if std.isString(values) then values else std.manifestJsonMinified(values),  // Accepts a string and an object due to legacy reasons.
           } + (if delete then { task: 'remove' } else {})
           + (if useHelm3 then { helm: 'helm3' } else { helm: 'helm' })
           + (if ttl != null then { ttl: ttl } else {}),
      ifClause=ifClause,
    ),

  helmDeployProd(
    serviceName,
    options={},
    helmPath='./helm/' + serviceName,
    deploymentName=serviceName + '-prod',
    ifClause=null,
    cluster=clusters.prod,
    namespace='default',
    version='${{ github.event.pull_request.head.sha }}',
  )::
    self.deployHelm(
      cluster,
      deploymentName,
      {
        environment: 'prod',
        identifier: 'prod',
        image: {
          tag: 'deploy-${{ github.sha }}',
        },
      } + options,
      helmPath,
      useHelm3=true,
      title='deploy-prod',
      ifClause=ifClause,
      namespace=namespace,
      version=version,
    ),

  helmDeployProdJob(
    serviceName,
    options={},
    helmPath='./helm/' + serviceName,
    deploymentName=serviceName + '-prod',
    image=images.default_job_image,
    useCredentials=false,
    environment='production',
  )::
    base.ghJob(
      'deploy-prod',
      ifClause="${{ github.event.deployment.environment == '" + environment + "' }}",
      image=image,
      useCredentials=useCredentials,
      steps=[
        misc.checkout(),
        self.helmDeployProd(serviceName, options, helmPath, deploymentName),
      ],
    ),

  helmDeployTest(
    serviceName,
    options={},
    helmPath='./helm/' + serviceName,
    deploymentName=serviceName + '-master',
    cluster=clusters.test,
    namespace='default',
  )::
    self.deployHelm(
      cluster,
      deploymentName,
      {
        environment: 'test',
        identifier: 'master',
        image: {
          tag: 'deploy-${{ github.sha }}',
        },
      } + options,
      helmPath,
      useHelm3=true,
      title='deploy-test',
      namespace=namespace,
    ),

  helmDeployTestJob(
    serviceName,
    options={},
    helmPath='./helm/' + serviceName,
    deploymentName=serviceName + '-master',
    image=images.default_job_image,
    useCredentials=false,
  )::
    base.ghJob(
      'deploy-test',
      ifClause="${{ github.event.deployment.environment == 'test' }}",
      image=image,
      useCredentials=useCredentials,
      steps=[
        misc.checkout(),
        self.helmDeployTest(serviceName, options, helmPath, deploymentName),
      ],
    ),

  helmDeployPR(
    serviceName,
    options={},
    helmPath='./helm/' + serviceName,
    deploymentName=serviceName + '-pr-${{ github.event.number }}',
    cluster=clusters.test,
    namespace='default',
  )::
    self.deployHelm(
      cluster,
      deploymentName,
      {
        environment: 'pr',
        identifier: 'pr-${{ github.event.number }}',
        image: {
          tag: 'deploy-${{ github.event.pull_request.head.sha }}',
        },
      } + options,
      helmPath,
      useHelm3=true,
      title='deploy-pr',
      ttl='7 days',
      namespace=namespace,
    ),
  helmDeployPRJob(
    serviceName,
    options={},
    helmPath='./helm/' + serviceName,
    deploymentName=serviceName + '-pr-${{ github.event.number }}',
    image=images.default_job_image,
    useCredentials=false,
  )::
    base.ghJob(
      'deploy-pr',
      image=image,
      useCredentials=useCredentials,
      steps=[
        misc.checkout(),
        self.helmDeployPR(serviceName, options, helmPath, deploymentName),
      ],
    ),

  helmDeletePr(
    serviceName,
    options={},
    helmPath='./helm/' + serviceName,
    deploymentName=serviceName + '-pr-${{ github.event.number }}',
    cluster=clusters.test,
    namespace='default',
  )::
    self.deployHelm(
      cluster,
      deploymentName,
      options,
      helmPath,
      useHelm3=true,
      delete=true,
      title='delete-pr',
      namespace=namespace,
    ),
  helmDeletePRJob(
    serviceName,
    options={},
    helmPath='./helm/' + serviceName,
    deploymentName=serviceName + '-pr-${{ github.event.number }}',
    mysqlDeleteOptions={ enabled: false },
  )::
    base.ghJob(
      'helm-delete-pr',
      image=images.default_job_image,
      useCredentials=false,
      steps=[
              misc.checkout(),
              self.helmDeletePr(serviceName, options, helmPath, deploymentName),
            ] +
            (if mysqlDeleteOptions.enabled then [databases.deleteDatabase(mysqlDeleteOptions)] else []),
      services=(if mysqlDeleteOptions.enabled then { 'cloudsql-proxy': services.cloudsql_proxy_service(mysqlDeleteOptions.database) } else null),
    ),

  helmDeletePRPipeline(
    serviceName,
    options={},
    helmPath='./helm/' + serviceName,
    deploymentName=serviceName + '-pr-${{ github.event.number }}',
  )::
    base.pipeline(
      'close-pr',
      [
        self.helmDeletePRJob(serviceName, options, helmPath, deploymentName),
      ],
      event={
        pull_request: {
          types: ['closed'],
        },
      }
    ),

  helmDeployCanary(
    serviceName,
    options={},
    helmPath='./helm/' + serviceName + '-canary',
    deploymentName=serviceName + '-canary',
    ifClause=null,
  )::
    self.deployHelm(
      clusters.prod,
      deploymentName,
      {
        identifier: 'prod',
        environment: 'prod',
        image: {
          tag: 'deploy-${{ github.sha }}',
        },
        replicaCount: 1,
      } + options,
      helmPath,
      useHelm3=true,
      title='deploy-canary',
      ifClause=ifClause,
    ),
  helmDeployCanaryJob(
    serviceName,
    options={},
    helmPath='./helm/' + serviceName + '-canary',
    deploymentName=serviceName + '-canary',
    image=images.default_job_image,
    useCredentials=false,
  )::
    base.ghJob(
      'deploy-canary',
      image=image,
      useCredentials=useCredentials,
      ifClause="${{ github.event.deployment.environment == 'canary' }}",
      steps=[
        misc.checkout(),
        self.helmDeployCanary(serviceName, options, helmPath, deploymentName),
      ],
    ),

  helmKillCanary(
    serviceName,
    options={},
    helmPath='./helm/' + serviceName + '-canary',
    deploymentName=serviceName + '-canary',
    ifClause=null,
  )::
    self.deployHelm(
      clusters.prod,
      deploymentName,
      {
        identifier: 'prod',
        environment: 'prod',
        image: {
          tag: 'deploy-${{ github.sha }}',
        },
        replicaCount: 0,
      } + options,
      helmPath,
      useHelm3=true,
      title='kill-canary',
      ifClause=ifClause,
    ),
  helmKillCanaryJob(
    serviceName,
    options={},
    helmPath='./helm/' + serviceName + '-canary',
    deploymentName=serviceName + '-canary',
  )::
    base.ghJob(
      'kill-canary',
      ifClause="${{ github.event.deployment.environment == 'kill-canary' || github.event.deployment.environment == 'production' }}",
      image=images.default_job_image,
      useCredentials=false,
      steps=[
        misc.checkout(),
        self.helmKillCanary(serviceName, options, helmPath, deploymentName),
      ],
    ),
}
