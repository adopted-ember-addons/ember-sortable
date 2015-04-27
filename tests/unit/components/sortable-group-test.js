import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('sortable-group');

test('it renders', function(assert) {
  assert.expect(2);

  // Creates the component instance
  var component = this.subject();
  assert.equal(component._state, 'preRender');

  // Renders the component to the page
  this.render();
  assert.equal(component._state, 'inDOM');
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
