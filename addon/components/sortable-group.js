import Ember from 'ember';
import layout from '../templates/components/sortable-group';
const { Component, computed, Set } = Ember;

export default Component.extend({
  tagName: '',
  layout: layout,

  /**
    @property items
    @type Ember.Set
  */
  items: computed(() => { return Set.create() }),

  /**
    @method registerItem
    @param {SortableItem} [item]
  */
  registerItem(item) {
    this.get('items').addObject(item);
  },

  /**
    @method deregisterItem
    @param {SortableItem} [item]
  */
  deregisterItem(item) {
    this.get('items').removeObject(item);
  }
});
