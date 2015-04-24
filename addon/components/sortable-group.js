import Ember from 'ember';
import layout from '../templates/components/sortable-group';
const { A, Component, computed, Set } = Ember;
const { Promise } = Ember.RSVP;

export default Component.extend({
  tagName: '',
  layout: layout,

  /**
    @property items
    @type Ember.NativeArray
  */
  items: computed(() => { return A() }),

  /**
    @property sortedItems
    @type Array
  */
  sortedItems: computed('items.@each.y', function() {
    return this.get('items').sortBy('y');
  }),

  /**
    Register an item with this group.

    @method registerItem
    @param {SortableItem} [item]
  */
  registerItem(item) {
    this.get('items').addObject(item);
  },

  /**
    De-register an item with this group.

    @method deregisterItem
    @param {SortableItem} [item]
  */
  deregisterItem(item) {
    this.get('items').removeObject(item);
  },

  /**
    Update item positions.

    @method update
  */
  update() {
    let sortedItems = this.get('sortedItems');
    let y = 0;

    sortedItems.forEach(item => {
      if (!item.get('isDragging')) {
        item.set('y', y);
      }
      y += item.get('height');
    });
  },

  /**
    @method commit
  */
  commit() {
    let items = this.get('sortedItems');
    let models = items.mapBy('model');

    this.sendAction('onChange', models);
  }
});
