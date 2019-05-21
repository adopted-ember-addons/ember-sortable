import Component from '@ember/component';

export default Component.extend({
  item: null,

  click: function(){
    console.log('Item clicked'); // eslint-disable-line no-console
  }
});
