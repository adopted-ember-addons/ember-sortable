import Ember from 'ember';
const { $ } = Ember;

/**
  @private
  @method transitionDuration
  @param {HTMLElement} el
  @return {Number}
*/
export default function transitionDuration(el) {
  $(el).height(); // force re-flow

  let value = $(el).css('transition');
  let match = value.match(/(all|transform) ([\d\.]+)([ms]*)/);

  if (match) {
    let magnitude = parseFloat(match[2]);
    let unit = match[3];

    if (unit === 's') { magnitude *= 1000; }

    return magnitude;
  } else {
    return 0;
  }
}
