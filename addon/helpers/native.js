/**
 * Vanilla Javascript equivalent of JQuery's `.offset`.
 * Reference: https://github.com/nefe/You-Dont-Need-jQuery
 *
 * @method getOffset
 * @param {Element} el an element
 */
export function getOffset(el) {
  const box = el.getBoundingClientRect();

  return {
    top: box.top + window.pageYOffset - document.documentElement.clientTop,
    left: box.left + window.pageXOffset - document.documentElement.clientLeft,
  };
}