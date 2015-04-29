// Thanks to http://davidwalsh.name/css-animation-callback

function whichTransitionEvent() {
  var t;
  var el = document.createElement('fake-element');
  var transitions = {
    'transition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'MozTransition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd'
  };

  for (t in transitions) {
    if (el.style[t] !== undefined) {
      return transitions[t];
    }
  }
}

const transitionend = whichTransitionEvent();

export default transitionend;
