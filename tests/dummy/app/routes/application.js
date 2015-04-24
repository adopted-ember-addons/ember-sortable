import Ember from 'ember';
const { A } = Ember;
const a = A;

export default Ember.Route.extend({
  model() {
    return Ember.A([{
      name: 'Uno'
    }, {
      name: 'Dos'
    }, {
      name: 'Tres'
    }, {
      name: 'Cuatro'
    }, {
      name: 'Cinco'
    }]);
  },

  actions: {
    update(newOrder) {
      this.set('controller.model', a(newOrder));
    }
  }
});
