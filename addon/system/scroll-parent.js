import Ember from 'ember';
const { $ } = Ember;

export default function ($element) {
  let position = $element.css('position');
  let excludeStaticParent = position === 'absolute';
  let $scrollParent = $element.parents().filter(function () {
    let $parent = $(this);
    if (excludeStaticParent && $parent.css('position') === 'static') {
      return false;
    }
    let { overflow, overflowX, overflowY } = $parent.css(['overflow', 'overflowX', 'overflowY']);
    return /(auto|scroll)/.test(overflow + overflowX + overflowY);
  }).eq(0);

  if ($scrollParent.length === 0 ||
      $scrollParent[0] === document.body) {
    $scrollParent = $(document);
  }
  return position === 'fixed' || $scrollParent;
}
