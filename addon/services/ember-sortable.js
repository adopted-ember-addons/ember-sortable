import Service from '@ember/service';

export default class EmberSortableService extends Service {

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
  groups = {

  };

  /**
   * Register a new group with the service
   *
   * @param {String} groupName
   * @param {SortableGroupModifier} groupModifier
   */
  registerGroup(groupName, groupModifier) {
    if (this.groups[groupName] === undefined) {
      this.groups[groupName] = {
        groupModifier: groupModifier,
        items: []
      }
    } else {
      this.groups[groupName].groupModifier = groupModifier;
    }
  }

  /**
   * De-register a group with the service
   *
   * @param {String} groupName
   */
  deregisterGroup(groupName) {
    delete this.groups[groupName];
  }

  /**
   * Register an item with this group
   *
   * @method registerItem
   * @param {String} groupName
   * @param {SortableItemModifier} item
   */
  registerItem(groupName, item) {
    let groupDef = this.fetchGroup(groupName);
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
  deregisterItem(groupName, item) {
    let groupDef = this.fetchGroup(groupName);
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
  fetchGroup(groupName) {
    if (this.groups[groupName] === undefined) {
      this.registerGroup(groupName, undefined);
    }

    return this.groups[groupName];
  }
}
