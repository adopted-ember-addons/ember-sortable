import Ember from 'ember';
const { A, set } = Ember;
const a = A;

export default Ember.Route.extend({
  model() {
    return {
      items: a(['Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco'])
    };
  },

  actions: {
    update(model, newOrder) {
      set(model,'items', a(newOrder));
    }
  }
});
