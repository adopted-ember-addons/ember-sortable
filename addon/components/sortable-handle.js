import Component from '@ember/component';

export default Component.extend({
  tabindex: 0,
  attributeBindings: ["dataSortableHandle:data-sortable-handle", "tabindex"],
  dataSortableHandle: true,
});