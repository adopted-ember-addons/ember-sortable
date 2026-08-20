/**
  Gets a numeric border-spacing values for a given element.

  @method getBorderSpacing
  @param {Element} element
  @return {Object}
  @private
*/
export function getBorderSpacing(el: Element) {
  const css = getComputedStyle(el).borderSpacing; // '0px 0px'

  const [horizontal, initialVertical] = css.split(' ');
  const vertical = initialVertical === undefined ? horizontal : initialVertical;

  return {
    horizontal: parseFloat(horizontal ?? ''),
    vertical: parseFloat(vertical ?? ''),
  };
}

/**
  Gets numeric `column-gap`/`row-gap` values for a given element.

  @method getGap
  @param {Element} element
  @return {Object}
  @private
*/
export function getGap(el: Element) {
  const { columnGap, rowGap } = getComputedStyle(el);

  const horizontal = parseFloat(columnGap); // '0px' or 'normal'
  const vertical = parseFloat(rowGap); // '0px' or 'normal'

  return {
    horizontal: isNaN(horizontal) ? 0 : horizontal,
    vertical: isNaN(vertical) ? 0 : vertical,
  };
}
