import { triggerEvent, find, settled, } from '@ember/test-helpers';
import { getOffset } from '../utils/offset';

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

export async function drag(
  mode,
  itemSelector,
  offsetFn,
  callbacks = {}
) {
  let start;
  let move;
  let end;
  let which;

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

  const itemElement = find(itemSelector);
  const itemOffset = getOffset(itemElement);
  const offset = offsetFn();
  const rect = itemElement.getBoundingClientRect();
  // firefox gives some elements, like <svg>, a clientHeight of 0.
  // we can try to grab it off the parent instead to have a better
  // guess at what the scale is.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=874811#c14
  // https://stackoverflow.com/a/13647345
  // https://stackoverflow.com/a/5042051
  const dx = offset.dx || 0;
  const dy = offset.dy || 0;
  const clientHeight =
    itemElement.clientHeight ||
    itemElement.offsetHeight ||
    itemElement.parentNode.offsetHeight;
  const scale = clientHeight / (rect.bottom - rect.top);
  const halfwayX = itemOffset.left + (dx * scale) / 2;
  const halfwayY = itemOffset.top + (dy * scale) / 2;
  const targetX = itemOffset.left + dx * scale;
  const targetY = itemOffset.top + dy * scale;

  await triggerEvent(itemElement, start, {
    clientX: itemOffset.left,
    clientY: itemOffset.top,
    which,
  });

  if (callbacks.dragstart) {
    await callbacks.dragstart();
    await settled();
  }

  await triggerEvent(itemElement, move, {
    clientX: itemOffset.left,
    clientY: itemOffset.top,
  });

  if (callbacks.dragmove) {
    await callbacks.dragmove();
    await settled();
  }

  await triggerEvent(itemElement, move, {
    clientX: halfwayX,
    clientY: halfwayY,
  });

  await triggerEvent(itemElement, move, {
    clientX: targetX,
    clientY: targetY,
  });

  await triggerEvent(itemElement, end, {
    clientX: targetX,
    clientY: targetY,
  });

  if (callbacks.dragend) {
    await callbacks.dragend();
    await settled();
  }
}
