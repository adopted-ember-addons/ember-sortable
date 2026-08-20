import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  settled,
  find,
  findAll,
  render,
  triggerKeyEvent,
  waitUntil,
} from '@ember/test-helpers';
import { set } from '@ember/object';
import { drag, reorder } from 'ember-sortable/test-support';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | sortable-group', function (hooks) {
  setupRenderingTest(hooks);

  test('Works with items added after render', async function (assert) {
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

    await reorder('mouse', 'li', order[3], order[1], order[0], order[2]);
    assert.equal(contents('#test-list'), 'Quatro Dos Uno Tres');

    set(this, 'items', this.items.slice(1));

    await settled();

    await reorder('mouse', 'li', order[2], order[1], order[0]);

    assert.equal(contents('#test-list'), 'Tres Dos Uno');
  });

  test('you can disabled a group', async function (assert) {
    this.items = ['Uno', 'Dos', 'Tres', 'Quatro'];

    this.update = function () {
      assert.step('onChange was called while group is disabled');
    };

    this.disabled = false;

    await render(hbs`
      <ol id="test-list" {{sortable-group disabled=this.disabled onChange=this.update}}>
        {{#each this.items as |item|}}
          <li {{sortable-item model=item}}>{{item}}</li>
        {{/each}}
      </ol>
    `);

    this.set('disabled', true);

    let order = findAll('li');

    await reorder('mouse', 'li', order[3], order[1], order[0], order[2]);

    assert.ok(true, 'Reorder prevented');
    assert.verifySteps([]);
  });

  test('grid direction does not spuriously wrap the last item of a tightly-fit row while dragging', async function (assert) {
    // Item widths (100.6px, see app.css) round up under `offsetWidth`, so summing
    // them exceeds the container's real subpixel width even though everything fits.
    this.items = ['Uno', 'Dos', 'Tres'];

    this.update = (items) => {
      set(this, 'items', items);
    };

    await render(hbs`
      <ul
        id="test-grid-list"
        class="test-grid-tight-fit"
        {{sortable-group direction="grid" onChange=this.update}}
      >
        {{#each this.items as |item|}}
          <li class="test-grid-tight-fit-item" {{sortable-item model=item}}>{{item}}</li>
        {{/each}}
      </ul>
    `);

    const items = findAll('#test-grid-list li');
    const lastItem = items[2];
    const lastItemTopBeforeDrag = lastItem.getBoundingClientRect().top;

    await drag('mouse', items[0], () => ({ dx: 0, dy: 0 }), {
      beforedragend: async () => {
        const lastItemTopDuringDrag = lastItem.getBoundingClientRect().top;

        assert.equal(
          lastItemTopDuringDrag,
          lastItemTopBeforeDrag,
          'the last item stays on the same row mid-drag instead of jumping to a phantom next row',
        );
      },
    });
  });

  test('Announcer has appropriate text for user actions', async function (assert) {
    this.items = ['Uno', 'Dos', 'Tres'];

    this.update = (items) => {
      set(this, 'items', items);
    };

    await render(hbs`
      <ol id="test-list" {{sortable-group onChange=this.update}}>
        {{#each this.items as |item|}}
          <li {{sortable-item model=item}}>
            {{item}}
            <button data-test-handle={{item}} type="button" {{sortable-handle}}>
              handle
            </button>
          </li>
        {{/each}}
      </ol>
    `);

    triggerKeyEvent('[data-test-handle=Uno]', 'keydown', 32) /* SPACE */;

    await announcerHasText();
    assert
      .dom(announcerSelector)
      .hasText(
        'item at position, 1 of 3, is activated to be repositioned.Press up and down keys to change position, Space to confirm new position, Escape to cancel.',
      );

    triggerKeyEvent('[data-test-handle=Uno]', 'keydown', 40) /* DOWN */;

    await announcerHasText();
    assert
      .dom(announcerSelector)
      .hasText(
        'item is moved to position, 2 of 3. Press Space to confirm new position, Escape to cancel.',
      );

    triggerKeyEvent('[data-test-handle=Uno]', 'keydown', 32) /* SPACE */;

    await announcerHasText();
    assert.dom(announcerSelector).hasText('item is successfully repositioned.');

    await triggerKeyEvent('[data-test-handle=Uno]', 'keydown', 32) /* SPACE */;
    triggerKeyEvent('[data-test-handle=Uno]', 'keydown', 27) /* ESC */;

    await announcerHasText();
    assert.dom(announcerSelector).hasText('Cancelling item repositioning');
  });

  function contents(selector) {
    return find(selector)
      .textContent.replace(/⇕/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^\s+/, '')
      .replace(/\s+$/, '');
  }

  let announcerSelector = '#test-list + .visually-hidden';

  let announcerHasText = async function () {
    return await waitUntil(
      () => {
        return find(announcerSelector).textContent.includes(' ');
      },
      { timeout: 2000 },
    );
  };
});
