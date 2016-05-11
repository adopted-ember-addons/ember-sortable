import Ember from 'ember';
import SortableItemMixin_IE from 'ember-sortable/mixins/sortable-item-ie-fix';
import { module, test } from 'qunit';
const { Component, run } = Ember;

const MockEvent = { originalEvent: null };
const MockModel = { name: 'Mock Model' };
const MockComponent = Component.extend(SortableItemMixin_IE);
const MockGroup = Ember.Object.extend({
  direction: 'y',
  registerItem(item) {
    this.item = item;
  },

  deregisterItem() {
    delete this.item;
  },

  commit() {},
  prepare() {},
  update() {},
});

let group;
let subject;

module('mixin:sortable-item-ie-fix', {
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
    // Otherwise we end up with dangling event handlers.
    $(window).off();
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

test('get x', function(assert) {
  assert.equal(subject.get('x'), subject.element.offsetLeft,
    'expected x to be element.offsetLeft');
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


test('set x', function(assert) {
  run(() => {
    group.set('direction', 'x');
    subject.set('x', 50);
  });

  let transform = getTransform(subject.element);

  assert.equal(transform, 'translateX(50px)',
    'expected transform to be set to translateX');
  assert.equal(subject.get('x'), 50,
    'expected x to retain value');
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

test('width', function(assert) {
  subject.$().css({
    width: '50px',
    marginLeft: '10px',
    marginRight: '10px'
  });

  assert.equal(subject.get('width'), 70,
    'expected width to be width + margin-right + margin-left (like outerWidth)');
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

test('dragStart fires an action if provided', function(assert) {
  assert.expect(1);

  const targetObject = {
    action(passedModel) {
      assert.equal(passedModel, MockModel);
    }
  };

  run(() => {
    subject.set('model', MockModel);
    subject.set('targetObject', targetObject);
    subject.set('onDragStart', 'action');
    subject._startDrag(MockEvent);
  });
});

test('dragStop fires an action if provided', function(assert) {
  assert.expect(1);

  const targetObject = {
    action(passedModel) {
      assert.equal(passedModel, MockModel);
    }
  };

  run(() => {
    subject.set('model', MockModel);
    subject.set('targetObject', targetObject);
    subject.set('onDragStop', 'action');
    subject._complete();
  });
});

test('checkIfTransformableElement returns true when transform is supported', function(assert) {
	assert.expect(7);

	run(() => {
		assert.ok(subject._checkIfTransformableElement());
		assert.ok(subject._checkIfTransformableElement('table-row'));
		assert.ok(subject._checkIfTransformableElement('table-cell'));
		assert.ok(subject._checkIfTransformableElement('table-row-group'));
		assert.ok(subject._checkIfTransformableElement('table-caption'));
		assert.ok(subject._checkIfTransformableElement('table-header-group'));
		assert.ok(subject._checkIfTransformableElement('table-footer-group'));
	});
});

function getTransform(element) {
  let style = element.style;

  return style.transform ||
         style.mozTransform ||
         style.msTransform ||
         style.oTransform ||
         style.webkitTransform;
}
