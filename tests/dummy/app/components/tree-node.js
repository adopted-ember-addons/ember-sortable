import Component from 'ember-component';
import SortableNode from 'ember-sortable/mixins/sortable-node';
import { alias } from 'ember-computed';

export default Component.extend(SortableNode, {
  tagName: 'tree-node',

  model: alias('sortableModel')
});
