import Route from '@ember/routing/route';
import { A as a } from '@ember/array';

export default Route.extend({
  model() {
    return {
      items: a(['Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco'])
    };
  },

  actions: {
    update(newOrder, draggedModel) {
      this.set('currentModel.items', a(newOrder));
      this.set('currentModel.dragged', draggedModel);
    }
  }
});
