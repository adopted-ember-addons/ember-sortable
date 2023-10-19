{
  buildDocker(
    imageName,
    imageTag='deploy-${{ github.event.pull_request.head.sha }}',
    context='.',
    dockerfile=null,
    env={},
    build_args=null,
    registry='eu.gcr.io',
  )::
    $.action(
      'build-docker',
      $.docker_action_image,
      with={
             context: context,
             gcloud_service_key: $.secret('docker_gcr_io_base64'),
             image_name: imageName,
             image_tag: imageTag,
             project_id: 'unicorn-985',
             registry: registry,
           } +
           (if build_args != null then { build_args: build_args } else {}) +
           (if dockerfile != null then { dockerfile: dockerfile } else {}),
      env=env,
    ),
}
