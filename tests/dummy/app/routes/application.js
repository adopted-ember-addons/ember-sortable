import Ember from 'ember';
const a = Ember.A;

export default Ember.Route.extend({
  model() {
    return {
      items: a(['Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco'])
    };
  },

  actions: {
    update(newOrder) {
      this.set('currentModel.items', a(newOrder));
    }
  }
});
