import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import { set } from '@ember/object';
import { drag } from 'ember-sortable/test-support';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | sortable-item', function (hooks) {
  setupRenderingTest(hooks);

  // #641: on drop, `_waitForAllTransitions` awaits each item's Web Animations
  // `finished` promise. If an animation gets cancelled mid-drop, say by the
  // re-render from `sortableGroup.update`, the browser rejects `finished` with
  // a DOMException named 'AbortError'. We swallow that one so the drop still
  // completes. Any other rejection has to keep propagating, otherwise a real
  // failure gets hidden.
  test('A cancelled animation is treated as finished, other rejections propagate', async function (assert) {
    this.items = ['Uno', 'Dos', 'Tres'];
    this.update = (items) => set(this, 'items', items);

    await render(hbs`
      <ol id="test-list" {{sortable-group groupName="ohai" onChange=this.update}}>
        {{#each this.items as |item|}}
          <li data-test-item {{sortable-item groupName="ohai" model=item}}>{{item}}</li>
        {{/each}}
      </ol>
    `);

    const group = this.owner
      .lookup('service:ember-sortable-internal-state')
      .fetchGroup('ohai');
    const item = group.items[0];

    // The getAnimations() path we're testing only runs when `isAnimated` is
    // true, which needs a real transition on the element. Give every item one
    // and assert it took, so the test can't pass down the timeout branch.
    item.sortableGroup.sortedItems.forEach((sortedItem) => {
      sortedItem.element.style.transition = 'transform 100ms';
    });
    assert.true(
      item.isAnimated,
      'the item is animated, so the getAnimations() path runs',
    );

    const stubAnimations = (finished) => {
      item.sortableGroup.sortedItems.forEach((sortedItem) => {
        sortedItem.element.getAnimations = () => [{ finished }];
      });
    };

    stubAnimations(
      Promise.reject(
        new DOMException('The user aborted a request', 'AbortError'),
      ),
    );

    try {
      await item._waitForAllTransitions();
      assert.ok(
        true,
        'the drop resolves instead of rejecting on a cancelled animation',
      );
    } catch {
      assert.ok(
        false,
        'the drop should not reject when an animation is cancelled',
      );
    }

    stubAnimations(Promise.reject(new Error('boom')));

    await assert.rejects(
      item._waitForAllTransitions(),
      /boom/,
      'genuine animation failures are not masked',
    );
  });

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
