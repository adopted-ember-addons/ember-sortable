import Controller from '@ember/controller';
import { set, action } from '@ember/object';


export default class ModifierController extends Controller {
  differentSizedModels =  [
    'A',
    'B'.repeat(100),
    'D'.repeat(50),
    'C'.repeat(20),
  ];

  handleVisualClass = {
    UP: 'sortable-handle-up',
    DOWN: 'sortable-handle-down',
    LEFT: 'sortable-handle-left',
    RIGHT: 'sortable-handle-right',
  };

  itemVisualClass = 'sortable-item--active';

  a11yAnnouncementConfig = {
    ACTIVATE: function({ a11yItemName, index, maxLength, direction }) {
      let message = `${a11yItemName} at position, ${index + 1} of ${maxLength}, is activated to be repositioned.`;
      if (direction === 'y') {
        message += 'Press up and down keys to change position,';
      } else {
        message += 'Press left and right keys to change position,';
      }

      message += ' Space to confirm new position, Escape to cancel.';

      return message;
    },
    MOVE: function({ a11yItemName, index, maxLength, delta }) {
      return `${a11yItemName} is moved to position, ${index + 1 + delta} of ${maxLength}. Press Space to confirm new position, Escape to cancel.`;
    },
    CONFIRM: function({ a11yItemName}) {
      return `${a11yItemName} is successfully repositioned.`;
    },
    CANCEL: function({ a11yItemName }) {
      return `Cancelling ${a11yItemName} repositioning`;
    }
  };

  @action
  updateDifferentSizedModels(newOrder) {
    set(this, 'differentSizedModels', newOrder);
  }
  @action
  update(newOrder, draggedModel) {
    set(this, 'model.items', newOrder);
    set(this, 'model.dragged', draggedModel);
  }
}
