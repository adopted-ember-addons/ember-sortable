import DraggableStateMachine from 'ember-sortable/utils/draggable-state-machine';
import { module, test } from 'qunit';
import { assign } from 'ember-platform';

/**

  Notes
  -----

  These tests don’t attempt to simulate real browser event dispatch.

  I did try — using winow.dispatchEvent — but it was simply too complex to
  synthesize the various Event types in the correct states. For example, it is
  impossible to overwrite the `timeStamp` property. Another example, some
  browser simply do not have TouchEvent defined on non-touch build so we’d
  be unable to test those cases.

  As a result, these tests cover the logic of state transitions but *not* the
  reality of event detection.

*/

module('Unit | Utility | draggable-state-machine', {
  beforeEach() {
    this.machine = new DraggableStateMachine();
  },

  afterEach() {
    this.machine.destroy();
  }
});

// --- mouse ---

test('default', function(assert) {
  assert.equal(this.machine.state, 'default');
});

test('default -> waiting (mouse)', function(assert) {
  this.machine.start(event());
  assert.equal(this.machine.state, 'waiting');
});

test('default -> waiting -> clicking (mouse)', function(assert) {
  this.machine.start(event());
  this.machine.stop();
  assert.equal(this.machine.state, 'clicking');
});

test('default -> waiting -> dragging (mouse)', function(assert) {
  this.machine.start(event());
  this.machine.move(event({ pageX: 0, pageY: 10 }));
  assert.equal(this.machine.state, 'dragging');
  assert.equal(this.machine.dx, 0);
  assert.equal(this.machine.dy, 10);
  this.machine.move(event({ pageX: 10, pageY: 0 }));
  assert.equal(this.machine.state, 'dragging');
  assert.equal(this.machine.dx, 10);
  assert.equal(this.machine.dy, 0);
});

test('default -> waiting -> dragging -> dropping (mouse)', function(assert) {
  this.machine.start(event());
  this.machine.move(event({ pageX: 10, pageY: 10 }));
  this.machine.stop();
  assert.equal(this.machine.state, 'dropping');
  assert.equal(this.machine.dx, 10);
  assert.equal(this.machine.dy, 10);
  assert.equal(this.machine.isDestroyed, true);
});

// --- touch ---

test('default -> waiting (touch)', function(assert) {
  this.machine.start(event({ targetTouches: [touch()] }));
  assert.equal(this.machine.state, 'waiting');
});

test('default -> waiting -> clicking (touch)', function(assert) {
  this.machine.start(event({ targetTouches: [touch()] }));
  this.machine.stop();
  assert.equal(this.machine.state, 'clicking');
});

test('default -> waiting -> swiping (touch)', function(assert) {
  this.machine.start(event({ targetTouches: [touch()] }));
  this.machine.move(event({ timeStamp: 40 }), touch());
  assert.equal(this.machine.state, 'swiping');
});

test('default -> waiting -> dragging (touch)', function(assert) {
  this.machine.start(event({ targetTouches: [touch()] }));
  this.machine.move(event({ timeStamp: 100 }), touch({ pageX: 0, pageY: 10 }));
  assert.equal(this.machine.state, 'dragging');
  assert.equal(this.machine.dx, 0);
  assert.equal(this.machine.dy, 10);
  this.machine.move(event({ timeStamp: 150 }), touch({ pageX: 10, pageY: 0 }));
  assert.equal(this.machine.state, 'dragging');
  assert.equal(this.machine.dx, 10);
  assert.equal(this.machine.dy, 0);
});

test('default -> waiting -> dragging -> dropping (touch)', function(assert) {
  this.machine.start(event({ targetTouches: [touch()] }));
  this.machine.move(event({ timeStamp: 100 }), touch({ pageX: 10, pageY: 10 }));
  this.machine.stop();
  assert.equal(this.machine.state, 'dropping');
  assert.equal(this.machine.dx, 10);
  assert.equal(this.machine.dy, 10);
  assert.equal(this.machine.isDestroyed, true);
});

// --- helpers ---

function event(props = {}) {
  return assign({
    timeStamp: 0,
    pageX: 0,
    pageY: 0,
    preventDefault() {}
  }, props);
}

function touch(props = {}) {
  return assign({
    identifier: 1,
    target: document.createElement('div'),
    pageX: 0,
    pageY: 0
  }, props);
}
