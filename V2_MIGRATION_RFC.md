# Ember Sortable V2 Migration RFC

## Author

[ygongdev](https://github.com/ygongdev)

## Credits

- [jgwhite](https://github.com/jgwhite)
- [H1D](https://github.com/H1D)
- [chriskrycho](https://github.com/chriskrycho)
- [Andrew Lee](https://github.com/drewlee)

## Table of Content

1. [Problem Statement](#problem-statement)
2. [Features](#features)
3. [Design/Architecture](#designarchitecture)
4. [API](#api)
5. [Implementation](#implementation)
6. [Release Plan](#release-plan)
7. [Questions to be addressed](#questions-to-be-addressed)

## Problem Statement

`ember-sortable` has been falling behind in the adoption of the on-going `Ember` upgrades. It is currently not in the right condition, in which we can upgrade the `addon` without many blockers.

This RFC is meant to describe a high level overview of a new `ember-sortable`, which will help push us adopt many of the new `Ember` features.

This RFC is **NOT** meant to show the final implementation details as implementation will be re-iterated and improved over time.

## Features

- Baked in accessibility support
  - Up/down and left/right keyboard navigation
  - Screen reader announcement
  - Focus management
  - Visual indicators
- Direction-agnostic (in terms of mouse drag)
  - Keyboard navigation is limited to up/down/left/right
- Allows nested sortable elements
- Adoption of modern Ember testing infrastructure
- Animation
- Built with composability and customizability in mind

## Design/Architecture

### 1. Contextual Components

The new ember sortable will be designed using contextual components.
It will be made up of 3 main components:

#### Sortable-group

Represents the entire sortable component.

- requires a group of models to sort. The model will be a shallow copy and will not modify the given group of models.
- contains all of main logic that makes `ember-sortable` work.
- yields `sortable-item` and other properties as needed.

#### Sortable-item

Represents the individual `model` of the group of models.

- yields `sortable-handle` and other properties as needed.

#### Sortable-handle

Represents the handle of each `sortable-item`.

This is the bread and butter of the entire component because it is the entrypoint that allows us to start sorting.

This component hooks up your custom handle to the mainframe, `sortable-group`.

- yields other properties as needed.

#### Conceptual Example

```javascript
{{#ember-sortable::sortable-group
  modelGroup=modelGroup
  onSubmit=(action "onSubmit")
  onDragStart=(action "onDragStart")
  onDragEnd=(action "onDragEnd")
  as |group|
}}
  {{#each group.modelGroup as |singleModel index|}}
    {{#group.item
      model=singleModel
      index=index
      as |item|
    }}
      {{!-- You can nest another "sortable-group" here --}}
      {{!-- Content goes here --}}
      {{#item.handle}}
        {{!-- Handle goes here --}}
      {{/item.handle}}
    {{/group.item}}
  {{/each}}
{{/ember-sortable::sortable-group}}
```

### 2. Event driven

Similar to the current `ember-sortable`, the sorting behavior is going to be mainly based on `events`. `Animation` might be an exception.
We will utilize the [Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API), [Keyboard Event API](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent), and/or [Mouse Event API](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent).

### 3. Animation

For `animation`, we can explore different methods, e.g custom implementation, external animation library. However, the final decision will hopefully satisify the following:

- minimize expensive DOM operations, e.g `getComputedStyle`, `Ember runloop scheduling`.
- If we want to test animations, the `animation` have to be deterministic enough for us to test reliably.

### 4. Accessibility

This section provides a high level overview of how we will address the issue of `accessibility`.

**The accessibility solutions described are directly referenced from this awesome [codepen demo](https://codepen.io/drewlee/project/full/XWNLeE) made by Andrew Lee.**

#### Keyboard Navigation

**1. Keyboard Reorder Mode**

- To initiate `keyboardReorderMode`, a `sortable-handle` must be `focused` and an `Enter/Space` must be pressed.
- This operation selects `sortable-item` parent of the `sortable-handle` and enable sorting the `sortable-item` within the `sortable-group` via up/down/left/right arrow keys.
- We will set `sortable-group` as a dedicated `container` by adding `role` attribute and programmatically set the `focus` onto it.
- We will create a `visual color indicator` around the selected `sortable-item`. A screen reader announcement will also be made to inform the user that the `sortable-item` has been selected and `sorting` has been enabled.
- To create `visual indicators`, `sortable-item` will append some `classes`, which by default tries to create `arrow` visual indcators around `sortable-item`. However, consumers are free to override the `class` to customize their own. `Visual indicators` will move as the`sortable-item` moves.

**2. Commit**

- Every navigation will reorder the components in the UI. However, the reorder will not be `committed` until an `Enter/Space` key has been pressed. If committed, the `focus` will move from the `sortable-group` back to the `sortable-handle`. `role` will be removed.

**3. Reset**

- The user can also exit `keyboardReorderMode` via `Escape` key or on focus lost. This will reset the reordering back to its initial state and `focus` is retained on the `sortable-handle`. `role` will be removed.
- We should not need animation for this.

#### Drag Drop

Drag drop will retain the same behavior as the current `ember-sortable`.

#### Screen Reader Announcements

- Internally, we can use a `announceActionConfig` object to map an `action` to a `text`. We can have some default texts.
- To support `i18n`, the consumer can supply their own `announceActionConfig` with their translated strings.

### 5. Utility Classes and Functions

We should create a utility class to abstract as much work as we can from the components.

For example, a `keyboardManager` class can be used to maintain a history of our operations as well as provide the functionalities to perform the reordering logic during `keyboard navigation`.

### 6. Testing

The current `ember-sortable` implements two test helpers

- reorder
- drag

Both are heavily DOM calculation driven and can sometimes be hard and unreliable to use.

I propose new `event driven` test helpers and perhaps remove `reorder` as it is just a combination of `drag`. Internally, these would be just triggering `events`, which should be determinstic to test.

- drag (for mouse)
- move (for keyboard)
- reorder?

We can implement another `drag` that is dedicated to testing `animation`.

## API

TBD

## Implementation

**NOTE**
This is an example to help give an idea of what it could look like.
This is **NOT** meant to be the final implementation.
This example does **NOT** contain how we would handle animation and horizontal keyboard sorting.
While creating this, I used the name `draggable` instead of `ember-sortable`.

### draggable-group

#### hbs

```javascript
{{yield
  (hash
    item=(
      component "drag-drop@-private/draggable-item"
      onSelect=(action "onModelSelect")
      onDragStart=(action "onModelDragStart")
      onDragEnter=(action "onModelDragEnter")
      isKeyboardReorderModeEnabled=isKeyboardReorderModeEnabled
      selectedModelIndex=selectedModelIndex
      maxIndex=maxIndex
      itemName=itemName
    )
    modelGroup=modelGroupCopy
  )
}}
```

#### js

```javascript
/**
 * This component supports re-ordering items in a group via drag-drop and keyboard navigation.
 * The component is built with accessibility in mind. The logic of the component are mostly derived from https://codepen.io/drewlee/project/full/XWNLeE.
 *
 * @param {Ember.Array} modelGroup the group of models to be rearranged.
 * @param {String} itemName A name for the individual models, used for creating more meaningful a11y announcements.
 * @param {Function} [onSubmit] An optional callback for when position rearrangements are confirmed.
 * @param {Function} [onDragStart] An optional callback for when the user starts dragging a model.
 * @param {Funtion} [onDragEnd] An optional callback for when the user has finished dragging a model.
 *
 * @module drag-drop/draggable-group
 * @example
 * {{#drag-drop::draggable-group
 *   onSubmit=(action onSubmit)
 *   modelGroup=modelGroup
 *   onDragStart=(action onDragStart)
 *   onDragEnd=(action onDragEnd)
 *   itemName=itemName
 *   as |group|
 * }}
 *   {{#each group.modelGroup as |singleModel index|}}
 *     {{#group.item
 *       model=singleModel
 *       index=index
 *       as |item|
 *     }}
 *       {{singleModel}}
 *       {{#item.handle}}
 *         Handle
 *       {{/item.handle}}
 *     {{/group.item}}
 *   {{/each}}
 * {{/drag-drop::draggable-group}}
 */
export default Component.extend({
  layout,
  attributeBindings: ['tabindex', 'role', 'dataTestDragDropDraggableGroup:data-test-drag-drop-draggable-group'],
  // data-test selector
  dataTestDragDropDraggableGroup: true,
  /**
   * @param {Boolean} isKeyboardReorderModeEnabled if the keyboard navigation can be utilized.
   * @param {Object} selectedModel the selected model that the user is repositioning.
   * @param {Integer} selectedModelIndex the position of the selected model in the DOM.
   * @param {Object} targetModel the targeted model that the user is dropping the dragged model onto.
   * @param {Integer} targetModelIndex the index of the targeted model.
   * @param {Boolean} isRetainingFocus if the focus is being managed. This is usually to prevent incorrect focus when the DOM is not ready.
   * @param {Integer} tabindex tabindex attribute.
   * @param {String} role role attribute.
   * @param {Integer} maxIndex the highest possible index within the group.
   */
  isKeyboardReorderModeEnabled: false,
  selectedModel: null,
  selectedModelIndex: -1,
  targetModel: null,
  targetModelIndex: -1,
  isRetainingFocus: false,
  tabindex: undefined,
  role: undefined,
  maxIndex: alias('modelGroup.length'),

  a11yNotification: service('a11y-notification'),
  i18n: service('i18n'),

  init() {
    this._super(...arguments);

    this._assertProperties();

    // Create a shallow copy of the origina group to prevent mutating the original group.
    const modelGroupCopy = [...get(this, 'modelGroup')];
    setProperties(this, {
      modelGroupCopy,
      keyboardReorderManager: new KeyboardReorderManager(modelGroupCopy),
    });
  },

  /**
   * Explanation
   * 1. `KeyboardReorderMode` is disabled: users can activate it via ENTER or SPACE.
   * 2. `KeyboardReorderMode` is enabled: users can reorder via UP or DOWN arrow keys. TODO: Expand to more keys, e.g LEFT, RIGHT
   * 3. `KeyboardReorderMode` is enabled: users can finalize/save the reordering via ENTER or SPACE.
   * 4. `KeyboardReorderMode` is enabled: users can discard the reordering via ESC.
   *
   * @param {Event} evt a HTML event
   */
  keyDown(evt) {
    const isKeyboardReorderModeEnabled = get(this, 'isKeyboardReorderModeEnabled');

    if (!isKeyboardReorderModeEnabled && (isEnterKey(evt) || isSpaceKey(evt))) {
      this._enableKeyboardReorderMode();
      this._setupA11yApplicationContainer();

      set(this, 'isRetainingFocus', true);
      mutateDOM(() => {
        this.element.focus();
        set(this, 'isRetainingFocus', false);
      });

      evt.preventDefault();
      // In case of nested groups, prevent the keyDown from bubbling up to the parent.
      evt.stopPropagation();
      return;
    }

    if (isKeyboardReorderModeEnabled) {
      const { selectedModelIndex, maxIndex } = getProperties(this, 'selectedModelIndex', 'maxIndex');
      if (isDownArrowKey(evt)) {
        const newIndex = Math.min(selectedModelIndex + 1, maxIndex - 1);
        this._moveItem(selectedModelIndex, newIndex);

        set(this, 'selectedModelIndex', newIndex);

        this._announceAction(ANNOUNCEMENT_ACTION_TYPES.MOVE, {
          index: newIndex,
          maxIndex,
        });
        evt.preventDefault();
      } else if (isUpArrowKey(evt)) {
        const newIndex = Math.max(selectedModelIndex - 1, 0);

        this._moveItem(selectedModelIndex, newIndex);

        set(this, 'selectedModelIndex', newIndex);

        this._announceAction(ANNOUNCEMENT_ACTION_TYPES.MOVE, {
          index: newIndex,
          maxIndex,
        });
        // prevent mouse scroll
        evt.preventDefault();
      } else if (isEnterKey(evt) || isSpaceKey(evt)) {
        set(this, 'isRetainingFocus', true);
        this._confirmKeyboardSelection();

        readDOM(() => {
          if (IS_BROWSER) {
            this.element.querySelectorAll(`[${DRAGGABLE_HANDLE_ATTRIBUTE}]`)[selectedModelIndex].focus();
            set(this, 'isRetainingFocus', false);
          }
        });

        evt.preventDefault();
      } else if (isEscapeKey(evt)) {
        const keyboardReorderManager = get(this, 'keyboardReorderManager');
        const record = keyboardReorderManager.getRecord();
        const lastIndex = record ? record.fromIndex : selectedModelIndex;

        set(this, 'isRetainingFocus', true);
        this._cancelKeyboardSelection();

        readDOM(() => {
          if (IS_BROWSER) {
            this.element.querySelectorAll(`[${DRAGGABLE_HANDLE_ATTRIBUTE}]`)[lastIndex].focus();
            set(this, 'isRetainingFocus', false);
          }
        });

        evt.preventDefault();
      }
    }
    // In case of nested groups, prevent the keyDown from bubbling up to the parent.
    evt.stopPropagation();
  },

  /**
   * If focus management is not finished and the current focused element is not the handle or descendant of the handle: Cancel
   */
  focusOut(evt) {
    if (IS_BROWSER && !get(this, 'isRetainingFocus') && !this._isElementWithinHandle(document.activeElement)) {
      this._cancelKeyboardSelection();
    }
    evt.stopPropagation();
  },

  /**
   * Reset any ongoing keyboard selections and disable keyboard navigation because drag is taking over.
   * Invokes any optional `onDragStart` callback.
   *
   * @param {Event} evt a HTML event
   */
  dragStart(evt) {
    const keyboardReorderManager = get(this, 'keyboardReorderManager');

    keyboardReorderManager.reset();
    this._disableKeyboardReorderMode();
    evt.dataTransfer.setData('text/plain', '');
    tryInvoke(this, 'onDragStart');
    // In case of nested models, prevent the parent from being dragged instead of the child.
    evt.stopPropagation();
  },

  /**
   * Invoke optional `onDragEnd` callback.
   */
  dragEnd(evt) {
    tryInvoke(this, 'onDragEnd');
    // In case of nested models, prevent invoking parent's handler.
    evt.stopPropagation();
  },

  /**
   * Need `preventDefault` to allow `drop` to happen.
   *
   * @param {Event} evt a HTML event
   */
  dragOver(evt) {
    evt.preventDefault();
  },

  /**
   * If target drop area is within the group, execute the `drop` by
   * 1. Moving the `selectedModel` to the `targetModel` position
   * 2. Invoke the `onSubmit` callback since the new order is confirmed.
   * 3. Reset everything.
   *
   * @param {Event} evt a HTML event
   */
  drop(evt) {
    const dropTarget = evt.target;
    evt.preventDefault();
    if (this._isElementWithinDrop(dropTarget)) {
      const { keyboardReorderManager, selectedModel, selectedModelIndex, targetModel, targetModelIndex } =
        getProperties(
          this,
          'keyboardReorderManager',
          'selectedModel',
          'selectedModelIndex',
          'targetModel',
          'targetModelIndex'
        );
      this._moveItem(selectedModelIndex, targetModelIndex);
      tryInvoke(this, 'onSubmit', [selectedModel, selectedModelIndex, targetModel, targetModelIndex]);
      keyboardReorderManager.clearRecord();
    }
    this._resetModelSelection();
    // In case of nested models, prevent the parent from being dropped instead of the child.
    evt.stopPropagation();
  },

  /**
   * Confirms the keyboard selection by:
   * 1. Clearing the tracked record movement.
   * 2. Disabling keyboard navigation.
   * 3. Resets model selections.
   * 4. Tear down a11y container.
   * 5. Invoke `onSubmit` callback.
   * 6. Announce the change.
   */
  _confirmKeyboardSelection() {
    const { keyboardReorderManager, selectedModel, selectedModelIndex, targetModel, targetModelIndex } = getProperties(
      this,
      'keyboardReorderManager',
      'selectedModel',
      'selectedModelIndex',
      'targetModel',
      'targetModelIndex'
    );

    keyboardReorderManager.clearRecord();
    this._disableKeyboardReorderMode();
    this._tearDownA11yApplicationContainer();

    tryInvoke(this, 'onSubmit', [selectedModel, selectedModelIndex, targetModel, targetModelIndex]);

    this._resetModelSelection();
    this._announceAction(ANNOUNCEMENT_ACTION_TYPES.CONFIRM);
  },

  /**
   * Cancels the keyboard selection by:
   * 1. Disabling the keyboard navigation.
   * 2. Reset model selections.
   * 3. Reset any tracked movement by reverting the move and clearing the record.
   * 4. Tear down a11y container.
   * 4. Announce the change.
   */
  _cancelKeyboardSelection() {
    const keyboardReorderManager = get(this, 'keyboardReorderManager');

    this._disableKeyboardReorderMode();

    this._resetModelSelection();

    keyboardReorderManager.reset();

    this._tearDownA11yApplicationContainer();

    this._announceAction(ANNOUNCEMENT_ACTION_TYPES.CANCEL);
  },

  /**
   * Rearranges the order of models inside `modelGroupCopy`.
   *
   * @param {Integer} oldIndex the position of the model to be moved.
   * @param {Integer} newIndex the position that the model is moving to.
   */
  _moveItem(oldIndex, newIndex) {
    const keyboardReorderManager = get(this, 'keyboardReorderManager');

    keyboardReorderManager.move(oldIndex, newIndex);
  },

  /**
   * Reset model selection
   */
  _resetModelSelection() {
    setProperties(this, {
      selectedModel: null,
      selectedModelIndex: -1,
      targetModel: null,
      targetedModelIndex: -1,
    });
  },

  /**
   * Sets up a `role=application` container.
   */
  _setupA11yApplicationContainer() {
    setProperties(this, {
      role: 'application',
      tabindex: -1,
    });
  },

  /**
   * Tears down the `role=application` container.
   */
  _tearDownA11yApplicationContainer() {
    setProperties(this, {
      role: undefined,
      tabindex: undefined,
    });
  },

  /**
   * Asserts that required properties are defined correctly.
   */
  _assertProperties() {
    assert('modelGroup is required', get(this, 'modelGroup'));
    assert('itemName is required', get(this, 'itemName'));
  },

  /**
   * Enables keyboard navigation.
   */
  _enableKeyboardReorderMode() {
    set(this, 'isKeyboardReorderModeEnabled', true);
  },

  /**
   * Disables keyboard navigation.
   */
  _disableKeyboardReorderMode() {
    set(this, 'isKeyboardReorderModeEnabled', false);
  },

  /**
   * Checks if the given element is a descedant of a handle.
   *
   * @param {Element} element a DOM element.
   */
  _isElementWithinHandle(element) {
    return element.closest(`#${this.element.id} [${DRAGGABLE_HANDLE_ATTRIBUTE}]`);
  },

  /**
   * Checks if the given element is a descedant of a droppable region.
   *
   * @param {Element} element a DOM element
   */
  _isElementWithinDrop(element) {
    return element.closest(`#${this.element.id} [${DRAGGABLE_ITEM_ATTRIBUTE}]`);
  },

  /**
   * Helper method for extracting i18n strings used in JS
   *
   * @method geti18nMessage
   * @param {String} key - Unique key that identifies an i18n string
   * @param {Object} data - Dynamic segments of an i18n string
   * @return {Function}
   */
  _geti18nMessage(key, data) {
    const messageRenderer = get(this, 'i18n').getMessageRenderer(get(this, 'layout'), key);
    return messageRenderer([data]);
  },

  /**
   * Announce action for screen reader.
   *
   * @param {Enum} announcementType
   * @param {Object} announcementConfig
   */
  _announceAction(announcementType, announcementConfig = {}) {
    const a11yNotification = get(this, 'a11yNotification');

    let message;
    const itemName = get(this, 'itemName');
    const { index, maxIndex } = announcementConfig;

    switch (announcementType) {
      case ANNOUNCEMENT_ACTION_TYPES.ACTIVATE:
        message = this._geti18nMessage('i18n_activate', {
          itemName,
          index,
          maxIndex,
        });
        break;
      case ANNOUNCEMENT_ACTION_TYPES.MOVE:
        message = this._geti18nMessage('i18n_move', {
          itemName,
          index,
          maxIndex,
        });
        break;
      case ANNOUNCEMENT_ACTION_TYPES.CONFIRM:
        message = this._geti18nMessage('i18n_confirm', { itemName });
        break;
      case ANNOUNCEMENT_ACTION_TYPES.CANCEL:
        message = this._geti18nMessage('i18n_cancel', { itemName });
        break;
      default:
        break;
    }
    a11yNotification.setTextInLiveRegion(message);
  },

  actions: {
    /**
     * Enables keyboard navigation.
     */
    enableKeyboardReorderMode() {
      this._enableKeyboardReorderMode();
    },

    /**
     * Enables keyboard navigation.
     */
    disableKeyboardReorderMode() {
      this._disableKeyboardReorderMode();
    },

    /**
     * `draggable-item` invokes this when it is selected via keyboard.
     *
     * @param {Object} model the selected model.
     * @param {Integer} index the position of the selected model in the DOM.
     */
    onModelSelect(model, index) {
      setProperties(this, {
        selectedModel: model,
        selectedModelIndex: index,
      });
    },

    /**
     * `draggable-item` invokes this when it starts being dragged.
     *
     * @param {Object} model the model being dragged.
     * @param {Integer} index the position of the dragged model in the DOM.
     */
    onModelDragStart(model, index) {
      setProperties(this, {
        selectedModel: model,
        selectedModelIndex: index,
      });
    },

    /**
     * `draggable-item` invokes this when a dragged model enters the target model's region
     *
     * @param {Object} model the target model.
     * @param {Integer} index the position of the target model in the DOM.
     */
    onModelDragEnter(model, index) {
      setProperties(this, {
        targetModel: model,
        targetModelIndex: index,
      });
    },
  },
});
```

### draggable-item

#### hbs

```javascript
{{yield
  (hash
    handle=(component "drag-drop@-private/draggable-handle"
      enableDrag=(action "enableDrag")
      disableDrag=(action "disableDrag")
      isKeyboardReorderModeEnabled=isKeyboardReorderModeEnabled
      selectedIndex=selectedModelIndex
      index=index
      maxIndex=maxIndex
      a11yText=(some-i18n-util itemName=itemName)
    )
  )
}}
```

#### js

```javascript
/**
 * This private component represents the individual model of `draggable-group`.
 *
 * Public API
 * @param {Function}  model the model that this component is associated with.
 * @param {Function}  index the position of this component in the DOM.
 *
 * Private API
 * @param {Boolean}  isKeyboardReorderModeEnabled If the keyboard navigation can be utilized.
 * @param {Integer}  selectedModelIndex The position of the selected model in the DOM.
 * @param {Integer}  maxIndex The highest possible index within the group.
 * @param {String}  itemName A name for the individual models, used for creating more meaningful a11y announcements.
 * @param {Function}  onDragStart Callback to notify `draggable-group` that this component is being dragged.
 * @param {Function}  onDragEnter Callback to notify `draggable-group` that this component is can be dropped on.
 *
 * @module drag-drop/-private/draggable-item
 */
export default Component.extend({
  tagName: 'div',
  classNameBindings: ['isSelected:drag-drop__item--active'],
  attributeBindings: [
    'draggable',
    `dataDragDropItem:${DRAGGABLE_ITEM_ATTRIBUTE}`,
    `dataTestDragDropDraggableItem:data-test-drag-drop-draggable-item`,
  ],
  // data attribute
  dataDragDropItem: true,
  // data-test selector
  dataTestDragDropDraggableItem: true,
  // native attribute allowing element to be draggable.
  draggable: false,

  /**
   * Toggles a visual state for a11y purpose.
   *
   * @param {Integer} selectedModelIndex the position of the selected model in the DOM.
   * @param {Integer} index the position of this model in the DOM.
   */
  isSelected: computed('selectedModelIndex', 'index', function getIsSelected() {
    const { selectedModelIndex, index } = getProperties(this, 'selectedModelIndex', 'index');

    return selectedModelIndex === index;
  }),

  onDragStart() {
    assert('onDragStart is required');
  },

  onDragEnter() {
    assert('onDragEnter is required');
  },

  init() {
    this._super(...arguments);
    this._assertProperties();
  },

  /**
   * Pass the selected model up to the `draggable-group`, so the group knows which model is being selected.
   *
   * @param {Event} evt a HTML event.
   */
  keyDown(evt) {
    const { isKeyboardReorderModeEnabled, model, selectedModelIndex, index } = getProperties(
      this,
      'isKeyboardReorderModeEnabled',
      'model',
      'selectedModelIndex',
      'index'
    );

    if (
      selectedModelIndex < 0 &&
      (isKeyboardReorderModeEnabled || (!isKeyboardReorderModeEnabled && (isEnterKey(evt) || isSpaceKey(evt))))
    ) {
      this.onSelect(model, index);
    }
  },

  /**
   * Invoke `onDragStart` callback from `draggable-group`.
   */
  dragStart() {
    this.onDragStart(get(this, 'model'), get(this, 'index'));
  },

  /**
   * Invoke `_disableDrag` callback from `draggable-group`.
   */
  dragEnd() {
    this._disableDrag();
  },

  /**
   * Invoke `onDragEnter` callback from `draggable-group`.
   */
  dragEnter() {
    this.onDragEnter(get(this, 'model'), get(this, 'index'));
  },

  /**
   * Asserts that required properties are defined correctly.
   */
  _assertProperties() {
    assert('isKeyboardReorderModeEnabled is required', get(this, 'isKeyboardReorderModeEnabled') !== undefined);
    assert('selectedModelIndex is required', get(this, 'selectedModelIndex') !== undefined);
    assert('maxIndex is required', get(this, 'maxIndex') !== undefined);
    assert('itemName is required', get(this, 'itemName') !== undefined);
  },

  /**
   * Enables this item to be draggable.
   */
  _enableDrag() {
    set(this, 'draggable', true);
  },

  /**
   * Disables this item from being draggable.
   */
  _disableDrag() {
    set(this, 'draggable', false);
  },

  actions: {
    /**
     * Callback for `draggable-handle` to enable draggable.
     */
    enableDrag() {
      this._enableDrag();
    },

    /**
     * Callback for `draggable-handle` to disable draggable.
     */
    disableDrag() {
      this._disableDrag();
    },
  },
});
```

### draggable-handle

#### hbs

```javascript
{
  {
    yield;
  }
}
<span class="visually-hidden">{{ a11yText }}</span>;
```

#### js

```javascript
/**
 * This private component represents the `handle` for each `draggable-item` of a `draggable-group`.
 *
 * @param {Boolean} isKeyboardReorderModeEnabled If the keyboard navigation can be utilized.
 * @param {Integer} selectedIndex The position of the selected model in the DOM.
 * @param {Integer} index The position of this component in the DOM.
 * @param {Integer} maxIndex  The highest possible index within the group.
 * @param {String} a11yText The text for this handle.
 * @param {Function} enableDrag Callback to make `draggable-item` draggable.
 * @param {Function} disableDrag Callback to make `draggable-item` not draggable.
 *
 * @module drag-drop/-private/draggable-handle
 */
export default Component.extend({
  /**
   * <div> and tabindex: 0 is used intentionally to make the element non-interactive, so it works with Windows screen reader.
   */
  tagName: 'div',
  tabindex: 0,
  classNameBindings: ['showA11yPreviousArrow:drag-drop__handle-previous', 'showA11yNextArrow:drag-drop__handle-next'],
  attributeBindings: [
    `dataDragDropHandle:${DRAGGABLE_HANDLE_ATTRIBUTE}`,
    'tabindex',
    'dataTestDragDropDraggableHandle:data-test-drag-drop-draggable-handle',
  ],
  // data attribute
  dataDragDropHandle: true,
  // data-test selector
  dataTestDragDropDraggableHandle: true,

  /**
   * Shows the previous arrow.
   * 1. keyboard navigation is enabled.
   * 2. This handle is selected.
   * 3. This handle is not the first handle.
   *
   * @param {Integer} index The position of this component in the DOM.
   * @param {Integer} selectedIndex The position of the selected model in the DOM.
   * @param {Boolean} isKeyboardReorderModeEnabled If the keyboard navigation can be utilized.
   */
  showA11yPreviousArrow: computed(
    'index',
    'selectedIndex',
    'isKeyboardReorderModeEnabled',
    function getShowA11yPreviousArrow() {
      const { index, selectedIndex, isKeyboardReorderModeEnabled } = getProperties(
        this,
        'index',
        'selectedIndex',
        'isKeyboardReorderModeEnabled'
      );
      return isKeyboardReorderModeEnabled && selectedIndex === index && index > 0;
    }
  ),

  /**
   * Shows the next arrow if
   * 1. keyboard navigation is enabled.
   * 2. This handle is selected.
   * 3. This handle is not the last handle.
   *
   * @param {Integer} index The position of this component in the DOM.
   * @param {Integer} selectedIndex The position of the selected model in the DOM.
   * @param {Boolean} isKeyboardReorderModeEnabled If the keyboard navigation can be utilized.
   */
  showA11yNextArrow: computed(
    'index',
    'selectedIndex',
    'maxIndex',
    'isKeyboardReorderModeEnabled',
    function getShowA11yNextArrow() {
      const { index, selectedIndex, maxIndex, isKeyboardReorderModeEnabled } = getProperties(
        this,
        'index',
        'maxIndex',
        'selectedIndex',
        'isKeyboardReorderModeEnabled'
      );
      return isKeyboardReorderModeEnabled && selectedIndex === index && index < maxIndex - 1;
    }
  ),

  enableDrag() {
    assert('enableDrag is required');
  },

  disableDrag() {
    assert('disableDrag is required');
  },

  init() {
    this._super(...arguments);

    this._assertProperties();
  },

  /**
   * Asserts that required properties are defined correctly.
   */
  _assertProperties() {
    assert(`a11yText is required`, get(this, 'a11yText'));
    assert(`index is required`, get(this, 'index') !== undefined);
    assert(`maxIndex is required`, get(this, 'maxIndex') !== undefined);
    assert(`selectedIndex is required`, get(this, 'selectedIndex') !== undefined);
    assert(`isKeyboardReorderModeEnabled is required`, get(this, 'isKeyboardReorderModeEnabled') !== undefined);
  },

  /**
   * Enables `draggable-item` to be draggable.
   */
  mouseDown() {
    this.enableDrag();
  },

  /**
   * Disable `draggable-item` from being draggable.
   */
  mouseUp() {
    this.disableDrag();
  },
});
```

### utils/constants.js

```javascript
export const DRAGGABLE_HANDLE_ATTRIBUTE = 'data-drag-drop-draggable-handle';
export const DRAGGABLE_ITEM_ATTRIBUTE = 'data-drag-drop-draggable-item';
export const ANNOUNCEMENT_ACTION_TYPES = {
  ACTIVATE: true,
  MOVE: true,
  CONFIRM: true,
  CANCEL: true,
};
```

### utils/keyboard-reorder-manager.js

```javascript
class ReorderRecord {
  constructor(fromIndex, toIndex) {
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
  }
}

export default class KeyboardReorderManager {
  constructor(modelGroup) {
    this._modelGroup = modelGroup;
    this._record = null;
  }

  move(fromIndex, toIndex) {
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= this._modelGroup.length || toIndex >= this._modelGroup.length) {
      return;
    }

    const modelToBeMoved = this._modelGroup.objectAt(fromIndex);
    this._modelGroup.removeAt(fromIndex);
    this._modelGroup.insertAt(toIndex, modelToBeMoved);

    if (!this._record) {
      this._record = new ReorderRecord(fromIndex, toIndex);
    } else {
      this._record.toIndex = toIndex;
    }
  }

  getModel() {
    return this._modelGroup;
  }

  getRecord() {
    return this._record;
  }

  clearRecord() {
    this._record = null;
  }

  reset() {
    if (this._record) {
      this.move(this._record.toIndex, this._record.fromIndex);
    }
    this.clearRecord();
  }
}
```

## Release Plan

### 2.0

- New API with backward incompatible changes
  - Drag drop
  - Animation
  - Test helper
- Test Infrastructure Modernization
  - remove `registerAsyncHelper`
  - `module` and `setupHooks` syntax
- Remove `jQuery` in favor of vanilla.
- Migration Guide
  - 1.x.x -> 2.x.x

### 2.1

- Keyboard support
  - Keyboard navigation (left/right/up/down)
  - Commit
  - Reset

### 2.2

- Accessibility support
  - Screen reader announcements
  - Focus management
  - Semantic markup and attributes

### 2.3

- Nesting support

## Questions to be addressed

1. With the introduction of Ember Octane and glimmer components, should we use any of their features? How backward compatible should this be?

2. Will an external animation library be of high value to us? If so, will the extra overhead be problematic?
