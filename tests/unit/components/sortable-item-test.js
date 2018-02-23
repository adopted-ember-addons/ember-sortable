import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('sortable-item', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(1);
    await render(hbs`{{sortable-item}}`);
    assert.ok(this.element.querySelector('.sortable-item'), "Should have sortable-item class from mixin");
  });

  test('renders data-test-selector', function(assert) {
    const component = this.owner.factoryFor('component:sortable-item').create();
    assert.ok(component.get('attributeBindings').indexOf('data-test-selector') > -1,
      'support data-test-selector attribute binding');
  });
});
