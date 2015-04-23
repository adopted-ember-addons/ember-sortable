import Ember from 'ember';

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
    }, {
      name: 'Seis'
    }, {
      name: 'Siete'
    }, {
      name: 'Ocho'
    }]);
  }
});
