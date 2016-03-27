import Gesture from 'ember-sortable/utils/gesture';
import { module, test } from 'qunit';
import { assign } from 'ember-platform';
import { A } from 'ember-array/utils';

module('Unit | Utility | Gesture', {
  beforeEach() {
    this.events = [];
    this.callback = event => this.events.push(event);
    this.dispatcher = new SimpleDispatcher();
    this.gesture = new Gesture(this.callback, this.dispatcher);
  },

  afterEach() {
    this.gesture.destroy();
  }
});

test('default', function(assert) {
  assert.equal(this.gesture.state, 'default');
});

// --- mouse ---

test('default -> waiting (mouse)', function(assert) {
  this.gesture.start(event({ type: 'mousedown', pageX: 10, pageY: 20 }));
  assert.equal(this.gesture.state, 'waiting');
  assert.equal(this.gesture.x, 10);
  assert.equal(this.gesture.y, 20);
});

test('default -> waiting -> clicking (mouse)', function(assert) {
  this.gesture.start(event({ type: 'mousedown' }));
  this.dispatcher.dispatchEvent(event({ type: 'mouseup' }));
  assert.equal(this.gesture.state, 'clicking');
});

test('default -> waiting -> dragging (mouse)', function(assert) {
  this.gesture.start(event({ type: 'mousedown', pageX: 1, pageY: 2 }));
  this.dispatcher.dispatchEvent(event({ type: 'mousemove', pageX: 2, pageY: 5 }));
  assert.equal(this.gesture.state, 'dragging');
  assert.equal(this.gesture.x, 2);
  assert.equal(this.gesture.y, 5);
  assert.equal(this.gesture.dx, 1);
  assert.equal(this.gesture.dy, 3);
});

test('default -> waiting -> dragging -> dropping (mouse)', function(assert) {
  this.gesture.start(event({ type: 'mousedown', pageX: 0, pageY: 0 }));
  this.dispatcher.dispatchEvent(event({ type: 'mousemove', pageX: 1, pageY: 2 }));
  this.dispatcher.dispatchEvent(event({ type: 'mouseup' }));
  assert.equal(this.gesture.state, 'dropping');

  let click = event({ type: 'click' });
  this.dispatcher.dispatchEvent(click);
  assert.equal(click.defaultPrevented, true);
  assert.equal(click.propagationStopped, true);
});

// --- touch ---

test('default -> waiting (touch)', function(assert) {
  this.gesture.start(event({ type: 'touchstart', targetTouches: [touch()] }));
  assert.equal(this.gesture.state, 'waiting');
});

test('default -> waiting -> clicking (touch)', function(assert) {
  this.gesture.start(event({ type: 'touchstart', targetTouches: [touch()] }));
  this.dispatcher.dispatchEvent(event({ type: 'touchend', changedTouches: [touch()] }));
  assert.equal(this.gesture.state, 'clicking');
});

test('default -> waiting -> swiping (touch)', function(assert) {
  this.gesture.start(event({ type: 'touchstart', targetTouches: [touch()] }));
  this.dispatcher.dispatchEvent(event({ type: 'touchmove', changedTouches: [touch()] }));
  assert.equal(this.gesture.state, 'swiping');
});

test('default -> waiting -> dragging (touch)', function(assert) {
  this.gesture.start(event({ type: 'touchstart', targetTouches: [touch({ pageX: 1, pageY: 2 })] }));
  this.dispatcher.dispatchEvent(event({ type: 'touchmove', timeStamp: 100, changedTouches: [touch({ pageX: 2, pageY: 4 })] }));
  assert.equal(this.gesture.state, 'dragging');
  assert.equal(this.gesture.x, 2);
  assert.equal(this.gesture.y, 4);
  assert.equal(this.gesture.dx, 1);
  assert.equal(this.gesture.dy, 2);
});

test('default -> waiting -> dragging -> dropping (touch)', function(assert) {
  this.gesture.start(event({ type: 'touchstart', targetTouches: [touch()] }));
  this.dispatcher.dispatchEvent(event({ type: 'touchmove', timeStamp: 100, changedTouches: [touch()] }));
  this.dispatcher.dispatchEvent(event({ type: 'touchend', timeStamp: 200, changedTouches: [touch()] }));
  assert.equal(this.gesture.state, 'dropping');

  let click = event({ type: 'click' });
  this.dispatcher.dispatchEvent(click);
  assert.equal(click.defaultPrevented, true);
  assert.equal(click.propagationStopped, true);
});

// --- helpers ---

function event(props = {}) {
  return assign({
    type: null,
    timeStamp: 0,
    pageX: 0,
    pageY: 0,
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopPropagation() {
      this.propagationStopped = true;
    }
  }, props);
}

function touch(props = {}) {
  return assign({
    identifier: 1,
    pageX: 0,
    pageY: 0
  }, props);
}

class SimpleDispatcher {
  constructor() {
    this.listeners = {
      mousemove: A(),
      mouseup: A(),
      click: A(),
      touchmove: A(),
      touchend: A()
    };
  }

  addEventListener(type, listener /*, phase */) {
    this.listeners[type].addObject(listener);
  }

  removeEventListener(type, listener /* , phase */) {
    this.listeners[type].removeObject(listener);
  }

  dispatchEvent(event) {
    this.listeners[event.type].forEach(l => l(event));
  }
}
