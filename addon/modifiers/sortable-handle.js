import Modifier from 'ember-modifier';

/**
* Modifier to to mark the handle of an item. If this is not supplied the item will be the handle
*
* @param {Object} api The api from the objected yielded from the Sortable component
* @param {Object} model The model that this item will represent
*
* @module drag-drop/draggable-group
* @example
* <Sortable @model=model.items @onChange=(action "reorderItems") as |sortable|>
*    <ol>
*      {{#each sortable.model as |item|}}
*        <li {{sortable-item api=sortable.api model=item a11yAnnouncementConfig=this.myA11yConfig}}>
*          {{item.name}}
*          <span class="handle" {{sortable-handle api=sortable.api model=item}}>&varr;</span>
*        </li>
*      {{/each}}
*    </ol>
*  </Sortable>
*/
export default class SortableHandleModifier extends Modifier {

  sortable;

  model;

  didReceiveArguments() {
    this.sortableApi = this.args.named.api;
    this.model = this.args.named.model;

    // take the model and look up the registered element, the tell that element you are the handle
    this.element.dataset.sortableHandle=true;
    this.element.tabIndex = "0";
    this.element.setAttribute("role", "button");
  }

}
