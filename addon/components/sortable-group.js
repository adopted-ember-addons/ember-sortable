import Ember from 'ember';
import layout from '../templates/components/sortable-group';
const { $, A, Component, computed, get, set, run } = Ember;
const a = A;

export default Component.extend({
  layout: layout,

  /**
    @property items
    @type Ember.NativeArray
  */
  items: computed(() => { return a(); }),

  /**
    Vertical position for the first item.

    @property itemPosition
    @type Number
  */
  itemPosition: computed(function() {
    let element = this.element;
    let stooge = $('<span style="position: absolute" />');
    let result = stooge.prependTo(element).position().top;

    stooge.remove();

    return result;
  }).volatile(),

  /**
    @property sortedItems
    @type Array
  */
  sortedItems: computed('items.@each.y', function() {
    return a(this.get('items')).sortBy('y');
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
    Prepare for sorting.
    Main purpose is to stash the current itemPosition so
    we don’t incur expensive re-layouts.

    @method prepare
  */
  prepare() {
    this._itemPosition = this.get('itemPosition');
  },

  /**
    Update item positions.

    @method update
  */
  update() {
    let sortedItems = this.get('sortedItems');
    let y = this._itemPosition;

    // Just in case we haven’t called prepare first.
    if (y === undefined) {
      y = this.get('itemPosition');
    }

    sortedItems.forEach(item => {
      if (!get(item, 'isDragging')) {
        set(item, 'y', y);
      }
      y += get(item, 'height');
    });
  },

  /**
    @method commit
  */
  commit() {
    let items = this.get('sortedItems');
    let groupModel = this.get('model');
    let itemModels = items.mapBy('model');

    delete this._itemPosition;

    run.schedule('render', () => {
      items.invoke('freeze');
    });

    run.schedule('afterRender', () => {
      items.invoke('reset');
    });

    run.next(() => {
      run.schedule('render', () => {
        items.invoke('thaw');
      });
    });
    
    if  (groupModel === null || groupModel === undefined) {
      this.sendAction('onChange', itemModels);
    } else {
      this.sendAction('onChange', groupModel, itemModels);
    }
  }
});
