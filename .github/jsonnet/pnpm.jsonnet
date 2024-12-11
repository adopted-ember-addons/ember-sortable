local base = import 'base.jsonnet';

{
  install(args=[], with={}, version='9.5.0')::
    base.action(
      'Install application code',
      'pnpm/action-setup@v4',
      with={
        version: version,
        run_install: |||
          - args: %(args)s
        ||| % { args: args },
      }
    ),
}
