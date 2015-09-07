import Ember from 'ember';

/**
  Drags elements by an offset specified in pixels.

  Examples

      drag(
        'mouse',
        '.some-list li[data-item=uno]',
        function() {
          return { y: 50 };
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

export function drag(_app, mode, itemSelector, offsetFn, callbacks = {}) {
  let start, move, end;

  if (mode === 'mouse') {
    start = 'mousedown';
    move = 'mousemove';
    end = 'mouseup';
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

    triggerEvent(item, start, {
      pageX: itemOffset.left,
      pageY: itemOffset.top
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
      pageX: itemOffset.left + offset.x,
      pageY: itemOffset.top + offset.y
    });

    triggerEvent(item, end, {
      pageX: itemOffset.left + offset.x,
      pageY: itemOffset.top + offset.y
    }).then(() => {
      if (callbacks.dragend) {
        callbacks.dragend();
      }
    });
  });

  return wait();
}

export default Ember.Test.registerAsyncHelper('drag', drag);
