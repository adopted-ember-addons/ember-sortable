/**
  Gets a numeric border-spacing values for a given element.

  @method getBorderSpacing
  @param {Element} element
  @return {Object}
  @private
*/
export function getBorderSpacing(el) {
  let css = getComputedStyle(el).borderSpacing; // '0px 0px'
  let [horizontal, initialVertical] = css.split(' ');
  let vertical = initialVertical === undefined ? horizontal : initialVertical;

  return {
    horizontal: parseFloat(horizontal),
    vertical: parseFloat(vertical),
  };
}
