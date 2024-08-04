function getParentElements(element) {
  const parentsArray = [];

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

export default function (element) {
  let position = getComputedStyle(element).position;
  let excludeStaticParent = position === 'absolute';
  let scrollParent = getParentElements(element).filter(function (parent) {
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
  return position === 'fixed' || scrollParent;
}
