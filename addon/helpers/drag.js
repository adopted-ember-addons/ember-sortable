import $ from 'jquery';
import { triggerEvent, settled } from '@ember/test-helpers'
import { assert } from '@ember/debug'

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

export async function drag(mode, itemSelector, offsetFn, callbacks = {}) {
  let start, move, end, which;

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
  let item = $(itemSelector);
  assert(`could not find item: ${itemSelector}`, !!item)

  let itemOffset = item.offset();

  let offset = offsetFn();

  let itemElement = item.get(0);
  let rect = itemElement.getBoundingClientRect();
  let scale = itemElement.clientHeight / (rect.bottom - rect.top);
  let halfwayX = itemOffset.left + (offset.dx * scale) / 2;
  let halfwayY = itemOffset.top + (offset.dy * scale) / 2;
  let targetX = itemOffset.left + offset.dx * scale;
  let targetY = itemOffset.top + offset.dy * scale;

  const getCoords = (x,y) => ({
    pageX: x,
    pageY: y,
    clientX: x,
    clientY: y,
    changedTouches: [{ screenX: x, screenY: y }],
    which
  })

  await triggerEvent(itemElement, start, getCoords(itemOffset.left, itemOffset.top));

  if (callbacks.dragstart) {
    await callbacks.dragstart;
  }
  await triggerEvent(itemElement, move, getCoords(itemOffset.left, itemOffset.top));

  if (callbacks.dragmove) {
    await callbacks.dragmove;
  }

  await triggerEvent(itemElement, move, getCoords(halfwayX, halfwayY));

  await triggerEvent(itemElement, move, getCoords(targetX, targetY));

  await triggerEvent(itemElement, end, getCoords(targetX, targetY));

  if (callbacks.dragend) {
    await callbacks.dragend
  }

  return await settled();
}

export default drag;
