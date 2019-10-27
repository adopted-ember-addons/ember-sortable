import Controller from '@ember/controller';
import { set } from '@ember/object';
import { A as a } from '@ember/array';


export default Controller.extend({
  init() {
    this._super(...arguments);

    this.set('handleVisualClass', {
      UP: 'sortable-handle-up',
      DOWN: 'sortable-handle-down',
      LEFT: 'sortable-handle-left',
      RIGHT: 'sortable-handle-right',
    });

    this.set('itemVisualClass', 'sortable-item--active');
  },

  actions: {
    update(newOrder, draggedModel) {
      set(this, 'model.items', a(newOrder));
      set(this, 'model.dragged', draggedModel);
    }
  }
})