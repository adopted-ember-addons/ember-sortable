import Service from '@ember/service';
import type SortableGroupModifier from '../modifiers/sortable-group';
import type SortableItemModifier from '../modifiers/sortable-item';

export interface Group<T> {
  groupModifier: SortableGroupModifier<T> | undefined,
  items: SortableItemModifier<T>[],
};

export default class EmberSortableService<T> extends Service {
  /**
   * Internal State for any groups currently in DOM
   *
   * {
   *   groupName: {
   *     groupModifier: object,
   *     items: []
   *   }
   * }
   * @type {{}}
   */
  groups: Record<string, Group<T>> = {};

  /**
   * Register a new group with the service
   *
   * @param {String} groupName
   * @param {SortableGroupModifier} groupModifier
   */
  registerGroup(groupName: string, groupModifier: SortableGroupModifier<T> | undefined) {
    if (this.groups[groupName] === undefined) {
      this.groups[groupName] = {
        groupModifier: groupModifier,
        items: [],
      };
    } else {
      this.groups[groupName].groupModifier = groupModifier;
    }
  }

  /**
   * De-register a group with the service
   *
   * @param {String} groupName
   */
  deregisterGroup(groupName: string): void {
    delete this.groups[groupName];
  }

  /**
   * Register an item with this group
   *
   * @method registerItem
   * @param {String} groupName
   * @param {SortableItemModifier} item
   */
  registerItem(groupName: string, item: SortableItemModifier<T>): void {
    let groupDef = this.fetchGroup(groupName);
    
    if (!groupDef) {
      return;
    }
    
    let items = groupDef.items;

    if (items.indexOf(item) === -1) {
      items = [...items, item];
    }

    groupDef.items = items;
  }

  /**
   De-register an item with this group.

   @method deregisterItem
   @param groupName
   @param item
   */
  deregisterItem(groupName: string, item: SortableItemModifier<T>): void {
    let groupDef = this.fetchGroup(groupName);
    
    if (!groupDef) {
      return;
    }
    
    let items = groupDef.items;

    const index = items.indexOf(item);
    if (index !== -1) {
      let newItems = [...items.slice(0, index), ...items.slice(index + 1)];
      groupDef.items = newItems;
    }
  }

  /**
   * Fetch a group definition
   *
   * @param {String} groupName
   * @returns {*}
   */
  fetchGroup(groupName: string): Group<T> {
    if (this.groups[groupName] === undefined) {
      this.registerGroup(groupName, undefined);
    }

    return this.groups[groupName]!;
  }
}
