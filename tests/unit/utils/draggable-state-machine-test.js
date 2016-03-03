/* globals MouseEvent, TouchEvent, Touch */

import DraggableStateMachine from 'ember-sortable/utils/draggable-state-machine';
import { module, test } from 'qunit';
import { assign } from 'ember-platform';

module('Unit | Utility | DraggableStateMachine', {
  beforeEach() {
    this.machine = new DraggableStateMachine();
  },

  afterEach() {
    this.machine.destroy();
  }
});

test('waiting (mouse)', function(assert) {
  this.machine.start(mouseEvent('mousedown'));
  assert.equal(this.machine.state, 'waiting');
});

test('waiting (touch)', function(assert) {
  this.machine.start(touchEvent('touchstart'));
  assert.equal(this.machine.state, 'waiting');
});

test('clicking (mouse)', function(assert) {
  this.machine.start(mouseEvent('mousedown'));
  window.dispatchEvent(mouseEvent('mouseup'));
  assert.equal(this.machine.state, 'clicking');
});

test('clicking (touch)', function(assert) {
  this.machine.start(touchEvent('touchstart', { targetTouches: [touch()] }));
  window.dispatchEvent(touchEvent('touchend', { changedTouches: [touch()] }));
  assert.equal(this.machine.state, 'clicking');
});

test('swiping (touch)', function(assert) {
  this.machine.start(touchEvent('touchstart', { timeStamp: 0, targetTouches: [touch()] }));
  window.dispatchEvent(touchEvent('touchmove', { timeStamp: 40, changedTouches: [touch()] }));
  assert.equal(this.machine.state, 'swiping');
});

function mouseEvent(type, props = {}) {
  return new MouseEvent(type, assign({
    timeStamp: 0
  }, props));
}

function touchEvent(type, props = {}) {
  return new TouchEvent(type, assign({
    timeStamp: 0
  }, props));
}

function touch(props = {}) {
  return new Touch(assign({
    identifier: 'test',
    target: document.createElement('div')
  }, props));
}
