import Ember from 'ember';

/**
  Drags elements by an offset specified in pixels.

  Examples

      drag(
        'mouse',
        '.some-list li[data-item=uno]',
        function() {
          return { dy: 50, dx: 20 };
        }
      );

  @method drag
  @param {'mouse'|'touch'} [mode]
    event mode
  @param {String} [itemSelector]
    selector for the element to drag
  @param {Function} [offsetFn]
    function returning the offset by which to drag
  @param {Object} [callbacks]
    callbacks that are fired at the different stages of the interaction
  @return {Promise}
*/

export function drag(app, mode, itemSelector, offsetFn, callbacks = {}) {
  let start, move, end, which;

  const {
    andThen,
    findWithAssert,
    triggerEvent,
    wait
  } = app.testHelpers;

  if (mode === 'mouse') {
    start = 'mousedown';
    move = 'mousemove';
    end = 'mouseup';
    which = 1;
  } else if (mode === 'touch') {
    start = 'touchstart';
    move = 'touchmove';
    end = 'touchend';
  } else {
    throw new Error(`Unsupported mode: '${mode}'`);
  }

  andThen(() => {
    let item = findWithAssert(itemSelector);
    let itemOffset = item.offset();
    let offset = offsetFn();
    let targetX = itemOffset.left + offset.dx;
    let targetY = itemOffset.top + offset.dy;

    triggerEvent(item, start, {
      pageX: itemOffset.left,
      pageY: itemOffset.top,
      which
    }).then(() => {
      if (callbacks.dragstart) {
        callbacks.dragstart();
      }
    });

    triggerEvent(item, move, {
      pageX: itemOffset.left,
      pageY: itemOffset.top
    }).then(() => {
      if (callbacks.dragmove) {
        callbacks.dragmove();
      }
    });

    triggerEvent(item, move, {
      pageX: targetX,
      pageY: targetY
    });

    triggerEvent(item, end, {
      pageX: targetX,
      pageY: targetY
    }).then(() => {
      if (callbacks.dragend) {
        callbacks.dragend();
      }
    });
  });

  return wait();
}

export default Ember.Test.registerAsyncHelper('drag', drag);
