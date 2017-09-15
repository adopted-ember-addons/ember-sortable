import Ember from 'ember';

function setIndexies(array) {
  array.forEach( (item, index)=> Ember.set(item, 'index', index) );
}

export default setIndexies;

