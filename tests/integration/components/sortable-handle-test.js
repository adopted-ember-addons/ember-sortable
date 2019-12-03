import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { render } from '@ember/test-helpers';

module('Integration | Component | sortable-handle', function(hooks) {
  setupRenderingTest(hooks);

  test('[A11y] Sortable-handle has button role', async function(assert) {
    assert.expect(1);

    await render(hbs`
      {{#sortable-handle id="dummy-sortable-handle"}}
      {{/sortable-handle}}
    `);

    assert.dom('#dummy-sortable-handle').hasAttribute('role', 'button', 'sortable-handle have role of button');
  });
});
