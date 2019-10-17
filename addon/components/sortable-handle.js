import Component from '@ember/component';

export default Component.extend({
  attributeBindings: ["dataSortableHandle:data-sortable-handle"],
  dataSortableHandle: true,
});