function getParentElements(element: HTMLElement): HTMLElement[] {
  const parentsArray: HTMLElement[] = [];

  if (!element) {
    return parentsArray;
  }

  let currentParent = element.parentElement;

  while (currentParent !== null) {
    parentsArray.push(currentParent);
    currentParent = currentParent.parentElement;
  }
  return parentsArray;
}

export default function (element: HTMLElement): HTMLElement | Document {
  let position = getComputedStyle(element).position;
  let excludeStaticParent = position === 'absolute';
  let scrollParent: HTMLElement | Document | undefined = getParentElements(element).filter(function (parent) {
    let parentElemStyles = getComputedStyle(parent);
    if (excludeStaticParent && parentElemStyles.position === 'static') {
      return false;
    }
    let { overflow, overflowX, overflowY } = parentElemStyles;
    return /(auto|scroll)/.test(overflow + overflowX + overflowY);
  })[0];

  if (!scrollParent || scrollParent === document.body) {
    scrollParent = document;
  }
  return scrollParent;
}
