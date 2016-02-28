import Route from 'ember-route';

export default Route.extend({
  model() {
    return {
      label: 'Root',
      children: [{
        label: '1',
        children: [{
          label: '1.1',
          children: [{
            label: '1.1.1'
          },{
            label: '1.1.2'
          },{
            label: '1.1.3'
          }]
        }, {
          label: '1.2',
          children: [{
            label: '1.2.1'
          },{
            label: '1.2.2'
          },{
            label: '1.2.3'
          }]
        }]
      }, {
        label: '2',
        children: [{
          label: '2.1',
          children: [{
            label: '2.1.1'
          },{
            label: '2.1.2'
          },{
            label: '2.1.3'
          }]
        }, {
          label: '2.2',
          children: [{
            label: '2.2.1'
          },{
            label: '2.2.2'
          },{
            label: '2.2.3'
          }]
        }]
      }]
    };
  }
});
