local images = import 'images.jsonnet';
local misc = import 'misc.jsonnet';

{
  mysql57service(database=null, password=null, root_password=null, username=null, port='3306')::
    {
      image: images.default_mysql57_image,
      credentials: {
        username: '_json_key',
        password: misc.secret('docker_gcr_io'),
      },
      env: {
        MYSQL_DATABASE: database,
        MYSQL_PASSWORD: password,
        MYSQL_ROOT_PASSWORD: root_password,
        MYSQL_USER: username,
        MYSQL_TCP_PORT: port,
      },
      options: '--health-cmd="mysqladmin ping" --health-interval=1s --health-timeout=1s --health-retries=40',
      ports: [port + ':' + port],
    },

  mysql8service(database=null, password=null, root_password=null, username=null, port='3306')::
    {
      image: images.default_mysql8_image,
      credentials: {
        username: '_json_key',
        password: misc.secret('docker_gcr_io'),
      },
      env: {
        MYSQL_DATABASE: database,
        MYSQL_PASSWORD: password,
        MYSQL_ROOT_PASSWORD: root_password,
        MYSQL_USER: username,
        MYSQL_TCP_PORT: port,
      },
      options: '--health-cmd="mysqladmin ping" --health-interval=1s --health-timeout=1s --health-retries=40',
      ports: [port + ':' + port],
    },

  cloudsql_proxy_service(database)::
    {
      image: images.default_cloudsql_image,
      credentials: {
        username: '_json_key',
        password: misc.secret('docker_gcr_io'),
      },
      env: {
        GOOGLE_PROJECT: database.project,
        CLOUDSQL_ZONE: database.region,
        CLOUDSQL_INSTANCE: database.server,
        SERVICE_JSON: misc.secret('GCE_JSON'),
      },
      ports: ['3306:3306'],
    },

  redis_service():: {
    image: images.default_redis_image,
    ports: ['6379:6379'],
  },

  redis_service_v7(port='6379'):: {
    image: 'redis:7.0.15',
    ports: [port + ':' + port],
  },

  pubsub_service():: {
    image: images.default_pubsub_image,
    ports: ['8681:8681'],
  },

  serviceMongodb(
    service,
    name='mongodb-' + service,
    username='root',
    password='therootpass',
  ):: {
    [name]: {
      image: images.default_mongodb_image,
      ports: ['27017:27017'],
      credentials: {
        username: '_json_key',
        password: misc.secret('docker_gcr_io'),
      },
      env: {
        MONGO_INITDB_ROOT_USERNAME: username,
        MONGO_INITDB_ROOT_PASSWORD: password,
        MONGO_REPLICA_SET_NAME: 'rs0',
      },
    },
  },
}
