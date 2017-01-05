import Ember from 'ember';
import layout from '../templates/components/sortable-group';
import computed from 'ember-new-computed';
import {invokeAction} from 'ember-invoke-action';

const { A, Component, get, set, run } = Ember;
const a = A;
const NO_MODEL = {};

/**
 * @module ember-sortable
 * @class SortableGroup
 * @extends Ember.Component
 */
export default Component.extend({
  layout: layout,

  attributeBindings: ['data-test-selector'],

  /**
   * Direction this group can be sorted in. Can be either 'y' or 'x'
   *
   * @property direction
   * @type string
   * @default y
   * @public
   */
  direction: 'y',

  /**
   * Optional "group model" to set. If this property is set,
   * it will be passed in as the first argument to the
   * {{#crossLink "SortableGroup/onChange:property"}}onChange action{{/crossLink}}
   *
   * @property model
   * @type Any
   * @default null
   * @public
   */
  model: NO_MODEL,

  /**
   * @type Ember.NativeArray
   * @property items
   * @public
   */
  items: computed(() => a()),

  /**
   * Position for the first item.
   * If spacing is present, first item's position will have to change as well.
   *
   * @property itemPosition
   * @type Number
   * @public
   */
  itemPosition: computed(function() {
    let direction = this.get('direction');

    return this.get(`sortedItems.firstObject.${direction}`) - this.get('sortedItems.firstObject.spacing');
  }).volatile(),

  /**
   * List of items sorted by direction.
   *
   * @property sortedItems
   * @type Array
   * @public
   */
  sortedItems: computed(function() {
    let items = a(this.get('items'));
    let direction = this.get('direction');

    return items.sortBy(direction);
  }).volatile(),

  /**
   * Register an item with this group.
   *
   * @method registerItem
   * @param {SortableItem} item
   * @public
   */
  registerItem(item) {
    this.get('items').addObject(item);
  },

  /**
   * De-register an item with this group.
   *
   * @method deregisterItem
   * @param {SortableItem} item
   * @public
   */
  deregisterItem(item) {
    this.get('items').removeObject(item);
  },

  /**
   * Prepare for sorting.
   * Main purpose is to stash the current itemPosition so
   * we don’t incur expensive re-layouts.
   *
   * @method prepare
   * @public
   */
  prepare() {
    this._itemPosition = this.get('itemPosition');
  },

  /**
   * Update item positions (relative to the first element position).
   *
   * @method update
   * @public
   */
  update() {
    let sortedItems = this.get('sortedItems');
    // Position of the first element
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
   * Commit the state of dragged items
   *
   * @method commit
   * @public
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
      invokeAction(this, 'onChange', groupModel, itemModels, draggedModel);
    } else {
      invokeAction(this, 'onChange', itemModels, draggedModel);
    }
  }

  /**
   * String name or action function to call whenever the sort order changes.
   *
   * @event onChange
   * @type Action|String
   * @public
   */
});
