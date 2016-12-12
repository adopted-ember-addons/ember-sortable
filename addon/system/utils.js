import Ember from 'ember';

const {$} = Ember;

/**
 * @module ember-sortable
 * @class Utilities
 */

/**
 * Gets a numeric border-spacing value for a given element.
 *
 * @method getBorderSpacing
 * @param {Element} element
 * @return {Object}
 * @private
 */
export function getBorderSpacing(el) {
  el = $(el);

  let css = el.css('border-spacing'); // '0px 0px'
  let [horizontal, vertical] = css.split(' ');

  return {
    horizontal: parseFloat(horizontal),
    vertical: parseFloat(vertical)
  };
}

/**
 * Gets the x offset for a given event.
 * Works for touch and mouse events.
 *
 * @method getX
 * @param {Event} event
 * @return {Number}
 * @private
 */
export function getX(event) {
  let originalEvent = event.originalEvent;
  let touches = originalEvent && originalEvent.changedTouches;
  let touch = touches && touches[0];

  if (touch) {
    return touch.screenX;
  } else {
    return event.pageX;
  }
}

/**
 * Gets the y offset for a given event.
 * Works for touch and mouse events.
 *
 * @method getY
 * @param {Event} event
 * @return {Number}
 * @private
 */
export function getY(event) {
  let originalEvent = event.originalEvent;
  let touches = originalEvent && originalEvent.changedTouches;
  let touch = touches && touches[0];

  if (touch) {
    return touch.screenY;
  } else {
    return event.pageY;
  }
}
