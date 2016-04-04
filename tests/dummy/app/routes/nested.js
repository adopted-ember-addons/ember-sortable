import Route from 'ember-route';
import { A } from 'ember-array/utils';

export default Route.extend({
  model() {
    return {
      label: 'Root',
      children: [{
        label: '1',
        children: [{
          label: '1.1',
          children: [{
            label: '1.1.1',
            children: []
          },{
            label: '1.1.2',
            children: []
          },{
            label: '1.1.3',
            children: []
          }]
        }, {
          label: '1.2',
          children: [{
            label: '1.2.1',
            children: []
          },{
            label: '1.2.2',
            children: []
          },{
            label: '1.2.3',
            children: []
          }]
        }]
      }, {
        label: '2',
        children: [{
          label: '2.1',
          children: [{
            label: '2.1.1',
            children: []
          },{
            label: '2.1.2',
            children: []
          },{
            label: '2.1.3',
            children: []
          }]
        }, {
          label: '2.2',
          children: [{
            label: '2.2.1',
            children: []
          },{
            label: '2.2.2',
            children: []
          },{
            label: '2.2.3',
            children: []
          }]
        }]
      }]
    };
  },

  actions: {
    moveNode(node, { oldParent, newParent, position }) {
      A(oldParent.children).removeObject(node);
      A(newParent.children).insertAt(position, node);
    }
  }
});
