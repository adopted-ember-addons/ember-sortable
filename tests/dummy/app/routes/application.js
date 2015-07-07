import Ember from 'ember';
const { A, set } = Ember;
const a = A;

export default Ember.Route.extend({
  model() {
    return {
      vertical: a(['Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco']),
      horizontal: a(['Ein', "Zwei", "Drei", "Vier", "Funf"])
    };
    
  },

  actions: {
    updateVertical: function(model, newOrder) {
      set(model, 'vertical', a(newOrder));
    },
    updateHorizontal: function(newOrder) {
      set(this, 'currentModel.horizontal', a(newOrder));
    },
  }
});
