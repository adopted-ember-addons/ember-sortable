import {
  moduleForComponent,
  test
} from 'ember-qunit';
import Ember from 'ember';
const a = Ember.A;

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
