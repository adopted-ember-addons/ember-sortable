import Controller from '@ember/controller';
import { set } from '@ember/object';
import { A } from '@ember/array';

export default Controller.extend({
  actions: {
    update(newOrder, draggedModel) {
      set(this, 'model.items', A(newOrder));
      set(this, 'model.dragged', draggedModel);
    }
  }
})
