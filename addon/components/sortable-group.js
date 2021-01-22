import { A } from '@ember/array';
import Component from '@ember/component';
import { set, get, computed, defineProperty } from '@ember/object';
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
import {  ANNOUNCEMENT_ACTION_TYPES } from '../utils/constant';

const a = A;
const NO_MODEL = {};

/**
 * This component supports re-ordering items in a group via drag-drop and keyboard navigation.
 * The component is built with accessibility in mind.
 *
 * @param {Ember.Object} groupModel The group of models to be rearranged.
 * @param {Ember.Array} model The array of models.
 * @param {String} a11yItemName A name for each model, used for creating more meaningful a11y announcements.
 * @param {Object} a11yAnnouncementConfig A map of action to function to build meaningful a11y announcements.
 * @param {String} itemVisualClass A class for styling visual indicators on the yielded `sortable-item`.
 * @param {Object} handleVisualClass An object for styling visual indicators on the yielded `sortable-handle` on different `move`.
 * @param {Function} [onChange] An optional callback for when position rearrangements are confirmed.
 *
 * @module drag-drop/draggable-group
 * @example
 * {{#sortable-group data-test-vertical-demo-group tagName="ol" a11yAnnouncementConfig=a11yAnnouncementConfig a11yItemName="spanish number" itemVisualClass=itemVisualClass handleVisualClass=handleVisualClass onChange=(action "update") model=model.items as |group|}}
 *   {{#each group.model as |item|}}
 *     {{#group.item data-test-vertical-demo-item tagName="li" model=item  as |groupItem|}}
 *       {{item}}
 *       {{#groupItem.handle data-test-vertical-demo-handle class="handle"}}
 *         <span data-item={{item}}>
 *           <span>&vArr;</span>
 *         </span>
 *       {{/groupItem.handle}}
 *     {{/group.item}}
 *   {{/each}}
 * {{/sortable-group}}
**/
export default Component.extend({
  layout,
  tagName: 'ol',

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

  /**
   * @property an object containing different classes for visual indicators
   * @type
   * @default null
   * @example
   * {
   *  UP: 'up'
   *  DOWN: 'down',
   *  LEFT: 'left',
   *  RIGHT: 'right',
   * }
   */
  handleVisualClass: NO_MODEL,

  /**
   * @property an object containing functions for producing screen reader announcements
   * @type
   * @default null
   * @example
   * {
   *  MOVE: function() {},
   *  ACTIVATE: function() {},
   *  CONFIRM: function() {},
   *  CANCEL: function() {},
   * }
   */
  a11yAnnouncementConfig: NO_MODEL,

  /** Primary keyboard utils */
  // Tracks the currently selected item
  _selectedItem: null,
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

  init() {
    this._super(...arguments);

    this._setGetterSetters();
    this.set('moves', []);
  },

  didInsertElement() {
    this._super(...arguments);

    // Adding announcer inside an ordered list violates a11y guidelines, so we insert it after our list.
    const announcer = this._createAnnouncer();
    this.set('announcer', announcer);
    this.element.insertAdjacentElement('afterend', announcer);
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
    if (!this.get('isKeyDownEnabled')) {
      return;
    }
    // Note: If handle is specified, we need to target the keyDown on the handle
    const isKeyboardReorderModeEnabled = this.get('isKeyboardReorderModeEnabled');
    const _selectedItem = this.get('_selectedItem');

    if (!isKeyboardReorderModeEnabled && (isEnterKey(event) || isSpaceKey(event))) {
      this.prepareKeyboardReorderMode();
      this._announceAction(ANNOUNCEMENT_ACTION_TYPES.ACTIVATE);
      this._updateItemVisualIndicators(_selectedItem, true);
      this._updateHandleVisualIndicators(_selectedItem, true);

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
    const { sortedItems, moves } = this.getProperties('sortedItems', 'moves');
    const sortedIndex = sortedItems.indexOf(item);
    const newSortedIndex = sortedIndex + delta;

    // If out of bounds, we don't do anything.
    if (newSortedIndex < 0 || newSortedIndex >= sortedItems.length) {
      return;
    }
    this._announceAction(ANNOUNCEMENT_ACTION_TYPES.MOVE, delta);
    // Guarantees that the before the UI is fully rendered before we move again.
    run.scheduleOnce('render', () => {
      this._move(sortedIndex, newSortedIndex);
      this._updateHandleVisualIndicators(item, true);

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
    const _selectedItem = this.get('_selectedItem');
    this._disableKeyboardReorderMode();
    // Revert the process by reversing the move.
    const moves = this.get('moves');
    while (moves.length > 0) {
      const move = moves.pop();
      this._move(move[1], move[0])
    }
    this._tearDownA11yApplicationContainer();
    this._updateItemVisualIndicators(_selectedItem, false);
    this._updateHandleVisualIndicators(_selectedItem, false);
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
    const _selectedItem = this.get('_selectedItem');
    const selectedModel = _selectedItem.get('model');
    const itemModels = items.mapBy('model');
    this.set('moves', []);
    this._disableKeyboardReorderMode();
    this._tearDownA11yApplicationContainer();

    let promise;
    if (groupModel !== NO_MODEL) {
      promise = this.onChange(groupModel, itemModels, selectedModel)
    } else {
      promise = this.onChange(itemModels, selectedModel);
    }

    if (promise && typeof promise.finally === 'function') {
      promise.finally(() => this._updateItems());
    } else {
      this._updateItems();
    }

    this._updateItemVisualIndicators(_selectedItem, false);
    this._updateHandleVisualIndicators(_selectedItem, false);
    this._resetItemSelection();
  },

  /**
   * Enables keyboard navigation
   */
  _activateKeyDown(){
    this.set('isKeyDownEnabled', true);
  },

  /**
   * Disables keyboard navigation
   * Currently used to handle keydown events bubbling up from
   * elements that aren't meant to invoke keyboard navigation
   * by ignoring them.
   */
  _deactivateKeyDown() {
    this.set('isKeyDownEnabled', false);
  },

  /**
    Register an item with this group.
    @method registerItem
    @param {SortableItem} [item]
  */
  _registerItem(item) {
    this.get('items').addObject(item);
  },

  /**
    De-register an item with this group.
    @method deregisterItem
    @param {SortableItem} [item]
  */
  _deregisterItem(item) {
    this.get('items').removeObject(item);
  },

  _setSelectedItem(item) {
    this.set('_selectedItem', item);
  },

  /**
    Prepare for sorting.
    Main purpose is to stash the current itemPosition so
    we don’t incur expensive re-layouts.
    @method _=repare
  */
  _prepare() {
    this._itemPosition = this.get('itemPosition');
  },

  /**
    Update item positions (relatively to the first element position).
    @method update
  */
  _update() {
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
    @method _commit
  */
  _commit() {
    const items = this.get('sortedItems');
    const groupModel = this.get('groupModel');
    const itemModels = items.mapBy('model');
    const draggedItem = items.findBy('wasDropped', true);
    let draggedModel;

    if (draggedItem) {
      set(draggedItem, 'wasDropped', false); // Reset
      draggedModel = get(draggedItem, 'model');
    }

    let promise;
    if (groupModel !== NO_MODEL) {
      promise = this.onChange(groupModel, itemModels, draggedModel);
    } else {
      promise = this.onChange(itemModels, draggedModel);
    }

    if (promise && typeof promise.finally === 'function') {
      promise.finally(() => this._updateItems());
    } else {
      this._updateItems();
    }
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
    let value;
    const dimension = direction === "y" ? "height" : "width";
    // DOWN or RIGHT
    if (toIndex > fromIndex) {
      value = item.get(direction);
      item.set(direction, nextItem.get(direction) + (nextItem.get(dimension) - item.get(dimension)));
      nextItem.set(direction, value);
    // UP or LEFT
    } else {
      value = nextItem.get(direction);
      nextItem.set(direction, item.get(direction) + (item.get(dimension) - nextItem.get(dimension)));
      item.set(direction, value);
    }
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
    let  { direction, _selectedItem } = this.getProperties('direction', '_selectedItem');

    if (direction === "y" && isDownArrowKey(event)) {
      this.moveItem(_selectedItem, 1);
    } else if (direction === "y" && isUpArrowKey(event)) {
      this.moveItem(_selectedItem, -1);
    } else if (direction === "x" && isLeftArrowKey(event)) {
      this.moveItem(_selectedItem, -1);
    } else if (direction === "x" && isRightArrowKey(event)) {
      this.moveItem(_selectedItem, 1);
    } else if (isEnterKey(event) || isSpaceKey(event)) {
      // confirm will reset the _selectedItem, so caching it here before we remove it.
      const itemElement = this.get('_selectedItem.element');
      this._announceAction(ANNOUNCEMENT_ACTION_TYPES.CONFIRM);
      this.confirmKeyboardSelection();

      this.set('isRetainingFocus', true);
      run.scheduleOnce('render', () => this._focusItem(itemElement));
    } else if (isEscapeKey(event)) {
      // cancel will reset the _selectedItem, so caching it here before we remove it.
      const _selectedItemElement = this.get('_selectedItem.element');
      this._announceAction(ANNOUNCEMENT_ACTION_TYPES.CANCEL);
      this.cancelKeyboardSelection();

      this.set('isRetainingFocus', true);
      run.scheduleOnce('render', () => {
        const moves = this.get('moves');
        if (moves && moves.length > 0) {
          const sortedItems = this.get('sortedItems');
          const itemElement = sortedItems[moves[0].fromIndex].element
          this._focusItem(itemElement);
        } else {
          this._focusItem(_selectedItemElement);
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
   * Creates a `visually-hidden` `aria-live` announcement region.
   */
  _createAnnouncer() {
    const announcer = document.createElement('span');
    announcer.setAttribute('aria-live', 'polite');
    announcer.classList.add('visually-hidden');
    return announcer;
  },

  /**
   * Announces the message constructed from `a11yAnnouncementConfig`.
   *
   * @param {String} type the action type.
   * @param {Number} delta how much distance (item-wise) is being moved.
   */
  _announceAction(type, delta = null) {
    const a11yAnnouncementConfig = this.get('a11yAnnouncementConfig');
    const a11yItemName = this.get('a11yItemName');

    if (a11yAnnouncementConfig === NO_MODEL || !a11yItemName || !(type in a11yAnnouncementConfig)) {
      return;
    }

    const sortedItems = this.get('sortedItems');
    const _selectedItem = this.get('_selectedItem');
    const index = sortedItems.indexOf(_selectedItem);
    const announcer = this.get('announcer');

    const config = {
      a11yItemName,
      index: index,
      maxLength : sortedItems.length,
      direction: this.get('direction'),
      delta,
    }

    const message = a11yAnnouncementConfig[type](config);
    announcer.textContent = message;

    // Reset the message after the message is announced.
    run.later(() => {
      announcer.textContent = '';
    }, 1000);
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
    this.set('_selectedItem', null);
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

  /**
   * Updates the selected item's visual indicators.
   *
   * @param {Object} item the selected item.
   * @param {Boolean} isActive to activate or deactivate the class.
   */
  _updateItemVisualIndicators(item, isActive) {
    const itemVisualClass = this.get('itemVisualClass');

    if (!itemVisualClass || !item) {
      return;
    }

    if (isActive) {
      item.element.classList.add(itemVisualClass);
    } else {
      item.element.classList.remove(itemVisualClass);
    }
  },

  /**
   * Updates the selected item's handle's visual indicators
   *
   * @param {Object} item the selected item.
   * @param {Boolean} isUpdate to update or not update.
   */
  _updateHandleVisualIndicators(item, isUpdate) {
    const handleVisualClass = this.get('handleVisualClass');

    if (handleVisualClass === NO_MODEL || !item) {
      return;
    }

    const sortedItems = this.get('sortedItems');
    const direction = this.get('direction');
    const index = sortedItems.indexOf(item);
    const handle = item.element.querySelector('[data-sortable-handle');
    const visualHandle = handle ? handle : item.element;
    const visualKeys = direction === 'y' ? ['UP', 'DOWN'] : ['LEFT', 'RIGHT'];

    visualKeys.forEach(visualKey => {
      visualHandle.classList.remove(handleVisualClass[visualKey]);
    });

    if (!isUpdate) {
      return;
    }

    if (index > 0) {
      visualHandle.classList.add(handleVisualClass[visualKeys[0]]);
    }

    if (index < sortedItems.length - 1) {
      visualHandle.classList.add(handleVisualClass[visualKeys[1]]);
    }
  },

  /**
   * Defining getters and setters to support native getter and setters until we decide to drop support for ember versions below 3.10
   */
  _setGetterSetters() {
    /**
      Position for the first item.
      If spacing is present, first item's position will have to change as well.
      @property itemPosition
      @type Number
    */
    defineProperty(this, 'itemPosition', {
      get() {
        const direction = this.get('direction');

        return this.get(`sortedItems.firstObject.${direction}`) - this.get('sortedItems.firstObject.spacing');
      }
    });

    /**
      An array of DOM elements.
      @property sortedItems
      @type Array
    */
    defineProperty(this, 'sortedItems', {
      get() {
        const items = a(this.get('items'));
        const direction = this.get('direction');

        return a(items.sortBy(direction));
      }
    })
  },

  actions: {
    activateKeyDown(){
      this._activateKeyDown();
    },

    deactivateKeyDown() {
      this._deactivateKeyDown();
    },

    registerItem(item) {
      this._registerItem(item);
    },

    deregisterItem(item) {
      this._deregisterItem(item);
    },

    setSelectedItem(item) {
      this._setSelectedItem(item);
    },

    prepare() {
      this._prepare();
    },

    update() {
      this._update();
    },

    commit() {
      this._commit();
    },
  }
});
