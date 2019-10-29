import Component from '@ember/component';

/**
 * This component represents the handle of a `sortable-item`.
 */
export default Component.extend({
  tabindex: 0,
  attributeBindings: ["dataSortableHandle:data-sortable-handle", "tabindex"],
  dataSortableHandle: true,
});