// Easily allow apps, which are not yet using strict mode templates, to consume your Glint types, by importing this file.
// Add all your components, helpers and modifiers to the template registry here, so apps don't have to do this.
// See https://typed-ember.gitbook.io/glint/environments/ember/authoring-addons

import type SortableGroupModifier from './modifiers/sortable-group';
import type SortableHandleModifier from './modifiers/sortable-handle';
import type SortableItemModifier from './modifiers/sortable-item';

export default interface EmberSortableRegistry {
  'sortable-group': typeof SortableGroupModifier;
  'sortable-handle': typeof SortableHandleModifier;
  'sortable-item': typeof SortableItemModifier;
}
