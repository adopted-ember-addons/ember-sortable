declare module 'ember-sortable/modifiers/sortable-handle' {
  import Modifier from 'ember-modifier';

  export default class SortableHandle extends Modifier<{
    Element: HTMLElement;
  }> {}
}
