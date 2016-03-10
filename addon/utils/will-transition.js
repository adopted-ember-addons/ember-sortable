import transitionDuration from './transition-duration';

/**
  @private
  @method willTransition
  @param {HTMLElement} el
  @return {Boolean}
*/
export default function willTransition(el) {
  return transitionDuration(el) > 0;
}
