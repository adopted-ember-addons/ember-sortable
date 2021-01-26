import Controller from '@ember/controller';
import { computed, set } from '@ember/object';
import { A as a } from '@ember/array';

function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

export default Controller.extend({
  init() {
    this._super(...arguments);

    this.setProperties({
      differentSizedModels: [
        'A',
        'B'.repeat(100),
        'D'.repeat(50),
        'C'.repeat(20),
      ],
      handleVisualClass: {
        UP: 'sortable-handle-up',
        DOWN: 'sortable-handle-down',
        LEFT: 'sortable-handle-left',
        RIGHT: 'sortable-handle-right',
      },
      itemVisualClass: 'sortable-item--active',
      a11yAnnouncementConfig: {
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
      }
    });
  },

  delayedUpdateFinished: computed('model.{delayedUpdateStarts,delayedUpdateFinishes}', function() {
    const { delayedUpdateStarts, delayedUpdateFinishes } = this.get('model');
    return delayedUpdateStarts !== undefined &&
      delayedUpdateFinishes !== undefined &&
      delayedUpdateStarts === delayedUpdateFinishes;
  }),

  actions: {
    updateDifferentSizedModels(newOrder) {
      set(this, 'differentSizedModels', newOrder);
    },
    update(newOrder, draggedModel) {
      set(this, 'model.items', a(newOrder));
      set(this, 'model.dragged', draggedModel);
    },
    async delayedUpdate(newOrder, draggedModel) {
      const startCount = this.get('model.delayedUpdateStarts') || 0;
      set(this, 'model.delayedUpdateStarts', startCount + 1);

      await timeout(50);

      set(this, 'model.items', a(newOrder));
      set(this, 'model.dragged', draggedModel);
      const finishCount = this.get('model.delayedUpdateFinishes') || 0;
      set(this, 'model.delayedUpdateFinishes', finishCount + 1);
    }
  }
})
