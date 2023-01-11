import Controller from '@ember/controller';
import { action, set } from '@ember/object';

export default class DocAutoScroll extends Controller {
  queryParams = ['direction'];
  direction = 'y';

  get isVertical() {
    return this.direction === 'y';
  }

  @action
  updateItems(newOrder) {
    set(this, 'model.items', newOrder);
  }
}
