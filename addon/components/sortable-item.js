import Ember from 'ember';
import layout from '../templates/components/sortable-item';
import SortableItemMixin from '../mixins/sortable-item';

export default Ember.Component.extend(SortableItemMixin, {
  layout
});
