declare module 'ember-sortable/modifiers/sortable-item' {
  import Modifier from 'ember-modifier';

  export default class SortableItem extends Modifier<{
    Args: {
      Named: {
        groupName?: string;
        model: unknown;
      };
    };
    Element: HTMLElement;
  }> {}
}
