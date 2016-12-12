import Ember from 'ember';
import layout from '../templates/components/sortable-item';
import SortableItemMixin from '../mixins/sortable-item';

/**
 * Basic Ember component that uses the
 * {{#crossLink "SortableItemMixin"}}{{/crossLink}}
 *
 * @module ember-sortable
 * @class SortableItem
 * @extends Ember.Component
 * @uses SortableItemMixin
 */
export default Ember.Component.extend(SortableItemMixin, {
  layout
});
