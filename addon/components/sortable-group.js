import { A } from '@ember/array';
import Component from '@ember/component';
import { set, get, computed } from '@ember/object';
import { run } from '@ember/runloop';
import layout from '../templates/components/sortable-group';
import {
  isEnterKey,
  isSpaceKey,
  isEscapeKey,
  isDownArrowKey,
  isUpArrowKey,
  isLeftArrowKey,
  isRightArrowKey,
} from '../utils/keyboard';

const a = A;
const NO_MODEL = {};

export default Component.extend({
  layout,

  attributeBindings: ['data-test-selector', 'tabindex', 'role'],

  /**
    Called when order of items has been changed
    @property onChange
    @type Action
    @param object group model (omitted if not set)
    @param array item models in their new order
    @param object item model just dragged
    @default null
  */
  onChange: function() {},

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
   * @property a group associated with the model
   * @type Any
   * @default null
   */
  groupModel: NO_MODEL,

  /** Primary keyboard utils */
  // Tracks the currently selected item
  selectedItem: null,
  // Tracks the current move
  move: null,
  // Tracks the status of keyboard reorder mode
  isKeyboardReorderModeEnabled: false,
  // Tracks if we're still performing a programmatical focus.
  isRetainingFocus: false,
  /** End of keyboard utils */

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
    const direction = this.get('direction');

    return this.get(`sortedItems.firstObject.${direction}`) - this.get('sortedItems.firstObject.spacing');
  }).volatile(),

  /**
   * An array of DOM elements.
    @property sortedItems
    @type Array
  */
  sortedItems: computed(function() {
    const items = a(this.get('items'));
    const direction = this.get('direction');

    return a(items.sortBy(direction));
  }).volatile(),

  init() {
    this._super(...arguments);

    this.set('moves', []);
  },

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
    Update item positions (relatively to the first element position).
    @method update
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
    @method commit
  */
  commit() {
    const items = this.get('sortedItems');
    const groupModel = this.get('groupModel');
    const itemModels = items.mapBy('model');
    const draggedItem = items.findBy('wasDropped', true);
    let draggedModel;

    if (draggedItem) {
      set(draggedItem, 'wasDropped', false); // Reset
      draggedModel = get(draggedItem, 'model');
    }

    this._updateItems();
    if (groupModel !== NO_MODEL) {
      this.onChange(groupModel, itemModels, draggedModel);
    } else {
      this.onChange(itemModels, draggedModel);
    }
  },

  /**
   * Explanation
   * 1. `KeyboardReorderMode` is disabled: users can activate it via ENTER or SPACE.
   * 2. `KeyboardReorderMode` is enabled: users can reorder via UP or DOWN arrow keys. TODO: Expand to more keys, e.g LEFT, RIGHT
   * 3. `KeyboardReorderMode` is enabled: users can finalize/save the reordering via ENTER or SPACE.
   * 4. `KeyboardReorderMode` is enabled: users can discard the reordering via ESC.
   *
   * @param {Event} evt a DOM event
   */
  keyDown(event) {
    // Note: If handle is specified, we need to target the keyDown on the handle
    const isKeyboardReorderModeEnabled = this.get('isKeyboardReorderModeEnabled');

    if (!isKeyboardReorderModeEnabled && (isEnterKey(event) || isSpaceKey(event))) {
      this.prepareKeyboardReorderMode();
      this.set('isRetainingFocus', true);

      run.scheduleOnce('render', () => {
        this.element.focus();
        this.set('isRetainingFocus', false);
      });

      // Prevent the default scroll
      event.preventDefault();
      return;
    }

    if (isKeyboardReorderModeEnabled) {
      this._handleKeyboardReorder(event);
      event.preventDefault();
    }
  },

  /**
   * Make sure that we cancel any ongoing keyboard operation when the focus is lost from the handle.
   * Because this can be fired pre-maturely, effectively cancelling before other keyboard operations,
   * we need to wait until other operations are completed, so this will cancel properly.
   *
   * @param {Event} event a DOM event.
   */
  focusOut(event) {
    if (!this.get('isRetainingFocus') && !this._isElementWithinHandle(document.activeElement)) {
      this.cancelKeyboardSelection();
    }
    event.stopPropagation();
  },

  prepareKeyboardReorderMode() {
    this._enableKeyboardReorderMode();
    this._setupA11yApplicationContainer();
  },

  /**
   * Moves the item to its new position and adds the move to our history.
   *
   * @param {Object} item the item to be moved.
   * @param {Integer} delta how much to move index-wise.
   */
  moveItem(item, delta) {
    // Guarantees that the before the UI is fully rendered before we move again.
    run.scheduleOnce('render', () => {
      const { sortedItems, moves } = this.getProperties('sortedItems', 'moves');
      const sortedIndex = sortedItems.indexOf(item);
      const newSortedIndex = sortedIndex + delta;
      // If out of bounds, we don't do anything.
      if (newSortedIndex < 0 || newSortedIndex >= sortedItems.length) {
        return;
      }

      this._move(sortedIndex, newSortedIndex);

      moves.push([sortedIndex, newSortedIndex]);
    });
  },

  /**
   * Handles all the necessary operations needed for cancelling the ccurrent keyboard selection.
   * 1. Disables keyboard reorder mode.
   * 2. Undo all of the tracked moves.
   * 3. Tears down the application container, so we are not focus locked within the application.
   * 4. Resets the current selected item.
   */
  cancelKeyboardSelection() {
    this._disableKeyboardReorderMode();
    // Revert the process by reversing the move.
    const moves = this.get('moves');
    while (moves.length > 0) {
      const move = moves.pop();
      this._move(move[1], move[0])
    }
    this._tearDownA11yApplicationContainer();
    this._resetItemSelection();
  },

  /**
   * Handles all th necessary operations needed for confirming the current keyboard selection.
   * 1. Disables keyboard reorder mode.
   * 2. Tears down the application container, so we are not focus locked within the container.
   * 3. Make sure to update and sync all the internal items and UI.
   * 4. Triggers the `onChange` action if provided.
   * 5. Resets the currently selected item.
   */
  confirmKeyboardSelection() {
    const items = this.get('sortedItems');
    const groupModel = this.get('groupModel');
    const selectedModel = this.get('selectedItem.model');
    const itemModels = items.mapBy('model');
    this.set('moves', []);
    this._disableKeyboardReorderMode();
    this._tearDownA11yApplicationContainer();
    this._updateItems();
    if (groupModel !== NO_MODEL) {
      this.onChange(groupModel, itemModels, selectedModel)
    } else {
      this.onChange(itemModels, selectedModel);
    }
    this._resetItemSelection();
  },

  /**
   * Keeps the UI in sync with actual changes.
   * Needed for drag and keyboard operations.
   */
  _updateItems() {
    const items = this.get('sortedItems');

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
  },

  /**
   * Moves an sortedItem from one index to another index, effectively performing an reorder.
   *
   * @param {Integer} fromIndex the original index
   * @param {Integer} toIndex the new index
   */
  _move(fromIndex, toIndex) {
    const { direction, sortedItems } = this.getProperties('direction', 'sortedItems');
    const item = sortedItems[fromIndex];
    const nextItem = sortedItems[toIndex];
    // switch direction values to notify sortedItems to update, so it sorts by direction.
    const value = item.get(direction);
    item.set(direction, nextItem.get(direction));
    nextItem.set(direction, value);
  },

  /**
   * Handles all of the keyboard operations, such as
   * 1. Keyboard navigation for UP, DOWN, LEFT, RIGHT
   * 2. Confirming reorder
   * 3. Discard reorder
   * 4. Also handles refocusing the element that triggered the interaction.
   *
   * @param {Event} event a DOM event.
   */
  _handleKeyboardReorder(event) {
    let  { direction, selectedItem } = this.getProperties('direction', 'selectedItem');

    if (direction === "y" && isDownArrowKey(event)) {
        this.moveItem(selectedItem, 1);
    } else if (direction === "y" && isUpArrowKey(event)) {
        this.moveItem(selectedItem, -1);
    } else if (direction === "x" && isLeftArrowKey(event)) {
        this.moveItem(selectedItem, -1);
    } else if (direction === "x" && isRightArrowKey(event)) {
        this.moveItem(selectedItem, 1);
    } else if (isEnterKey(event) || isSpaceKey(event)) {
      // confirm will reset the selectedItem, so caching it here before we remove it.
      const itemElement = this.get('selectedItem.element');
      this.confirmKeyboardSelection();

      this.set('isRetainingFocus', true);
      run.scheduleOnce('render', () => this._focusItem(itemElement));
    } else if (isEscapeKey(event)) {
      // cancel will reset the selectedItem, so caching it here before we remove it.
      const selectedItemElement = this.get('selectedItem.element');
      this.cancelKeyboardSelection();

      this.set('isRetainingFocus', true);
      run.scheduleOnce('render', () => {
        const moves = this.get('moves');
        if (moves && moves.length > 0) {
          const sortedItems = this.get('sortedItems');
          const itemElement = sortedItems[moves[0].fromIndex].element
          this._focusItem(itemElement);
        } else {
          this._focusItem(selectedItemElement);
        }
        this.set('isRetainingFocus', false);
      });
    }
  },

  /**
   * Sets focus on the current item or its handle.
   *
   * @param {Elment} itemElement an DOM element representing an sortable-item.
   */
  _focusItem(itemElement) {
    const handle = itemElement.querySelector('[data-sortable-handle]');
    if (handle) {
      handle.focus();
    } else {
      // The consumer did not use a handle, so we set focus back to the item.
      itemElement.focus();
    }
  },

  /**
   * Enables keyboard reorder mode.
   */
  _enableKeyboardReorderMode() {
    this.set('isKeyboardReorderModeEnabled', true);
  },

  /**
   * Disables keyboard reorder mode
   */
  _disableKeyboardReorderMode() {
    this.set('isKeyboardReorderModeEnabled', false);
  },

  /**
   * Sets up the group as an application and make it programmatically focusable.
   */
  _setupA11yApplicationContainer() {
    this.setProperties({
      role: 'application',
      tabindex: -1,
    });
  },

  /**
   * Tears down the `role=application` container.
   */
  _tearDownA11yApplicationContainer() {
    this.setProperties({
      role: undefined,
      tabindex: undefined,
    });
  },

  /**
   * Reset the selected item.
   */
  _resetItemSelection() {
    this.set('selectedItem', null);
  },

  /**
   * Checks if the given element is a descedant of a handle.
   *
   * @param {Element} element a DOM element.
   */
  _isElementWithinHandle(element) {
    return element.closest(
      `#${this.element.id} [data-sortable-handle]`
    );
  },
});
