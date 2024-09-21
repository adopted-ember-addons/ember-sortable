import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import { set } from '@ember/object';
import { drag } from 'ember-sortable/test-support';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | sortable-item', function (hooks) {
  setupRenderingTest(hooks);

  test('Drag works with one item', async function (assert) {
    this.items = ['Uno'];

    this.update = (items) => {
      set(this, 'items', items);
    };

    await render(hbs`
      <ol id="test-list" {{sortable-group onChange=this.update}}>
        {{#each this.items as |item|}}
          <li data-test-item {{sortable-item model=item}}>{{item}}</li>
        {{/each}}
      </ol>
    `);

    await drag('mouse', '[data-test-item]', () => {
      return { dy: 10 };
    });

    assert.equal(contents('#test-list'), 'Uno');
  });

  function contents(selector) {
    return find(selector)
      .textContent.replace(/⇕/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^\s+/, '')
      .replace(/\s+$/, '');
  }
});
