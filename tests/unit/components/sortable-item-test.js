import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('sortable-item', function(hooks) {
  setupTest(hooks);

  test('it renders', function(assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.owner.factoryFor('component:sortable-item').create();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

  test('renders data-test-selector', function(assert) {
    let component = this.owner.factoryFor('component:sortable-item').create();

    assert.ok(component.get('attributeBindings').indexOf('data-test-selector') > -1,
      'support data-test-selector attribute binding');
  });
});