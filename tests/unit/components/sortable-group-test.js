import {
  moduleForComponent,
  test
} from 'ember-qunit';
import Ember from 'ember';
const a = Ember.A;
const { run } = Ember;

moduleForComponent('sortable-group');

test('items', function(assert) {
  let component = this.subject();

  assert.deepEqual(component.get('items'), [],
    'expected items to default to an empty array');
});

test('itemPosition', function(assert) {
  let component = this.subject();

  this.render();

  component.$().css({ position: 'static' });
  assert.equal(component.get('itemPosition'),
    component.$().position().top,
    'expected itemPosition to work with static positioning');

  component.$().css({ position: 'relative' });
  assert.equal(component.get('itemPosition'),
    0,
    'expected itemPosition to work with relative positioning');

  component.$().css({ paddingTop: '10px' });
  assert.equal(component.get('itemPosition'),
    10,
    'expected itemPosition to work with relative positioning and padding');

  component.$().css({ position: 'static' });
  assert.equal(component.get('itemPosition'),
    component.$().position().top + 10,
    'expected itemPosition to work with static positioning and padding');
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
    height: 15
  }, {
    y: 20,
    height: 10
  }, {
    y: 5,
    height: 20,
    isDragging: true
  }];
  let component = this.subject({ items });

  this.render();
  component.$().css({ position: 'relative' });

  component.update();

  let expected = [{
    y: 20,
    height: 15
  }, {
    y: 35,
    height: 10
  }, {
    y: 5,
    height: 20,
    isDragging: true
  }];

  assert.deepEqual(items, expected,
    'expected y positions to be applied to all but isDragging');
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
