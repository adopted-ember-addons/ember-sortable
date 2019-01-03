import { registerAsyncHelper } from '@ember/test';
import { triggerEvent } from '@ember/test-helpers';

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
    let itemElement = item.get(0);
    let rect = itemElement.getBoundingClientRect();
    // firefox gives some elements, like <svg>, a clientHeight of 0.
    // we can try to grab it off the parent instead to have a better
    // guess at what the scale is.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=874811#c14
    // https://stackoverflow.com/a/13647345
    // https://stackoverflow.com/a/5042051
    let dx = offset.dx || 0;
    let dy = offset.dy || 0;
    let clientHeight = (itemElement.clientHeight || item.offsetHeight) || itemElement.parentNode.offsetHeight;
    let scale = clientHeight / (rect.bottom - rect.top);
    let halfwayX = itemOffset.left + (dx * scale) / 2;
    let halfwayY = itemOffset.top + (dy * scale) / 2;
    let targetX = itemOffset.left + (dx * scale);
    let targetY = itemOffset.top + (dy * scale);

    andThen(() => {
      triggerEvent(itemElement, start, {
        clientX: itemOffset.left,
        clientY: itemOffset.top,
        which
      });
    });

    if (callbacks.dragstart) {
      andThen(callbacks.dragstart);
    }

    andThen(() => {
      triggerEvent(itemElement, move, {
        clientX: itemOffset.left,
        clientY: itemOffset.top
      });
    });

    if (callbacks.dragmove) {
      andThen(callbacks.dragmove);
    }

    andThen(() => {
      triggerEvent(itemElement, move, {
        clientX: halfwayX,
        clientY: halfwayY
      });
    });

    andThen(() => {
      triggerEvent(itemElement, move, {
        clientX: targetX,
        clientY: targetY
      });
    });

    andThen(() => {
      triggerEvent(itemElement, end, {
        clientX: targetX,
        clientY: targetY
      });
    });

    if (callbacks.dragend) {
      andThen(callbacks.dragend);
    }
  });

  return wait();
}

export default registerAsyncHelper('drag', drag);
