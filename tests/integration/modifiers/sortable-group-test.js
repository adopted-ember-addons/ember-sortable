import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { settled, find, findAll, render } from '@ember/test-helpers';
import { A as a } from '@ember/array';
import hbs from 'htmlbars-inline-precompile';
import { reorder }  from 'ember-sortable/test-support/helpers';

module('Integration | Modifier | modifiers/sortable-group', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.items = a(['Uno', 'Dos', 'Tres']);
    this.update = (items) => {
      this.set('items', a(items));
    }

    await render(hbs`
      <ol id="test-list" {{sortable-group onChange=this.update}}>
        {{#each this.items as |item|}}
          <li {{sortable-item model=item}}>{{item}}</li>
        {{/each}}
      </ol>
    `);

    this.items.pushObject('Quatro');

    await settled();

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

    this.items.removeAt(0);
    await settled();

    await reorder(
      'mouse',
      'li',
      order[2],
      order[1],
      order[0]
    );

    assert.equal(contents('#test-list'), 'Tres Dos Uno');
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
