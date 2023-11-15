{
  pipeline(name, jobs, event=['pull_request'], permissions=null, concurrency=null):: {
    [name + '.yml']:
      std.manifestYamlDoc(
        {
          name: name,
          on: event,
          jobs: std.foldl(function(x, y) x + y, jobs, {}),
        } + (if permissions == null then {} else { permissions: permissions }) + (if concurrency == null then {} else { concurrency: concurrency }),
      ),
  },

  ghJob(
    name,
    timeoutMinutes=30,
    runsOn=null,
    image=$.default_job_image,
    steps=[],
    ifClause=null,
    needs=null,
    outputs=null,
    useCredentials=true,
    services=null,
    permissions=null,
    concurrency=null,
    continueOnError=null,
    env=null,
  )::
    {
      [name]: {
                'timeout-minutes': timeoutMinutes,
                'runs-on': (if runsOn == null then 'arc-runner-2' else runsOn),
              } +
              (
                if image == null then {} else
                  {
                    container: {
                      image: image,
                    } + (if useCredentials then { credentials: { username: '_json_key', password: $.secret('docker_gcr_io') } } else {}),
                  }
              ) +
              {
                steps: std.flattenArrays(steps),
              } +
              (if ifClause != null then { 'if': ifClause } else {}) +
              (if needs != null then { needs: needs } else {}) +
              (if outputs != null then { outputs: outputs } else {}) +
              (if services != null then { services: services } else {}) +
              (if permissions == null then {} else { permissions: permissions }) +
              (if concurrency == null then {} else { concurrency: concurrency }) +
              (if continueOnError == null then {} else { 'continue-on-error': continueOnError }) +
              (if env == null then {} else { env: env })
    },

  ghExternalJob(
    name,
    uses,
    with=null,
  )::
    {
      [name]: {
        uses: uses,
      } + (if with != null then {
             with: with,
           } else {}),
    },

  step(name, run, env=null, workingDirectory=null, ifClause=null, id=null, continueOnError=null)::
    [
      {
        name: name,
        run: run,
      } + (if workingDirectory != null then { 'working-directory': workingDirectory } else {})
      + (if env != null then { env: env } else {})
      + (if ifClause != null then { 'if': ifClause } else {})
      + (if id != null then { id: id } else {})
      + (if continueOnError == null then {} else { 'continue-on-error': continueOnError }),
    ],

  action(name, uses, env=null, with=null, id=null, ifClause=null, continueOnError=null)::
    [
      {
        name: name,
        uses: uses,
      } + (if env != null then { env: env } else {})
      + (if with != null && with != {} then { with: with } else {})
      + (if id != null then { id: id } else {})
      + (if ifClause != null then { 'if': ifClause } else {})
      + (if continueOnError == null then {} else { 'continue-on-error': continueOnError }),
    ],
}
