import Ember from 'ember';
import layout from '../templates/components/sortable-group';
import computed from 'ember-new-computed';
const { $, A, Component, get, set, run } = Ember;
const a = A;
const NO_MODEL = {};

export default Component.extend({
  layout: layout,

  /**
    @property direction
    @type string
    @default y
  */
  direction: 'y',

  /**
    @property model
    @type Any
    @default null
  */
  model: NO_MODEL,

  /**
    @property items
    @type Ember.NativeArray
  */
  items: computed({
    get() {
      return a(); 
    },
  }), 

  /**
    @method _getFirstItemPosition
    @private
  */
  _getFirstItemPosition: function() {
    let element = this.element;
    let stooge = $('<span style="position: absolute" />');
    let prependedStoogePosition = stooge.prependTo(element).position();
    let result;

    let direction = this.get('direction');

    if (direction === 'x') {
      result = prependedStoogePosition.left;
    }
    if (direction === 'y') {
      result = prependedStoogePosition.top;
    }

    stooge.remove();

    return result;
  },

  /**
    Position for the first item.
    @property itemPosition
    @type Number
  */
  itemPosition: computed({
    get() {
      return this._getFirstItemPosition();
    }
  }).volatile().readOnly(),

  /**
    @property sortedItems
    @type Array
  */

  sortedItems: computed('items.@each.y', 'items.@each.x', 'direction', {
    get() {
      return a(this.get('items')).sortBy(this.get('direction'));
    }
  }).readOnly(),

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
    let position = this._itemPosition;

    // Just in case we haven’t called prepare first.
    if (position === undefined) {
      position = this.get('itemPosition');
    }

    sortedItems.forEach(item => {
      let dimension;
      let direction = this.get('direction');

      if (!get(item, 'isDragging')) {
        set(item, direction, position);
      }

      if (direction === 'x') {
       dimension = 'width';
      }
      if (direction === 'y') {
       dimension = 'height';
      }

      position += get(item, dimension);
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

    if (groupModel !== NO_MODEL) {
      this.sendAction('onChange', groupModel, itemModels);
    } else {
      this.sendAction('onChange', itemModels);
    }
  }
});
