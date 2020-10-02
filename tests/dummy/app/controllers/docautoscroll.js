import Controller from '@ember/controller';
import { equal } from '@ember/object/computed';
import { set } from '@ember/object';

export default Controller.extend({
  queryParams: ['direction'],
  direction: 'y',
  isVertical: equal('direction', 'y'),
  actions: {
    updateItems(newOrder) {
      set(this, 'model.items', newOrder);
    }
  }
})
