import Controller from '@ember/controller';
import { set } from '@ember/object';
import { A as a } from '@ember/array';


export default Controller.extend({
  actions: {
    update(newOrder, draggedModel) {
      set(this, 'model.items', a(newOrder));
      set(this, 'model.dragged', draggedModel);
    }
  }
})