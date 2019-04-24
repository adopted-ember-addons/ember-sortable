import { A } from '@ember/array';
import Component from '@ember/component';
import { set, get } from '@ember/object';
import { run } from '@ember/runloop';
import layout from '../templates/components/sortable-group';
import { computed } from '@ember/object';

const a = A;
const NO_MODEL = {};

export default Component.extend({
  layout: layout,

  attributeBindings: ['data-test-selector'],

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

  init(...args) {
    this._super(...args);
    this._firstItemPosition = null;
  },

  /**
    @property sortedItems
    @type Array
  */
  sortedItems: computed(function() {
    let items = a(this.get('items'));
    let direction = this.get('direction');

    return a(items.sortBy(direction));
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
    Main purpose is to stash the current first item position so
    we don’t incur expensive re-layouts.
    @method prepare
  */
  prepare() {
    let items = this.get('sortedItems');
    let direction = this.get('direction');
    this._firstItemPosition = calculateFirstItemPosition(items, direction);
  },

  /**
    Update item positions (relatively to the first element position).
    @method update
  */
  update() {
    let sortedItems = this.get('sortedItems');
    let direction = this.get('direction');
    // Position of the first element
    let position = this._firstItemPosition;

    // Just in case we haven’t called prepare first.
    if (position === undefined) {
      position = calculateFirstItemPosition(sortedItems, direction);
    }

    sortedItems.forEach(item => {
      let dimension;

      if (!get(item, 'isDragging')) {
        set(item, direction, position);
      }

      // add additional spacing around active element
      if (get(item, 'isBusy')) {
        position += get(item, 'spacing') * 2;
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
    let draggedItem = items.findBy('wasDropped', true);
    let draggedModel;

    if (draggedItem) {
      set(draggedItem, 'wasDropped', false); // Reset
      draggedModel = get(draggedItem, 'model');
    }

    this._firstItemPosition = null;

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
  }
});

function calculateFirstItemPosition(items, direction) {
  let firstItem = items.objectAt(0);
  return firstItem.get(direction) - firstItem.get('spacing');
}
