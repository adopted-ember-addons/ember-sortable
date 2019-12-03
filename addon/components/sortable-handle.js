import Component from '@ember/component';

/**
 * This component represents the handle of a `sortable-item`.
 */
export default Component.extend({
  tabindex: 0,
  role: 'button',
  attributeBindings: ["dataSortableHandle:data-sortable-handle", "tabindex", "role"],
  dataSortableHandle: true,
});