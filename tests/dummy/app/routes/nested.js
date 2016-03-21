import Route from 'ember-route';
import { A } from 'ember-array/utils';

export default Route.extend({
  model() {
    return {
      label: 'Root',
      children: A([{
        label: '1',
        children: A([{
          label: '1.1',
          children: A([{
            label: '1.1.1'
          },{
            label: '1.1.2'
          },{
            label: '1.1.3'
          }])
        }, {
          label: '1.2',
          children: A([{
            label: '1.2.1'
          },{
            label: '1.2.2'
          },{
            label: '1.2.3'
          }])
        }])
      }, {
        label: '2',
        children: A([{
          label: '2.1',
          children: A([{
            label: '2.1.1'
          },{
            label: '2.1.2'
          },{
            label: '2.1.3'
          }])
        }, {
          label: '2.2',
          children: A([{
            label: '2.2.1'
          },{
            label: '2.2.2'
          },{
            label: '2.2.3'
          }])
        }])
      }])
    };
  },

  actions: {
    moveNode(node, { oldParent, newParent, position }) {
      oldParent.children.removeObject(node);
      newParent.children.insertAt(position, node);
    }
  }
});
