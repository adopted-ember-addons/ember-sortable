// Polyfill for 'closest' and `matches` in IE11.
// https://github.com/jonathantneal/closest
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  (function(ElementProto) {
    if (typeof ElementProto.closest !== 'function') {
      ElementProto.closest = function closest(selector) {
        var element = this;

        while (element && element.nodeType === 1) {
          if (element.msMatchesSelector(selector)) {
            return element;
          }

          element = element.parentNode;
        }

        return null;
      };
    }
  })(window.Element.prototype);
}
