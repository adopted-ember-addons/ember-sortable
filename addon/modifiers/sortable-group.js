import Modifier from 'ember-modifier';
import {action, set} from '@ember/object';
import {
  isDownArrowKey,
  isEnterKey,
  isEscapeKey,
  isLeftArrowKey,
  isRightArrowKey,
  isSpaceKey,
  isUpArrowKey
} from "../utils/keyboard";
import {ANNOUNCEMENT_ACTION_TYPES} from "../utils/constant";
import { run } from '@ember/runloop';

const NO_MODEL = {};

/**
 * Modifier to apply a11y support to a group container for the Sortable component
 *
 * @param {Object} api The api from the objected yielded from the Sortable component
 * @param {String} [a11yItemName] A name for each model, used for creating more meaningful a11y announcements.
 * @param {Object} [a11yAnnouncementConfig] A map of action to function to build meaningful a11y announcements.
 * @param {String} [itemVisualClass] A class for styling visual indicators on the yielded `sortable-item`.
 * @param {Object} [handleVisualClass] An object for styling visual indicators on the yielded `sortable-handle` on different `move`.
 *
 * @module drag-drop/draggable-group
 * @example
 * <Sortable @model=model.items @onChange=(action "reorderItems") as |sortable|>
 *    <ol {{sortable-group api=sortable.api a11yAnnouncementConfig=this.myA11yConfig}}>
 *      {{#each sortable.model as |item|}}
 *        <li {{sortable-item api=sortable.api model=item}}>
 *          {{item.name}}
 *          <span class="handle" {{sortable-handle api=sortable.api model=item}}>&varr;</span>
 *        </li>
 *      {{/each}}
 *    </ol>
 *  </Sortable>
 */
export default class SortableGroupModifier extends Modifier {
  sortableApi = {};

  /** Primary keyboard utils */
  // Tracks the currently selected item
  _selectedItem = null;
  // Tracks the current move
  move = null;
  moves = [];

  // Tracks the status of keyboard reorder mode
  isKeyboardReorderModeEnabled = false;

  isKeyDownEnabled = false;

  // Tracks if we're still performing a programmatic focus.
  isRetainingFocus = false;
  /** End of keyboard utils */

  /** Start of a11y properties */
  /**
   * @property an object containing different classes for visual indicators
   * @type {Object}
   * @default null
   * @example
   * {
   *  UP: 'up'
   *  DOWN: 'down',
   *  LEFT: 'left',
   *  RIGHT: 'right',
   * }
   */
  handleVisualClass = NO_MODEL;

  /**
   * @property an object containing functions for producing screen reader announcements
   * @type {Object}
   * @default null
   * @example
   * {
   *  MOVE: function() {},
   *  ACTIVATE: function() {},
   *  CONFIRM: function() {},
   *  CANCEL: function() {},
   * }
   */
  a11yAnnouncementConfig = NO_MODEL;

  itemVisualClass = undefined;

  a11yItemName = undefined;
  /** End of a11y properties */

  /**
   * Make sure that we cancel any ongoing keyboard operation when the focus is lost from the handle.
   * Because this can be fired pre-maturely, effectively cancelling before other keyboard operations,
   * we need to wait until other operations are completed, so this will cancel properly.
   *
   * @param {Event} event a DOM event.
   */
  @action
  focusOut(event) {
    if (!this.isRetainingFocus && !this._isElementWithinHandle(document.activeElement)) {
      this.cancelKeyboardSelection();
    }
    event.stopPropagation();
  }

  /**
   * Explanation
   * 1. `KeyboardReorderMode` is disabled: users can activate it via ENTER or SPACE.
   * 2. `KeyboardReorderMode` is enabled: users can reorder via UP or DOWN arrow keys. TODO: Expand to more keys, e.g LEFT, RIGHT
   * 3. `KeyboardReorderMode` is enabled: users can finalize/save the reordering via ENTER or SPACE.
   * 4. `KeyboardReorderMode` is enabled: users can discard the reordering via ESC.
   *
   * @param {Event} event a DOM event
   */
  @action
  keyDown(event) {
    if (!this.isKeyDownEnabled) {
      return;
    }

    // Note: If handle is specified, we need to target the keyDown on the handle
    const isKeyboardReorderModeEnabled = this.isKeyboardReorderModeEnabled;
    const _selectedItem = this._selectedItem;

    if (!isKeyboardReorderModeEnabled && (isEnterKey(event) || isSpaceKey(event))) {
      this._prepareKeyboardReorderMode();
      this._announceAction(ANNOUNCEMENT_ACTION_TYPES.ACTIVATE);
      this._updateItemVisualIndicators(_selectedItem, true);
      this._updateHandleVisualIndicators(_selectedItem, true);

      this.isRetainingFocus = true;

      run.scheduleOnce('render', () => {
        this.element.focus();
        this.isRetainingFocus = false;
      });

      // Prevent the default scroll
      event.preventDefault();
      return;
    }

    if (isKeyboardReorderModeEnabled) {
      this._handleKeyboardReorder(event);
      event.preventDefault();
    }
  }

  /**
   * Checks if the given element is a child of a handle.
   *
   * @param {Element} element a DOM element.
   */
  _isElementWithinHandle(element) {
    return element.closest(`[data-sortable-handle]`);
  }

  /**
   * Moves an sortedItem from one index to another index, effectively performing an reorder.
   *
   * @param {Integer} fromIndex the original index
   * @param {Integer} toIndex the new index
   */
  _move(fromIndex, toIndex) {
    const direction = this.sortableApi.getDirection();
    const sortedItems = this.sortableApi.getSortedItems();
    const item = sortedItems[fromIndex];
    const nextItem = sortedItems[toIndex];

    // switch direction values to notify sortedItems to update, so it sorts by direction.
    let value;
    const dimension = direction === "y" ? "height" : "width";
    // DOWN or RIGHT
    if (toIndex > fromIndex) {
      value = item[direction];
      set(item, direction, nextItem[direction] + (nextItem[dimension] - item[dimension]));
      set(nextItem, direction, value);
      // UP or LEFT
    } else {
      value = nextItem[direction];
      set(nextItem, direction, item[direction] + (item[dimension] - nextItem[dimension]));
      set(item, direction, value);
    }
  }

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
    const direction = this.sortableApi.getDirection();
    const selectedItem = this._selectedItem;

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
      const itemElement = selectedItem.element;
      this._announceAction(ANNOUNCEMENT_ACTION_TYPES.CONFIRM);
      this.confirmKeyboardSelection();

      this.isRetainingFocus = true;
      run.scheduleOnce('render', () => this._focusItem(itemElement));
    } else if (isEscapeKey(event)) {
      // cancel will reset the selectedItem, so caching it here before we remove it.
      const _selectedItemElement = selectedItem.element;
      this._announceAction(ANNOUNCEMENT_ACTION_TYPES.CANCEL);
      this.cancelKeyboardSelection();

      this.isRetainingFocus = true;
      run.scheduleOnce('render', () => {
        const moves = this.moves;
        if (moves && moves.length > 0) {
          const sortedItems = this.sortedItems;
          const itemElement = sortedItems[moves[0].fromIndex].element
          this._focusItem(itemElement);
        } else {
          this._focusItem(_selectedItemElement);
        }
        this.isRetainingFocus = false;
      });
    }
  }

  /**
   * Moves the item to its new position and adds the move to our history.
   *
   * @param {SortableItemModifier} item the item to be moved.
   * @param {Integer} delta how much to move index-wise.
   */
  moveItem(item, delta) {
    const sortedItems = this.sortableApi.getSortedItems();
    const moves = this.moves;

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
  }

  /**
   * Handles all the necessary operations needed for cancelling the current keyboard selection.
   * 1. Disables keyboard reorder mode.
   * 2. Undo all of the tracked moves.
   * 3. Tears down the application container, so we are not focus locked within the application.
   * 4. Resets the current selected item.
   */
  @action
  cancelKeyboardSelection() {
    const _selectedItem = this._selectedItem;
    this._disableKeyboardReorderMode();
    // Revert the process by reversing the move.
    const moves = this.moves;
    while (moves.length > 0) {
      const move = moves.pop();
      this._move(move[1], move[0])
    }
    this._tearDownA11yApplicationContainer();
    this._updateItemVisualIndicators(_selectedItem, false);
    this._updateHandleVisualIndicators(_selectedItem, false);
    this._resetItemSelection();
  }

  /**
   * Handles all th necessary operations needed for confirming the current keyboard selection.
   * 1. Disables keyboard reorder mode.
   * 2. Tears down the application container, so we are not focus locked within the container.
   * 3. Make sure to update and sync all the internal items and UI.
   * 4. Triggers the `onChange` action if provided.
   * 5. Resets the currently selected item.
   */
  confirmKeyboardSelection() {
    const _selectedItem = this._selectedItem;
    this.moves = [];
    this._disableKeyboardReorderMode();
    this._tearDownA11yApplicationContainer();
    this.sortableApi.commit();
    this._updateItemVisualIndicators(_selectedItem, false);
    this._updateHandleVisualIndicators(_selectedItem, false);
    this._resetItemSelection();
  }

  /**
   * Announces the message constructed from `a11yAnnouncementConfig`.
   *
   * @param {String} type the action type.
   * @param {Number} delta how much distance (item-wise) is being moved.
   */
  _announceAction(type, delta = null) {
    const a11yAnnouncementConfig = this.a11yAnnouncementConfig;
    const a11yItemName = this.a11yItemName;

    if (a11yAnnouncementConfig === NO_MODEL || !a11yItemName || !(type in a11yAnnouncementConfig)) {
      return;
    }

    const sortedItems = this.sortableApi.getSortedItems();
    const _selectedItem = this._selectedItem;
    const index = sortedItems.indexOf(_selectedItem);
    const announcer = this.sortableApi.getAnnouncer();

    const config = {
      a11yItemName,
      index: index,
      maxLength : sortedItems.length,
      direction: this.sortableApi.getDirection(),
      delta,
    };

    const message = a11yAnnouncementConfig[type](config);
    announcer.textContent = message;

    // Reset the message after the message is announced.
    run.later(() => {
      announcer.textContent = '';
    }, 1000);
  }

  /**
   * Reset the selected item.
   */
  _resetItemSelection() {
    this._selectedItem = null;
  }

  /**
   * Updates the selected item's visual indicators.
   *
   * @param {SortableItemModifier} item the selected item.
   * @param {Boolean} isActive to activate or deactivate the class.
   */
  _updateItemVisualIndicators(item, isActive) {

    const itemVisualClass = this.itemVisualClass;

    if (!itemVisualClass || !item) {
      return;
    }

    if (isActive) {
      item.element.classList.add(itemVisualClass);
    } else {
      item.element.classList.remove(itemVisualClass);
    }
  }

  /**
   * Updates the selected item's handle's visual indicators
   *
   * @param {SortableItemModifier} item the selected item.
   * @param {boolean} isUpdate to update or not update.
   */
  _updateHandleVisualIndicators(item, isUpdate) {
    const handleVisualClass = this.handleVisualClass;

    if (handleVisualClass === NO_MODEL || !item) {
      return;
    }

    const sortedItems = this.sortableApi.getSortedItems();
    const direction = this.sortableApi.getDirection();
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
  }

  /**
   * Sets focus on the current item or its handle.
   *
   * @param {Element} itemElement an DOM element representing an sortable-item.
   */
  _focusItem(itemElement) {
    const handle = itemElement.querySelector('[data-sortable-handle]');
    if (handle) {
      handle.focus();
    } else {
      // The consumer did not use a handle, so we set focus back to the item.
      itemElement.focus();
    }
  }

  /**
   * Enables keyboard reorder mode.
   */
  _enableKeyboardReorderMode() {
    this.isKeyboardReorderModeEnabled = true;
  }

  /**
   * Disables keyboard reorder mode
   */
  _disableKeyboardReorderMode() {
    this.isKeyboardReorderModeEnabled = false;
  }

  /**
   * Sets up the group as an application and make it programmatically focusable.
   */
  _setupA11yApplicationContainer() {
    this.element.setAttribute("role", "application");
    this.element.tabIndex = -1;
  }

  /**
   * Tears down the `role=application` container.
   */
  _tearDownA11yApplicationContainer() {
    this.element.removeAttribute("role");
    this.element.removeAttribute("tabIndex");
  }

  _prepareKeyboardReorderMode() {
    this._enableKeyboardReorderMode();
    this._setupA11yApplicationContainer();
  }

  addEventListener() {
    this.element.addEventListener("keydown", this.keyDown);
    this.element.addEventListener("focusout", this.focusOut);
  }

  removeEventListener() {
    this.element.removeEventListener("keydown", this.keyDown);
    this.element.removeEventListener("focusout", this.focusOut);
  }

  didReceiveArguments() {
    this.sortableApi = this.args.named.api;

    if (this.args.named.handleVisualClass !== undefined) {
      this.handleVisualClass = this.args.named.handleVisualClass;
    }

    if (this.args.named.a11yAnnouncementConfig !== undefined) {
      this.a11yAnnouncementConfig = this.args.named.a11yAnnouncementConfig;
    }

    if (this.args.named.itemVisualClass !== undefined) {
      this.itemVisualClass = this.args.named.itemVisualClass;
    }

    if (this.args.named.a11yItemName !== undefined) {
      this.a11yItemName = this.args.named.a11yItemName;
    }

    this.sortableApi.registerGroup(this);

    this.removeEventListener();
    this.addEventListener();

  }

  willRemove() {
    this.sortableApi.deregisterGroup(this);
    this.removeEventListener();
  }

}
