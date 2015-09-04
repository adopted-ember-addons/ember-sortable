import Ember from 'ember';
const a = Ember.A;

export default Ember.Route.extend({
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
