export default function (element) {
  let position = getComputedStyle(element)['position'];
  let excludeStaticParent = position === 'absolute';
  let scrollParent = _getParents(element).filter(parent => {
    if (excludeStaticParent && getComputedStyle(parent)['position'] === 'static') {
      return false;
    }
    let { overflow, overflowX, overflowY } = getComputedStyle(parent);
    return /(auto|scroll)/.test(overflow + overflowX + overflowY);
  })[0];

  if (!scrollParent ||
      scrollParent === document.body) {
    scrollParent = document;
  }
  return position === 'fixed' || scrollParent;
}

function _getParents(e) {
  var result = [];
  for (var p = e && e.parentElement; p; p = p.parentElement) {
    result.push(p);
  }
  return result;
}
