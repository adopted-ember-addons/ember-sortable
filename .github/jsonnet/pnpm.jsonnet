local base = import 'base.jsonnet';

{
  install(args=[], with={})::
    base.action(
      'Install application code',
      'pnpm/action-setup@v4',
      with={
        version: '9.5.0',
        run_install: |||
          - args: %(args)s
        ||| % { args: args },
      }
    ),
}
