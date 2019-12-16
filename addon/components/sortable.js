import Component from '@ember/component';
import template from '../templates/components/sortable';
import {computed, action, set} from '@ember/object';
import { run } from '@ember/runloop';

const NO_MODEL = {};

/**
 * This component supports re-ordering items in a group via drag-drop and keyboard navigation.
 * The component is built with accessibility in mind.
 *
 * @param {Array} model The array of models.
 * @param {Function} [onChange] An optional callback for when position rearrangements are confirmed.
 * @param {Object} [groupModel] The group of models to be rearranged.
 *
 * @module drag-drop/draggable-group
 * @example
 * <Sortable @model=model.items @onChange=(action "reorderItems") as |sortable|>
 *    <ol {{sortable-group api=sortable.api}}>
 *      {{#each sortable.model as |item|}}
 *        <li {{sortable-item api=sortable.api model=item}}>
 *          {{item.name}}
 *          <span class="handle" {{sortable-handle api=sortable.api model=item}}>&varr;</span>
 *        </li>
 *      {{/each}}
 *    </ol>
 *  </Sortable>
 **/
export default class Sortable extends Component {
  tagName = "";
  layout = template;

  /**
   Called when order of items has been changed
   @property onChange
   @type Function
   @param {Object} groupModel group model (omitted if not set)
   @param {Object[]} newModel models in their new order
   @param {Object} itemModel model just dragged
   @default null
   */
  onChange = () => {};

  /**
   @property direction
   @type string
   @default y
   */
  _direction = "y";
  get direction() {
    return this._direction;
  }
  set direction(value) {
    if (value !== 'x') {
      value = 'y';
    }

    this._direction = value;
  }

  /**
   @property model
   @type Object[]
   @default null
   */
  model = NO_MODEL;

  /**
   * @property a group associated with the model
   * @type Any
   * @default null
   */
  groupModel = NO_MODEL;

  /**
   This is an array of the objects that each have the following properties
       model - The model of this item
       element - the element of this item in the dom

   @property items
   @type SortableItemModifier[]
   */
  items = [];

  /**
   * Announcer element
   *
   * @type {Element}
   */
  announcer = null;

  /**
   * The group Modifier
   *
   * @type {SortableGroupModifier}
   * @private
   */
  _group = null;

  /**
   Position for the first item.
   If spacing is present, first item's position will have to change as well.
   @property itemPosition
   @type Number
   */
  @computed("direction", "sortedItems")
  get itemPosition() {
    const direction = this.direction;
    const sortedItems = this.sortedItems;

    return sortedItems[0][`${direction}`] - sortedItems[0].spacing;
  }

  /**
   An array of DOM elements.
   @property sortedItems
   @type SortableItemModifier[]
   */
  get sortedItems() {
    const direction = this.direction;
    return this.items.sort((a, b) => a[direction] - b[direction]);
  }

  /**
   * Enables keyboard navigation
   */
  @action
  activateKeyDown(selectedItem){
    if (this._group) {
      this._group._selectedItem = selectedItem;
      this._group.isKeyDownEnabled = true;
    } else {
      console.warn("You need to have a sortable-group to use keyboard navigation")
    }
    // TODO on the else, should we warn them they dont hava a sortable-group defined?
  }

  /**
   * Disables keyboard navigation
   * Currently used to handle keydown events bubbling up from
   * elements that aren't meant to invoke keyboard navigation
   * by ignoring them.
   */
  @action
  deactivateKeyDown() {
    if (this._group) {
      this._group.isKeyDownEnabled = false;
    }
  }

  /**
   Register an item with this group.
   @method registerItem
   @param {SortableItemModifier} item
   */
  @action
  registerItem(item) {
    if (this.items.indexOf(item) === -1) {
      this.items = [...this.items, item];
    }
  }

  /**
   De-register an item with this group.
   @method deregisterItem
   @param {SortableItemModifier} item
   */
  @action
  deregisterItem(item) {
    const index = this.items.indexOf(item);
    if (index !== -1) {
      const items = [...this.items.slice(0, index), ...this.items.slice(index + 1)];
      this.set("items", items);
    }
  }

  /**
   Register the group with this Sortable.
   @method registerGroup
   @param {SortableGroupModifier} group
   */
  @action
  registerGroup(group) {
    this._group = group;
  }

  /**
   De-register the group with this Sortable.
   @method deregisterGroup
   @param {SortableGroupModifier} group
   */
  @action
  deregisterGroup(group) {
    if (this._group === group) {
      this._group = null;
    }
  }

  /**
   Prepare for sorting.
   Main purpose is to stash the current itemPosition so
   we don’t incur expensive re-layouts.
   @method _prepare
   */
  @action
  prepare() {
    this._itemPosition = this.itemPosition;
  }

  /**
   Update item positions (relatively to the first element position).
   @method update
   */
  @action
  update() {
    let sortedItems = this.sortedItems;
    // Position of the first element
    let position = this._itemPosition;

    // Just in case we haven’t called prepare first.
    if (position === undefined) {
      position = this.itemPosition;
    }

    sortedItems.forEach(item => {
      let dimension;
      let direction = this.direction;

      if (!item.isDragging) {
        set(item, direction, position);
      }

      // add additional spacing around active element
      if (item.isBusy) {
        position += item.spacing * 2;
      }

      if (direction === 'x') {
        dimension = 'width';
      }
      if (direction === 'y') {
        dimension = 'height';
      }

      position += item[dimension];
    });
  }

  /**
   @method _commit
   */
  @action
  commit() {
    const items = this.sortedItems;
    const itemModels = items.map(item => item.model);
    const draggedItem = items.find(item => item.wasDropped);
    let draggedModel;

    if (draggedItem) {
      draggedItem.wasDropped = false; // Reset
      draggedModel = draggedItem.model;
    }

    this._updateItems();
    this._onChange(itemModels, draggedModel);
  }

  @action
  _onChange(itemModels, draggedModel) {
    const groupModel = this.groupModel;

    if (groupModel !== NO_MODEL) {
      this.onChange(groupModel, itemModels, draggedModel);
    } else {
      this.onChange(itemModels, draggedModel);
    }
  }

  /**
   * API of methods needed by the modifiers
   *
   * This api was created to prevent re-rendering when some of the things change. These things are needed
   * upon request, and if not requested are not needed, so no reason to re-render. Was also getting an
   * infinite re-render because of this
   */
  get api() {
    return {
      getDirection: () => this.direction,
      getSortedItems: () => this.sortedItems,
      getAnnouncer: () => this.announcer,
      registerItem: this.registerItem,
      deregisterItem: this.deregisterItem,
      registerGroup: this.registerGroup,
      deregisterGroup: this.deregisterGroup,
      update: this.update,
      prepare: this.prepare,
      commit: this.commit,
      activateKeyDown: this.activateKeyDown,
      deactivateKeyDown: this.deactivateKeyDown,
      onChange: this._onChange
    }
  }

  /**
   * Keeps the UI in sync with actual changes.
   * Needed for drag and keyboard operations.
   */
  _updateItems() {
    const items = this.sortedItems;

    delete this._itemPosition;

    run.schedule('render', () => {
      items.forEach(item => item.freeze());
    });

    run.schedule('afterRender', () => {
      items.forEach(item => item.reset());
    });

    run.next(() => {
      run.schedule('render', () => {
        items.forEach(item => item.thaw());
      });
    });
  }

  @action
  _createAnnouncer(element) {
    this.announcer = element;
  }

}
