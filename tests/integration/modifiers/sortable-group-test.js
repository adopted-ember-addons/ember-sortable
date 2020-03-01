import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { settled, find, findAll, render } from '@ember/test-helpers';
import {set} from '@ember/object';
import { reorder }  from 'ember-sortable/test-support/helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Modifier | sortable-group', function(hooks) {
  setupRenderingTest(hooks);

  test('Works with items added after render', async function(assert) {
    this.items = ['Uno', 'Dos', 'Tres'];

    this.update = (items) => {
      set(this, 'items', items);
    };

    await render(hbs`
      <ol id="test-list" {{sortable-group onChange=this.update}}>
        {{#each this.items as |item|}}
          <li {{sortable-item model=item}}>{{item}}</li>
        {{/each}}
      </ol>
    `);

    set(this, 'items', [...this.items, 'Quatro']);

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

    set(this, 'items', this.items.slice(1));

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
