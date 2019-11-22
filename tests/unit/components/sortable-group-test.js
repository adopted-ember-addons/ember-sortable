import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('sortable-group', { unit: true });

test('items', function(assert) {
  const component = this.subject();

  assert.deepEqual(component.get('items'), [],
    'expected items to default to an empty array');
});

test('sortedItems', function(assert) {
  const items = [{ y: 30 }, { y: 10 }, { y: 20 }];
  const component = this.subject();
  const expected = [{ y: 10 }, { y: 20 }, { y: 30 }];

  items.forEach(item => component._registerItem(item));
  assert.deepEqual(component.get('sortedItems'), expected,
    'expected sortedItems to sort on y');
});

test('[de]registerItem', function(assert) {
  const item = 'foo';
  const component = this.subject();

  component._registerItem(item);

  assert.ok(component.get('items').includes(item),
    'expected registerItem to add item to items');

  component._deregisterItem(item);

  assert.ok(!component.get('items').includes(item),
    'expected registerItem to remove item from items');
});

test('update', function(assert) {
  const items = [{
    y: 10,
    height: 15,
    spacing: 0
  }, {
    y: 20,
    height: 10,
    spacing: 0
  }, {
    y: 5,
    height: 20,
    spacing: 0,
    isDragging: true
  }];
  const component = this.subject();
  items.forEach(item => component._registerItem(item));

  this.render();

  component._update();

  const expected = [{
    y: 25,
    height: 15,
    spacing: 0
  }, {
    y: 40,
    height: 10,
    spacing: 0
  }, {
    y: 5,
    height: 20,
    spacing: 0,
    isDragging: true
  }];


  assert.deepEqual(items, expected,
    'expected y positions to be applied to all but isDragging');
});

test('update', function(assert) {
  const items = [{
    y: 15,
    height: 15,
    spacing: 10
  }, {
    y: 20,
    height: 10,
    spacing: 10
  }, {
    y: 35,
    height: 25,
    spacing: 10,
    isDragging: true
  }, {
    y: 45,
    height: 20,
    spacing: 10
  }];

  const component = this.subject();
  items.forEach(item => component._registerItem(item));

  this.render();

  component._update();

  const expected = [{
    y: 5,
    height: 15,
    spacing: 10
  }, {
    y: 20,
    height: 10,
    spacing: 10
  }, {
    y: 35,
    height: 25,
    spacing: 10,
    isDragging: true
  }, {
    y: 55,
    height: 20,
    spacing: 10,
  }];

  assert.deepEqual(items, expected,
    'expected y positions to be applied to all but isDragging and with regard to defined spacing');
});

test('update', function(assert) {
  const items = [{
    y: 15,
    height: 15,
    spacing: 8
  }, {
    y: 20,
    height: 10,
    spacing: 9
  }, {
    y: 35,
    height: 25,
    spacing: 10,
    isDragging: true
  }, {
    y: 45,
    height: 20,
    spacing: 11
  }];

  const component = this.subject();
  items.forEach(item => component._registerItem(item));

  this.render();

  component._update();

  const expected = [{
    y: 7,
    height: 15,
    spacing: 8
  }, {
    y: 22,
    height: 10,
    spacing: 9
  }, {
    y: 35,
    height: 25,
    spacing: 10,
    isDragging: true
  }, {
    y: 57,
    height: 20,
    spacing: 11,
  }];

  assert.deepEqual(items, expected,
    'expected y positions to be applied to all but isDragging and with regard to defined spacing - for each element different');
});

test('update', function(assert) {
  const items = [{
    x: 15,
    width: 15,
    spacing: 10
  }, {
    x: 20,
    width: 10,
    spacing: 10
  }, {
    x: 35,
    width: 25,
    spacing: 10,
    isDragging: true
  }, {
    x: 45,
    width: 20,
    spacing: 10
  }];

  const component = this.subject({
    direction: 'x'
  });
  items.forEach(item => component._registerItem(item));

  this.render();

  component._update();

  const expected = [{
    x: 5,
    width: 15,
    spacing: 10
  }, {
    x: 20,
    width: 10,
    spacing: 10
  }, {
    x: 35,
    width: 25,
    spacing: 10,
    isDragging: true
  }, {
    x: 55,
    width: 20,
    spacing: 10,
  }];

  assert.deepEqual(items, expected,
    'expected x positions to be applied to all but isDragging and with regard to defined spacing');
});

test('commit without specified group model', function(assert) {
  const items = [{
    y: 20,
    model: 'bar'
  }, {
    y: 30,
    model: 'baz'
  }, {
    y: 10,
    model: 'foo'
  }];

  const target = EmberObject.create({
    reorder(newOrder) {
      this.newOrder = newOrder;
    }
  });
  const component = this.subject({
    target,
    onChange: target.reorder.bind(target)
  });

  items.forEach(item => component._registerItem(item));


  run(() => {
    component._commit();
  });

  assert.deepEqual(target.newOrder, ['foo', 'bar', 'baz'],
    'expected target to receive models in order');
});

test('draggedModel', function(assert) {
  assert.expect(1);

  const items = [{
    y: 1,
    model: 'One',
  }, {
    y: 2,
    model: 'Two',
    wasDropped: true
  }, {
    y: 3,
    model: 'Three'
  }];

  const target = {
    action(models, draggedModel) {
      assert.equal(draggedModel, 'Two');
    }
  };

  const component = this.subject({
    target,
    onChange: target.action.bind(target)
  });
  items.forEach(item => component._registerItem(item));

  run(() => {
    component._commit();
  });
});

test('renders data-test-selector', function(assert) {
  const component = this.subject();

  assert.ok(component.get('attributeBindings').indexOf('data-test-selector') > -1,
  'support data-test-selector attribute binging');
});

test('commit with specified group model', function(assert) {
  const items = [{
    y: 20,
    model: 'bar'
  }, {
    y: 30,
    model: 'baz'
  }, {
    y: 10,
    model: 'foo'
  }];

  const groupModel = {
    items: items
  };
  const target = EmberObject.create({
    reorder(model, newOrder) {
      model.newOrder = newOrder;
      target.newModel = model;
    }
  });

  const component = this.subject({
    groupModel,
    target,
    onChange: target.reorder.bind(target)
  });
  items.forEach(item => component._registerItem(item));

  run(() => {
    component._commit();
  });

  assert.deepEqual(target.newModel.newOrder, ['foo', 'bar', 'baz'],
    'expected target to receive models in order');
});

test('commit with missmatched group model', function(assert) {
  const items = [{
    y: 20,
    model: 'bar'
  }, {
    y: 30,
    model: 'baz'
  }, {
    y: 10,
    model: 'foo'
  }];
  const groupModel = null;
  const target = EmberObject.create({
    reorder(model, newOrder) {
      if (typeof newOrder !== 'undefined') {
        target.correctActionFired = true;
      }
    }
  });
  const component = this.subject({
    groupModel,
    target,
    onChange: target.reorder.bind(target)
  });
  items.forEach(item => component._registerItem(item));

  run(() => {
    component._commit();
  });

  assert.equal(target.correctActionFired, true,
    'expected reorder() to receive two params');
});

