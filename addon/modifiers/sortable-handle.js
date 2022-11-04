import Modifier from 'ember-modifier';

/**
 * Modifier to to mark the handle of an item. If this is not supplied the item will be the handle
 *
 * @module drag-drop/draggable-group
 * @example*
 *    <ol {{sortable-group onChange=this.update a11yAnnouncementConfig=this.myA11yConfig}}>
 *      {{#each model.items as |item|}}
 *        <li {{sortable-item model=item}}>
 *          {{item.name}}
 *          <span class="handle" {{sortable-handle}}>&varr;</span>
 *        </li>
 *      {{/each}}
 *    </ol>
 */
export default class SortableHandleModifier extends Modifier {
  didSetup = false;

  modify(element /*, positional, named*/) {
    if (!this.didSetup) {
      // take the model and look up the registered element, the tell that element you are the handle
      element.dataset.sortableHandle = true;
      element.tabIndex = '0';
      element.setAttribute('role', 'button');
      this.didSetup = true;
    }
  }
}
