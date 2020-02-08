import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { A as a } from '@ember/array';
import { reorder }  from 'ember-sortable/test-support/helpers';

module('Integration | Modifier | modifiers/sortable-group', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    this.items = a(['Uno', 'Dos', 'Tres']);
    this.update = (a) => {
      this.set('items', a);
    }

    await render(hbs`
      <ol id="test-list" {{sortable-group onChange=this.update}}>
        {{#each this.items as |item|}}
          <li {{sortable-item model=item}}>{{item}}</li>
        {{/each}}
      </ol>
    `);

    this.items.pushObject('Quatro');
    let order = findAll('li');
    await reorder(
      'mouse',
      'li',
      order[3],
      order[1],
      order[0],
      order[2],
    );

    assert.equal(contents('#test-list'), 'Quatro Dos Uno Tres');
  });

  function contents(selector) {
    return find(selector)
      .textContent
      .replace(/⇕/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^\s+/, '')
      .replace(/\s+$/, '');
  }
});
