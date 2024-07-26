declare module 'ember-sortable/test-support' {
  export function drag(
    mode: 'mouse' | 'touch',
    itemSelector: string,
    offsetFn: () => { dx?: number; dy?: number },
    callbacks?: Record<string, unknown>,
  ): unknown;
}
