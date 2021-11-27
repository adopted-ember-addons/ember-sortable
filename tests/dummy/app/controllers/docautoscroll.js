import Controller from '@ember/controller';
import { equal } from '@ember/object/computed';
import { action, set } from '@ember/object';

export default class DocAutoScroll extends Controller {
  queryParams = ['direction'];
  direction = 'y';

  @equal('direction', 'y') isVertical;

  @action
  updateItems(newOrder) {
    set(this, 'model.items', newOrder);
  }
}
