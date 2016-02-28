import Component from 'ember-component';
import SortableNode from 'ember-sortable/mixins/sortable-node';

export default Component.extend(SortableNode, {
  tagName: 'tree-node',

  click() {
    console.log('click');
  }
});
