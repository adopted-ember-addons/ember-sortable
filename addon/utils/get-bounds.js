import Ember from 'ember';
const { $ } = Ember;

/**
  @private
  @method getBounds
  @param {HTMLElement} element
  @return {Object} { top, left, bottom, right }
*/
export default function getBounds(element) {
  let $el = $(element);
  let { left, top } = $el.offset();
  let right = left + $el.outerWidth();
  let bottom = top + $el.outerHeight();

  return { top, left, bottom, right };
}
