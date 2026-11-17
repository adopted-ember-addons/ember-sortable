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
  Gets the fractional border-box width or height of an element in layout
  pixels. Unlike `getBoundingClientRect()`, it is not scaled by a CSS transform
  on the element or an ancestor, so it matches `offsetTop`, `offsetLeft` and
  margins. Falls back to the rounded offset size when the computed size is
  not a number (for example `auto` on an element that is not rendered).

  @method getLayoutSize
  @param {Element} element
  @param {String} dimension
  @return {Number}
  @private
*/
export function getLayoutSize(el: HTMLElement, dimension: 'width' | 'height') {
  const css = getComputedStyle(el);
  let size = parseFloat(css[dimension]);

  if (css.boxSizing === 'content-box') {
    size +=
      dimension === 'width'
        ? parseFloat(css.paddingLeft) +
          parseFloat(css.paddingRight) +
          parseFloat(css.borderLeftWidth) +
          parseFloat(css.borderRightWidth)
        : parseFloat(css.paddingTop) +
          parseFloat(css.paddingBottom) +
          parseFloat(css.borderTopWidth) +
          parseFloat(css.borderBottomWidth);
  }

  if (Number.isFinite(size)) {
    return size;
  }

  return dimension === 'width' ? el.offsetWidth : el.offsetHeight;
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
