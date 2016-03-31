import Ember from 'ember';
import layout from '../templates/components/sortable-group';
import computed from 'ember-new-computed';
const { A, Component, get, set, run } = Ember;
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
  items: computed(() => a()),

  /**
    Position for the first item.
    If spacing is present, first item's position will have to change as well.
    @property itemPosition
    @type Number
  */
  itemPosition: computed(function() {
    let direction = this.get('direction');

    return this.get(`sortedItems.firstObject.${direction}`) - this.get('sortedItems.firstObject.spacing');
  }).volatile(),

  /**
    @property sortedItems
    @type Array
  */
  sortedItems: computed(function () {
    return this.get('items').sort((a, b) => {
      return a.get('y') - b.get('y') || a.get('x') - b.get('x');
    });
  }).volatile(),

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
    this._itemPositionX = this.get('sortedItems.firstObject.x') - this.get('sortedItems.firstObject.spacing');
    this._itemPositionY = this.get('sortedItems.firstObject.y') - this.get('sortedItems.firstObject.spacing');
  },

  /**
    Update item positions (relatively to the first element position).
    @method update
  */
  update() {
    let sortedItems = this.get('sortedItems');
    // Position of the first element
    let positionX = this._itemPositionX;
    let positionY = this._itemPositionY;

    // Just in case we haven’t called prepare first.
    if (positionX === undefined) {
      positionX = sortedItems.get('firstObject.x') - sortedItems.get('firstObject.spacing');
    }
    if (positionY === undefined) {
      positionY = sortedItems.get('firstObject.y') - sortedItems.get('firstObject.spacing');
    }

    let startX = positionX;

    sortedItems.forEach((item, index) => {
      let direction = this.get('direction');

      if (!get(item, 'isDragging')) {
        if (this._hasX(direction)) {
          set(item, 'x', positionX);
        }
        if (this._hasY(direction)) {
          set(item, 'y', positionY);
        }
      }

      // add additional spacing around active element
      if (get(item, 'isBusy')) {
        positionX += get(item, 'spacing') * 2;
        positionY += get(item, 'spacing') * 2;
      }

      if (this._hasX(direction)) {
        if (direction === 'xy' && index > 0 && 0 === index % 3) {
          positionX = startX;
        } else {
          positionX += get(item, 'width');
        }
      }

      if (this._hasY(direction) && (index > 0 && 0 === index % 3)) {
        positionY += get(item, 'height');
      }
    });
  },

  /**
    @method commit
  */
  commit() {
    let items = this.get('sortedItems');
    let groupModel = this.get('model');
    let itemModels = items.mapBy('model');
    let draggedItem = items.findBy('wasDropped', true);
    let draggedModel;

    if (draggedItem) {
      set(draggedItem, 'wasDropped', false); // Reset
      draggedModel = get(draggedItem, 'model');
    }

    delete this._itemPositionX;
    delete this._itemPositionY;

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
      this.sendAction('onChange', groupModel, itemModels, draggedModel);
    } else {
      this.sendAction('onChange', itemModels, draggedModel);
    }
  },

  _hasX(direction) {
    return /[x]+/.test(direction);
  },

  _hasY(direction) {
    return /[y]+/.test(direction);
  },
});
