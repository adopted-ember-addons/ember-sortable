import {
  moduleForComponent,
  test
} from 'ember-qunit';
import Ember from 'ember';
const { run } = Ember;

moduleForComponent('sortable-group', { unit: true });

test('items', function(assert) {
  let component = this.subject();

  assert.deepEqual(component.get('items'), [],
    'expected items to default to an empty array');
});

test('sortedItems', function(assert) {
  let items = [{ y: 30 }, { y: 10 }, { y: 20 }];
  let component = this.subject({ items });
  let expected = [{ y: 10 }, { y: 20 }, { y: 30 }];

  assert.deepEqual(component.get('sortedItems'), expected,
    'expected sortedItems to sort on y');
});

test('[de]registerItem', function(assert) {
  let item = 'foo';
  let component = this.subject();

  component.registerItem(item);

  assert.ok(component.get('items').contains(item),
    'expected registerItem to add item to items');

  component.deregisterItem(item);

  assert.ok(!component.get('items').contains(item),
    'expected registerItem to remove item from items');
});

test('update', function(assert) {
  let items = [{
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
  let component = this.subject({ items });

  this.render();

  component.update();

  let expected = [{
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
  let items = [{
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

  let component = this.subject({ items });

  this.render();

  component.update();

  let expected = [{
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
  let items = [{
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

  let component = this.subject({ items });

  this.render();

  component.update();

  let expected = [{
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
  let items = [{
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

  let component = this.subject({
    items,
    direction: 'x'
  });

  this.render();

  component.update();

  let expected = [{
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
  let items = [{
    y: 20,
    model: 'bar'
  }, {
    y: 30,
    model: 'baz'
  }, {
    y: 10,
    model: 'foo'
  }];

  let targetObject = Ember.Object.create({
    reorder(newOrder) {
      this.newOrder = newOrder;
    }
  });
  let component = this.subject({
    items,
    targetObject,
    onChange: 'reorder'
  });

  run(() => {
    component.commit();
  });

  assert.deepEqual(targetObject.newOrder, ['foo', 'bar', 'baz'],
    'expected target to receive models in order');
});

test('commit with specified group model', function(assert) {
  let items = [{
    y: 20,
    model: 'bar'
  }, {
    y: 30,
    model: 'baz'
  }, {
    y: 10,
    model: 'foo'
  }];

  let model = {
    items: items
  };
  let targetObject = Ember.Object.create({
    reorder(model, newOrder) {
      model.newOrder = newOrder;
      targetObject.newModel = model;
    }
  });
  let component = this.subject({
    model,
    items,
    targetObject,
    onChange: 'reorder'
  });

  run(() => {
    component.commit();
  });

  assert.deepEqual(targetObject.newModel.newOrder, ['foo', 'bar', 'baz'],
    'expected target to receive models in order');
});

test('commit with missmatched group model', function(assert) {
  let items = [{
    y: 20,
    model: 'bar'
  }, {
    y: 30,
    model: 'baz'
  }, {
    y: 10,
    model: 'foo'
  }];
  let model = null;
  let targetObject = Ember.Object.create({
    reorder(model, newOrder) {
      if (typeof newOrder !== 'undefined') {
        targetObject.correctActionFired = true;
      }
    }
  });
  let component = this.subject({
    model,
    items,
    targetObject,
    onChange: 'reorder'
  });

  run(() => {
    component.commit();
  });

  assert.equal(targetObject.correctActionFired, true,
    'expected reorder() to receive two params');
});

test('draggedModel', function(assert) {
  assert.expect(1);

  let items = [{
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

  let targetObject = {
    action(models, draggedModel) {
      assert.equal(draggedModel, 'Two');
    }
  };

  let component = this.subject({
    items,
    targetObject,
    onChange: 'action'
  });

  run(() => {
    component.commit();
  });
});

test('renders data-test-selector', function(assert) {
  let component = this.subject();

  assert.ok(component.get('attributeBindings').indexOf('data-test-selector') > -1,
  'support data-test-selector attribute binging');
});
