local base = import 'base.jsonnet';
local images = import 'images.jsonnet';
local misc = import 'misc.jsonnet';

{
  buildDocker(
    imageName,
    imageTag='deploy-${{ github.event.pull_request.head.sha }}',
    context='.',
    dockerfile=null,
    env={},
    build_args=null,
    registry='eu.gcr.io',
    project='unicorn-985',
  )::
    base.action(
      'build-docker ' + imageName,
      images.docker_action_image,
      with={
             context: context,
             gcloud_service_key: misc.secret('docker_gcr_io_base64'),
             image_name: imageName,
             image_tag: imageTag,
             project_id: project,
             registry: registry,
           } +
           (if build_args != null then { build_args: build_args } else {}) +
           (if dockerfile != null then { dockerfile: dockerfile } else {}),
      env=env,
    ),
}
