import { triggerEvent } from '@ember/test-helpers';

export default async function drag(mode, item, offsetFn, callbacks = {}) {
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

  const itemOffset = {
    left: item.offsetLeft,
    top: item.offsetTop
  };
  const offset = offsetFn();
  const rect = item.getBoundingClientRect();
  const scale = item.clientHeight / (rect.bottom - rect.top);
  const targetX = itemOffset.left + offset.dx * scale;
  const targetY = itemOffset.top + offset.dy * scale;

  await triggerEvent(item, start, {
    clientX: itemOffset.left,
    clientY: itemOffset.top,
    which
  });

  if (callbacks.dragstart) {
    await callbacks.dragstart;
  }

  await triggerEvent(item, move, {
    clientX: itemOffset.left,
    clientY: itemOffset.top
  });

  if (callbacks.dragmove) {
    await callbacks.dragmove;
  }

  await triggerEvent(item, move, {
    clientX: targetX,
    clientY: targetY
  });

  await triggerEvent(item, end, {
    clientX: targetX,
    clientY: targetY
  });

  if (callbacks.dragend) {
    await callbacks.dragend;
  }
}
