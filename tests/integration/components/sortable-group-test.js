import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { render, find, triggerEvent } from '@ember/test-helpers';

module('Integration | Component | sortable group', function(hooks) {
  setupRenderingTest(hooks);

  test('distance attribute prevents the drag before the specified value', async function(assert) {
    await render(hbs`
      {{#sortable-group as |group|}}
        {{#group.item distance=15 model=1 id="dummy-sortable-item"}}
          {{item}}
        {{/group.item}}
      {{/sortable-group}}
    `);

    let itemElem = find('#dummy-sortable-item');
    let itemOffset = itemElem.getBoundingClientRect();

    await triggerEvent(itemElem, 'mousedown', { clientX: itemOffset.left, clientY: itemOffset.top, which: 1 });
    await triggerEvent(itemElem, 'mousemove', { clientX: itemOffset.left, clientY: itemOffset.top, which: 1 });
    await triggerEvent(itemElem, 'mousemove', { clientX: itemOffset.left, clientY: itemOffset.top + 5, which: 1 });

    assert.dom(itemElem).doesNotHaveClass('is-dragging', 'does not start dragging if the drag distance is less than the passed one');

    await triggerEvent(itemElem, 'mousemove', { clientX: itemOffset.left, clientY: itemOffset.top + 20, which: 1 });

    assert.dom(itemElem).hasClass('is-dragging', 'starts dragging if the drag distance is more than the passed one');
  });

  test('sortable-items have tabindexes for accessibility', async function(assert) {
    await render(hbs`
      {{#sortable-group as |group|}}
        {{#group.item tabindex=0 model=1 id="dummy-sortable-item"}}
          sort me
        {{/group.item}}
      {{/sortable-group}}
    `);

    assert.dom('#dummy-sortable-item').hasAttribute('tabindex', '0', 'sortable-items have tabindexes');
  });
});
