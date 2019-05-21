import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('sortable-item', {
  unit: true
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']
});

test('it renders', function(assert) {
  assert.expect(2);

  // Creates the component instance
  var component = this.subject();
  assert.equal(component._state, 'preRender');

  // Renders the component to the page
  this.render();
  assert.equal(component._state, 'inDOM');
});

test('renders data-test-selector', function(assert) {
  let component = this.subject();

  assert.ok(component.get('attributeBindings').indexOf('data-test-selector') > -1,
    'support data-test-selector attribute binding');
});
