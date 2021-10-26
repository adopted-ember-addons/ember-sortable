import Component from '@ember/component';
import { deprecate } from '@ember/debug';

/**
 * This component represents the handle of a `sortable-item`.
 */
export default Component.extend({
  tabindex: 0,
  role: 'button',
  attributeBindings: ["dataSortableHandle:data-sortable-handle", "tabindex", "role"],
  dataSortableHandle: true,

  init() {
    this._super(...arguments);

    deprecate(
      'The <SortableHandle> component is deprecated.  Please use the modifier version {{sortable-handle}}.',
      false,
      {
        id: 'ember-sortable:sortable-handle-component-deprecated',
        until: '3.0.0',
        for: 'ember-sortable',
        since: {
          available: '2.2.6',
          enabled: '2.2.6',
        },
      }
    );
  },
});