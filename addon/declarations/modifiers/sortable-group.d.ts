declare module 'ember-sortable/modifiers/sortable-group' {
  import Modifier from 'ember-modifier';

  export default class SortableGroup<T> extends Modifier<{
    Args: {
      Named: {
        groupName?: string;
        onChange: (value: T[]) => void;
      };
    };
    Element: HTMLElement;
  }> {}
}
