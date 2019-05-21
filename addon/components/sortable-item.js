import Component from '@ember/component';
import layout from '../templates/components/sortable-item';
import SortableItemMixin from '../mixins/sortable-item';

export default Component.extend(SortableItemMixin, {
  layout
});
