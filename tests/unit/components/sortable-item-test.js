import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import { moduleForComponent, test } from 'ember-qunit';

const MockEvent = { };
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

moduleForComponent('sortable-item', {
  unit: true,
  needs: [],

  beforeEach() {
    run(() => {
      subject = this.subject();
      group = MockGroup.create();
      subject.set('direction', group.direction);
      subject.set('registerItem', group.registerItem.bind(group));
      subject.set('deregisterItem', group.deregisterItem.bind(group));
      subject.set('update', group.update.bind(group));
      subject.set('prepare', group.prepare.bind(group));
      subject.set('commit', group.commit.bind(group));
    });
  },

  afterEach() {
    run(() => {
      subject.destroy();
    });
  }
});

test('isAnimated', function(assert) {
  assert.expect(6);

  this.render(); //

  assert.equal(subject.get('isAnimated'), false);

  subject.element.style.transition = 'all 0s';
  assert.equal(subject.get('isAnimated'), false);

  subject.element.style.transition = 'all .125s';
  assert.equal(subject.get('isAnimated'), true);

  subject.element.style.transition = 'transform .125s';

  assert.equal(subject.get('isAnimated'), true);

  subject.element.style.transition = 'color .125s';
  assert.equal(subject.get('isAnimated'), false);

  subject.element.style.transition = 'none .125s';
  assert.equal(subject.get('isAnimated'), false);
});

test('isDragging is disabled when destroyed', function(assert) {
  assert.expect(3);

  this.render();

  run(() => {
    subject.set('model', MockModel);
    assert.equal(subject.get('isDragging'), false);
    subject._startDrag(MockEvent);
    assert.equal(subject.get('isDragging'), true);
    subject.destroy();
    assert.equal(subject.get('isDragging'), false);
  });
});

test('transitionDuration', function(assert) {
  assert.expect(5);

  this.render();

  subject.element.style.transition = 'all .25s';
  assert.equal(subject.get('transitionDuration'), 250);

  subject.element.style.transition = 'all 250ms';
  assert.equal(subject.get('transitionDuration'), 250);

  subject.element.style.transition = 'all 0s';
  assert.equal(subject.get('transitionDuration'), 0);

  subject.element.style.transition = 'all 0ms';
  assert.equal(subject.get('transitionDuration'), 0);

  subject.element.style.transition = 'none';
  assert.equal(subject.get('transitionDuration'), 0);
});

test('get y', function(assert) {
  assert.expect(1);

  this.render();

  assert.equal(subject.get('y'), subject.element.offsetTop,
    'expected y to be element.offsetTop');
});

test('get x', function(assert) {
  assert.expect(1);

  this.render();

  assert.equal(subject.get('x'), subject.element.offsetLeft,
    'expected x to be element.offsetLeft');
});

test('set y', function(assert) {
  assert.expect(2);

  this.render();

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
  assert.expect(2);

  this.render();

  run(() => {
    group.set('direction', 'x');
    subject.set('direction', 'x');
    subject.set('x', 50);
  });

  let transform = getTransform(subject.element);

  assert.equal(transform, 'translateX(50px)',
    'expected transform to be set to translateX');
  assert.equal(subject.get('x'), 50,
    'expected x to retain value');
});

test('height', function(assert) {
  assert.expect(1);

  this.render();

  subject.element.style.height = '50px';
  subject.element.style.marginTop = '10px';
  subject.element.style.marginBottom = '10px';

  assert.equal(subject.get('height'), 60,
    'expected height to be height + margin-bottom');
});

test('width', function(assert) {
  assert.expect(1);

  this.render();

  subject.element.style.width = '50px';
  subject.element.style.marginLeft = '10px';
  subject.element.style.marginRight = '10px';

  assert.equal(subject.get('width'), 70,
    'expected width to be width + margin-right + margin-left (like outerWidth)');
});

test('registers itself with group', function(assert) {
  assert.expect(1);

  this.render();
  assert.equal(group.item, subject,
    'expected to be registered with group');
});

test('deregisters itself when removed', function(assert) {
  assert.expect(1);

  this.render();

  run(() => {
    subject.destroy();
  });
  assert.equal(group.item, undefined,
    'expected to be deregistered with group');
});

test('dragStart fires an action if provided', function(assert) {
  assert.expect(1);

  this.render();

  const target = {
    action(passedModel) {
      assert.equal(passedModel, MockModel);
    }
  };

  run(() => {
    subject.set('model', MockModel);
    subject.set('target', target);
    subject.set('onDragStart', target.action.bind(target));
    subject._startDrag(MockEvent);
  });
});

test('dragStop fires an action if provided', function(assert) {
  assert.expect(1);

  this.render();

  const target = {
    action(passedModel) {
      assert.equal(passedModel, MockModel);
    }
  };

  run(() => {
    subject.set('model', MockModel);
    subject.set('target', target);
    subject.set('onDragStop', target.action.bind(target));
    subject._complete();
  });
});

test('it renders', function(assert) {
  assert.expect(2);

  // Creates the component instance
  assert.equal(subject._state, 'preRender');

  // Renders the component to the page
  this.render();
  assert.equal(subject._state, 'inDOM');
});

test('renders data-test-selector', function(assert) {
  assert.expect(1);

  assert.ok(subject.get('attributeBindings').indexOf('data-test-selector') > -1,
    'support data-test-selector attribute binding');
});

function getTransform(element) {
  let style = element.style;

  return style.transform ||
         style.mozTransform ||
         style.msTransform ||
         style.oTransform ||
         style.webkitTransform;
}
