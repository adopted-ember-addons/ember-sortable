import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Component from '@ember/component'
import SortableItemMixin from 'ember-sortable/mixins/sortable-item'
import { render } from '@ember/test-helpers';

const MockEvent = { originalEvent: null };
const MockModel = { name: 'Mock Model' };
const MockGroup = EmberObject.extend({
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

module('sortable-item-mixin', function(hooks) {
  // setupTest(hooks);
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    const mockComponent = Component.extend(SortableItemMixin, {
      classNames: ['test-mock-cmpt'],
      didInsertElement() {
        this._super()
        subject = this
      }
    })
    await run(async () => {
      this.owner.register('component:test-mock', mockComponent)
      group = MockGroup.create();
      this.set('group', group)
      this.set('rendered', true)
      await render(hbs`{{#if rendered}}{{test-mock group=group}}{{/if}}`)
      // run(() => subject.set('group', group))
    });
  });

  test('isAnimated', async function(assert) {
    // console.log({isAnimated: subject.get(('isAnimated'))})
    subject.$().css({ transition: 'all' });
    assert.equal(subject.get('isAnimated'), true);

    subject.$().css({ transition: 'transform' });
    assert.equal(subject.get('isAnimated'), true);

    subject.$().css({ transition: 'color' });
    assert.equal(subject.get('isAnimated'), false);

    subject.$().css({ transition: 'none' });
    assert.equal(subject.get('isAnimated'), false);
  });

  test('isDragging is disabled when destroyed', function(assert) {
    assert.expect(2);

    run(() => {
      subject.set('model', MockModel);
      assert.equal(subject.get('isDragging'), false, 'isDragging = false');
      subject._startDrag(MockEvent);
      assert.equal(subject.get('isDragging'), true, 'isDragging = true w/ Mocvvent');
    });
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
      this.set('rendered', false)
    });
    assert.equal(group.item, undefined,
      'expected to be deregistered with group');
  });

  test('dragStart fires an action if provided', function(assert) {
    assert.expect(1);

    const target = {
      action(passedModel) {
        assert.equal(passedModel, MockModel);
      }
    };

    run(() => {
      subject.set('model', MockModel);
      subject.set('target', target);
      subject.set('onDragStart', 'action');
      subject._startDrag(MockEvent);
    });
  });

  test('dragStop fires an action if provided', function(assert) {
    assert.expect(1);

    const target = {
      action(passedModel) {
        assert.equal(passedModel, MockModel);
      }
    };

    run(() => {
      subject.set('model', MockModel);
      subject.set('target', target);
      subject.set('onDragStop', 'action');
      subject._complete();
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
});
