import Ember from 'ember';

export default Ember.Component.extend({
  item: null,

  click: function(){
    console.log('Item clicked');
  }
});
