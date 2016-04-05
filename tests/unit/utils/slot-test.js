import Slot from 'ember-sortable/utils/slot';
import { module, test } from 'qunit';

class FakeNode {
  constructor(element) {
    this.element = element;
    this.sortableChildren = [];
  }

  get elementId() {
    return 'fake-node';
  }

  $() {
    return $(this.element);
  }
}

module('Unit | Utility | Slot', {
  beforeEach() {
    this.element = document.createElement('div');
    this.node = new FakeNode(this.element);

    this.element.style.position = 'absolute';
    this.element.style.left = '10px';
    this.element.style.top = '20px';
    this.element.style.width = '100px';
    this.element.style.height = '200px';
    this.element.style.padding = '10px 5px';

    document.body.appendChild(this.element);

    this.slot = new Slot(this.node);
  },

  afterEach() {
    this.element.remove();
  }
});

test('construct', function(assert) {
  let { slot } = this;

  assert.equal(slot.id, 'fake-node');
  assert.equal(slot.x, 10);
  assert.equal(slot.y, 20);
  assert.equal(slot.width, 100);
  assert.equal(slot.outerWidth, 110);
  assert.equal(slot.height, 200);
  assert.equal(slot.outerHeight, 220);
  assert.deepEqual(slot.bounds, { top: 20, left: 10, bottom: 240, right: 120 });
});

test('translateBy', function(assert) {
  let { slot } = this;

  slot.translateBy(10, 10);

  assert.equal(slot.x, 20);
  assert.equal(slot.y, 30);
  assert.deepEqual(slot.bounds, { top: 30, left: 20, bottom: 250, right: 130 });
});

test('resizeBy', function(assert) {
  let { slot } = this;

  slot.resizeBy(10, 10);

  assert.equal(slot.width, 110);
  assert.equal(slot.outerWidth, 120);
  assert.equal(slot.height, 210);
  assert.equal(slot.outerHeight, 230);
  assert.deepEqual(slot.bounds, { top: 20, left: 10, bottom: 250, right: 130 });
});

test('render', function(assert) {
  let { slot, element } = this;

  slot.translateBy(10, 10);
  slot.resizeBy(10, 10);
  slot.render();

  let { width, height, transform } = element.style;

  assert.equal(width, '110px');
  assert.equal(height, '210px');
  assert.equal(transform, 'translate(10px, 10px)');
});

test('clear', function(assert) {
  let { slot, element } = this;

  slot.clear();

  let { width, height, transform } = element.style;

  assert.equal(width, '');
  assert.equal(height, '');
  assert.equal(transform, '');
});
