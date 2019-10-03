// Polyfill for 'closest' and `matches` in IE11.
// https://github.com/jonathantneal/closest
export default function polyfill(window) {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    (function(ElementProto) {
      if (typeof ElementProto.matches !== 'function') {
        ElementProto.matches =
          ElementProto.msMatchesSelector ||
          ElementProto.mozMatchesSelector ||
          ElementProto.webkitMatchesSelector ||
          function matches(selector) {
            var element = this;
            var elements = (
              element.document || element.ownerDocument
            ).querySelectorAll(selector);
            var index = 0;

            while (elements[index] && elements[index] !== element) {
              ++index;
            }

            return Boolean(elements[index]);
          };
      }

      if (typeof ElementProto.closest !== 'function') {
        ElementProto.closest = function closest(selector) {
          var element = this;

          while (element && element.nodeType === 1) {
            if (element.matches(selector)) {
              return element;
            }

            element = element.parentNode;
          }

          return null;
        };
      }
    })(window.Element.prototype);
  }
}