import type { FakeEvent } from '../modifiers/sortable-item';

/**
  Gets the y offset for a given event.
  Work for touch and mouse events.
  @method getY
  @return {Number}
  @private
*/
export function getY(event: FakeEvent | Event): number {
  const touches = (event as TouchEvent).changedTouches;
  const touch = touches && touches[0];

  if (touch) {
    return touch.screenY;
  } else {
    return (event as MouseEvent).clientY;
  }
}

/**
  Gets the x offset for a given event.
  @method getX
  @return {Number}
  @private
*/
export function getX(event: FakeEvent | Event): number {
  const touches = (event as TouchEvent).changedTouches;
  const touch = touches && touches[0];

  if (touch) {
    return touch.screenX;
  } else {
    return (event as MouseEvent).clientX;
  }
}
