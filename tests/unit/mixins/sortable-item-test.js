import Ember from 'ember';
import SortableItemMixin from 'ember-sortable/mixins/sortable-item';
import { module, test } from 'qunit';
const { Component, run } = Ember;

const MockComponent = Component.extend(SortableItemMixin);
const MockGroup = Ember.Object.extend({
  registerItem(item) {
    this.item = item;
  },

  deregisterItem(item) {
    delete this.item;
  },

  update() {},

  commit() {}
});

let group;
let subject;

module('mixin:sortable-item', {
  beforeEach() {
    run(() => {
      group = MockGroup.create();
      subject = MockComponent.create({ group });
      subject.appendTo('#ember-testing');
    });
  },

  afterEach() {
    run(() => {
      subject.destroy();
    });
  }
});

test('isAnimated', function(assert) {
  subject.$().css({ transition: 'all' });
  assert.equal(subject.get('isAnimated'), true);

  subject.$().css({ transition: 'transform' });
  assert.equal(subject.get('isAnimated'), true);

  subject.$().css({ transition: 'color' });
  assert.equal(subject.get('isAnimated'), false);

  subject.$().css({ transition: 'none' });
  assert.equal(subject.get('isAnimated'), false);
});

test('transitionDuration', function(assert) {
  subject.$().css({ transition: 'all .25s' });
  assert.equal(subject.get('transitionDuration'), 250);

  subject.$().css({ transition: 'all 250ms' });
  assert.equal(subject.get('transitionDuration'), 250);

  subject.$().css({ transition: 'all 0s' });
  assert.equal(subject.get('transitionDuration'), 0);

  subject.$().css({ transition: 'all 0ms' });
  assert.equal(subject.get('transitionDuration'), 0);

  subject.$().css({ transition: 'none' });
  assert.equal(subject.get('transitionDuration'), 0);
});

test('get y', function(assert) {
  assert.equal(subject.get('y'), subject.element.offsetTop,
    'expected y to be element.offsetTop');
});

test('set y', function(assert) {
  run(() => {
    subject.set('y', 50);
  });

  let transform = getTransform(subject.element);

  assert.equal(transform, 'translateY(50px)',
    'expected transform to be set');
  assert.equal(subject.get('y'), 50,
    'expected y to retain value');
});

test('height', function(assert) {
  subject.$().css({
    height: '50px',
    marginTop: '10px',
    marginBottom: '10px'
  });

  assert.equal(subject.get('height'), 60,
    'expected height to be height + margin-bottom');
});

test('registers itself with group', function(assert) {
  assert.equal(group.item, subject,
    'expected to be registered with group');
});

test('deregisters itself when removed', function(assert) {
  run(() => {
    subject.remove();
  });
  assert.equal(group.item, undefined,
    'expected to be deregistered with group');
});

function getTransform(element) {
  let style = element.style;

  return style.transform ||
         style.mozTransform ||
         style.msTransform ||
         style.oTransform ||
         style.webkitTransform;
}
