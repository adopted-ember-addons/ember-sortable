import Ember from 'ember';
import SortableItemMixin from 'ember-sortable/mixins/sortable-item';
import { module, test } from 'qunit';
const { Component, run } = Ember;

const MockComponent = Component.extend(SortableItemMixin);

let subject;

module('mixin:sortable-item', {
  beforeEach() {
    run(() => {
      subject = MockComponent.create();
      subject.appendTo('#ember-testing');
    });
  },

  afterEach() {
    run(() => {
      subject.destroy();
    });
  }
});

test('isAnimated with transform and duration', function(assert) {
  subject.$().css({ transition: 'all .25s' });

  assert.equal(subject.get('isAnimated'), true,
    'expected isAnimated to be true');
});

test('isAnimated with transform but no duration', function(assert) {
  subject.$().css({ transition: 'all 0s' });

  assert.equal(subject.get('isAnimated'), false,
    'expected isAnimated to be false');
});

test('isAnimated with duration but no transform', function(assert) {
  subject.$().css({ transition: 'none' });

  assert.equal(subject.get('isAnimated'), false,
    'expected isAnimated to be false');
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

function getTransform(element) {
  let style = element.style;

  return style.transform ||
         style.mozTransform ||
         style.msTransform ||
         style.oTransform ||
         style.webkitTransform;
}
