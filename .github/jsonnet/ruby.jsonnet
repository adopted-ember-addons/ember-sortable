local base = import 'base.jsonnet';
local database = import 'databases.jsonnet';
local docker = import 'docker.jsonnet';
local helm = import 'helm.jsonnet';
local misc = import 'misc.jsonnet';
local notifications = import 'notifications.jsonnet';
local servicesImport = import 'services.jsonnet';

{
  rubyDeployPRPipeline(
    serviceName,
    dockerImageName='github-gynzy-docker-' + serviceName,
    helmDeployOptions={
      ingress: { enabled: true },
      cronjob: { enabled: true },
    },
    mysqlCloneOptions={},
    migrateOptions={},
    rubyImageName=null,
  )::
    assert rubyImageName != null;
    local mysqlCloneOptionsWithDefaults = {
      enabled: false,  // default for backwards compatibility. example params below
      database_name_target: serviceName + '_pr_${{ github.event.number }}',
      database_name_source: serviceName,
      database_host: 'cloudsql-proxy',
      database_username: serviceName,
      database_password: misc.secret('database_password_test'),
    } + mysqlCloneOptions;

    local migrateOptionsWithDefaults = {
      enabled: false,
      RAILS_ENV: 'production',
      RAILS_DB_HOST: 'cloudsql-proxy',
      RAILS_DB_NAME: serviceName + '_pr_${{ github.event.number }}',
      RAILS_DB_PASSWORD: misc.secret('database_password_test'),
      RAILS_DB_USER: serviceName,
      SECRET_KEY_BASE: misc.secret('rails_secret_test'),
    } + migrateOptions;

    base.pipeline(
      'deploy-pr',
      [
        base.ghJob(
          'deploy-pr',
          image=rubyImageName,
          steps=[
                  misc.checkout(ref='${{ github.event.pull_request.head.sha }}'),
                  self.setVerionFile(),
                ] +
                (if mysqlCloneOptionsWithDefaults.enabled then [database.copyDatabase(mysqlCloneOptionsWithDefaults)] else []) +
                (if migrateOptionsWithDefaults.enabled then self.rubyMigrate(migrateOptionsWithDefaults) else []) +
                [
                  docker.buildDocker(
                    dockerImageName,
                    env={
                      BUNDLE_GITHUB__COM: misc.secret('BUNDLE_GITHUB__COM'),
                    },
                    build_args='BUNDLE_GITHUB__COM=' + misc.secret('BUNDLE_GITHUB__COM'),
                  ),
                  helm.helmDeployPR(serviceName, helmDeployOptions),
                ],
          services={} +
                   (if mysqlCloneOptionsWithDefaults.enabled then { 'cloudsql-proxy': servicesImport.cloudsql_proxy_service(mysqlCloneOptionsWithDefaults.database) } else {})
        ),
      ],
      event='pull_request',
    ),

  rubyMigrate(migrateOptions)::
    local env = {
      BUNDLE_GITHUB__COM: misc.secret('BUNDLE_GITHUB__COM'),
      SSO_PUBLIC_KEY: '',
      RAILS_ENV: 'production',
      RAILS_DB_HOST: migrateOptions.RAILS_DB_HOST,
      RAILS_DB_NAME: migrateOptions.RAILS_DB_NAME,
      RAILS_DB_PASSWORD: migrateOptions.RAILS_DB_PASSWORD,
      RAILS_DB_USER: migrateOptions.RAILS_DB_USER,
      SECRET_KEY_BASE: migrateOptions.SECRET_KEY_BASE,
    };

    [
      base.step('bundle install', 'bundle install', env={ BUNDLE_GITHUB__COM: misc.secret('BUNDLE_GITHUB__COM') }),
      base.step('migrate-db', 'rails db:migrate;', env=env),
      base.step('seed-db', 'rails db:seed;', env=env),
    ]
  ,

  deployApiDocs(
    serviceName,
    enableDatabase=false,
    generateCommands=null,
    extra_env={},
    services={ db: servicesImport.mysql57service(database='ci', password='ci', root_password='1234test', username='ci') },
    rubyImageName=null,
  )::
    assert rubyImageName != null;
    base.ghJob(
      'apidocs',
      image=rubyImageName,
      ifClause="${{ github.event.deployment.environment == 'production' }}",
      steps=[
        misc.checkout(),
        base.step(
          'generate',
          (if generateCommands != null then generateCommands else
             ' bundle config --delete without;\n            bundle install;\n            bundle exec rails db:test:prepare;\n            bundle exec rails docs:generate;\n          '),
          env={
                RAILS_ENV: 'test',
                GOOGLE_PRIVATE_KEY: misc.secret('GOOGLE_PRIVATE_KEY'),
                BUNDLE_GITHUB__COM: misc.secret('BUNDLE_GITHUB__COM'),
              } +
              (if enableDatabase then
                 {
                   RAILS_DB_HOST: 'db',
                   RAILS_DB_NAME: 'ci',
                   RAILS_DB_PASSWORD: 'ci',
                   RAILS_DB_USER: 'ci',
                 } else {}) + extra_env
        ),
        base.action(
          'setup auth',
          'google-github-actions/auth@v2',
          with={
            credentials_json: misc.secret('GCE_JSON'),
          },
          id='auth',
        ),
        base.action('setup-gcloud', 'google-github-actions/setup-gcloud@v2'),
        base.step('deploy-api-docs', 'gsutil -m cp -r doc/api/** gs://apidocs.gynzy.com/' + serviceName + '/'),
      ],
      services=(if enableDatabase then services else null),
    ),

  setVerionFile(version='${{ github.event.pull_request.head.sha }}', file='VERSION')::
    base.step(
      'set-version',
      'echo "' + version + '" > ' + file + ';\n        echo "Generated version number:";\n        cat ' + file + ';\n      '
    ),

  rubyDeletePRPipeline(
    serviceName,
    options={},
    helmPath='./helm/' + serviceName,
    deploymentName=serviceName + '-pr-${{ github.event.number }}',
    mysqlDeleteOptions={},
  )::
    local mysqlDeleteOptionsWithDefaults = {
      enabled: false,
      database_name_target: serviceName + '_pr_${{ github.event.number }}',
      database_host: 'cloudsql-proxy',
      database_username: serviceName,
      database_password: misc.secret('database_password_test'),
    } + mysqlDeleteOptions;

    base.pipeline(
      'close-pr',
      [
        helm.helmDeletePRJob(serviceName, options, helmPath, deploymentName, mysqlDeleteOptionsWithDefaults),
      ],
      event={
        pull_request: {
          types: ['closed'],
        },
      },
    ),

  rubyDeployTestJob(
    serviceName,
    options={},
    helmPath='./helm/' + serviceName,
    deploymentName=serviceName + '-master',
    image=null,
    useCredentials=false,
    migrateOptions={},
  )::
    assert image != null;
    local migrateOptionsWithDefaults = {
      enabled: false,
      RAILS_ENV: 'production',
      RAILS_DB_HOST: 'cloudsql-proxy',
      RAILS_DB_NAME: serviceName,
      RAILS_DB_PASSWORD: misc.secret('database_password_test'),
      RAILS_DB_USER: serviceName,
      SECRET_KEY_BASE: misc.secret('rails_secret_test'),
    } + migrateOptions;

    base.ghJob(
      'deploy-test',
      ifClause="${{ github.event.deployment.environment == 'test' }}",
      image=image,
      useCredentials=useCredentials,
      steps=
      [misc.checkout()] +
      (if migrateOptionsWithDefaults.enabled then self.rubyMigrate(migrateOptionsWithDefaults) else []) +
      [helm.helmDeployTest(serviceName, options, helmPath, deploymentName)],
      services={} +
               (if migrateOptionsWithDefaults.enabled then { 'cloudsql-proxy': servicesImport.cloudsql_proxy_service(migrateOptionsWithDefaults.database) } else {})
    ),

  rubyDeployProdJob(
    serviceName,
    options={},
    helmPath='./helm/' + serviceName,
    deploymentName=serviceName + '-prod',
    image=null,
    useCredentials=false,
    migrateOptions={},
  )::
    assert image != null;
    local migrateOptionsWithDefaults = {
      enabled: false,
      RAILS_ENV: 'production',
      RAILS_DB_HOST: 'cloudsql-proxy',
      RAILS_DB_NAME: serviceName,
      RAILS_DB_PASSWORD: misc.secret('database_password_production'),
      RAILS_DB_USER: serviceName,
      SECRET_KEY_BASE: misc.secret('rails_secret_production'),
    } + migrateOptions;

    base.ghJob(
      'deploy-prod',
      ifClause="${{ github.event.deployment.environment == 'production' }}",
      image=image,
      useCredentials=useCredentials,
      steps=[misc.checkout()] +
            (if migrateOptionsWithDefaults.enabled then self.rubyMigrate(migrateOptionsWithDefaults) else []) +
            [helm.helmDeployProd(serviceName, options, helmPath, deploymentName)] + [notifications.notifiyDeployFailure()],
      services={} +
               (if migrateOptionsWithDefaults.enabled then { 'cloudsql-proxy': servicesImport.cloudsql_proxy_service(migrateOptionsWithDefaults.database) } else {})
    ),
}
