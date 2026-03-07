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
import { reorder } from 'ember-sortable/test-support';
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

  test('firstItemPosition recomputes after external container layout changes', async function (assert) {
    this.items = ['One', 'Two'];

    this.update = (items) => {
      set(this, 'items', items);
    };

    await render(hbs`
      <div id="test-wrapper" style="display:flex;justify-content:center;width:700px;">
        <ol
          id="test-list"
          style="display:block;white-space:nowrap;list-style:none;padding:0;margin:0;width:320px;"
          {{sortable-group direction="x" onChange=this.update groupName="external-changes"}}
        >
          {{#each this.items as |item|}}
            <li style="display:inline-block;width:80px;" {{sortable-item model=item groupName="external-changes"}}>
              {{item}}
            </li>
          {{/each}}
        </ol>
      </div>
    `);

    const sortableService = this.owner.lookup('service:ember-sortable-internal-state');
    const group = sortableService.fetchGroup('external-changes').groupModifier;

    const firstPositionBeforeResize = group.firstItemPosition.x;
    find('#test-wrapper').style.width = '500px';

    group.items.forEach((item) => item.reset());
    await settled();

    const firstItem = group.items[0];
    const expectedPositionAfterResize = firstItem.x - firstItem.spacing;
    assert.equal(group.firstItemPosition.x, expectedPositionAfterResize);
    assert.notEqual(group.firstItemPosition.x, firstPositionBeforeResize);
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
