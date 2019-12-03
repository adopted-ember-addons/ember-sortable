import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { render } from '@ember/test-helpers';

module('Integration | Component | sortable-item', function(hooks) {
  setupRenderingTest(hooks);

  test('[A11y] sortable-items have tabindexes for accessibility', async function(assert) {
    assert.expect(1);

    await render(hbs`
      {{#sortable-group
        as |group|
      }}
        {{#group.item tabindex=0 model=1 id="dummy-sortable-item"}}
          sort me
        {{/group.item}}
      {{/sortable-group}}
    `);

    assert.dom('#dummy-sortable-item').hasAttribute('tabindex', '0', 'sortable-items have tabindexes');
  });
});
