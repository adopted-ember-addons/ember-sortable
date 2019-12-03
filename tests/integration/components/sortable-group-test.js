import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { render, find, triggerEvent, fillIn, triggerKeyEvent } from '@ember/test-helpers';
import { ENTER_KEY_CODE, SPACE_KEY_CODE, ARROW_KEY_CODES } from "ember-sortable/utils/keyboard";
import { set, setProperties } from '@ember/object';

module('Integration | Component | sortable-group', function(hooks) {
  setupRenderingTest(hooks);

  const NESTED_MODEL = [
    {
      value: '1',
      model: [
        {
          value: "11",
        },
        {
          value: "12",
        },
        {
          value: "13",
        },
      ],
    },
    {
      value: '2',
      model: [
        {
          value: "21",
        },
        {
          value: "22",
        },
        {
          value: "23",
        },
      ],
    },
    {
      value: '3',
      model: [
        {
          value: "31",
        },
        {
          value: "32",
        },
        {
          value: "33",
        },
      ],
    },
  ]

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

  test('events on input inside sortable-item does not bubble up', async function(assert) {
    assert.expect(2);

    await render(hbs`
      {{#sortable-group as |group|}}
        {{#group.item tabindex=0 model=1 id="dummy-sortable-item"}}
          <input id="item-input" type="text">
        {{/group.item}}
      {{/sortable-group}}
    `);

    await fillIn('#item-input', 'foo');
    await triggerEvent('#item-input', 'keydown', SPACE_KEY_CODE);
    assert.dom('#item-input').isFocused();
    await fillIn('#item-input', 'bar');
    await triggerEvent('#item-input', 'keydown', ENTER_KEY_CODE);
    assert.dom('#item-input').isFocused();
  });

  test('[A11y] Reordering on nested sortable-group works', async function(assert) {
    assert.expect(2);

    setProperties(this, {
      model: NESTED_MODEL,
      onChange: (items => this.set('model', items)),
      onNestedChange: ((group, items) => set(group, 'model', items)),
    });

    await render(hbs`
      {{#sortable-group class="top-sortable-group" onChange=(action onChange) model=model tagName="ul" as |group|}}
        {{#each group.model as |item|}}
          {{#group.item class="top-sortable-group-item" model=item as |groupItem|}}
            {{item.value}}
            {{#groupItem.handle}}
            {{/groupItem.handle}}
            {{#sortable-group class="nested-sortable-group" groupModel=item model=item.model onChange=(action onNestedChange) as |subGroup|}}
              {{#each subGroup.model as |subItem|}}
                {{#subGroup.item class="nested-sortable-group-item" model=subItem as |subGroupItem|}}
                  {{subItem.value}}
                  {{#subGroupItem.handle}}
                  {{/subGroupItem.handle}}
                {{/subGroup.item}}
              {{/each}}
            {{/sortable-group}}
          {{/group.item}}
        {{/each}}
      {{/sortable-group}}
    `);

    await triggerKeyEvent('.top-sortable-group [data-sortable-handle]', 'keydown', ENTER_KEY_CODE);
    await triggerKeyEvent(
      '.top-sortable-group',
      'keydown',
      ARROW_KEY_CODES.DOWN
    );
    await triggerKeyEvent(
      '.top-sortable-group',
      'keydown',
      ENTER_KEY_CODE
    );

    assert.dom('.top-sortable-group-item:nth-child(2)').hasText('1 11 12 13', 'Top level models are reordered correctly');

    await triggerKeyEvent('.nested-sortable-group [data-sortable-handle]', 'keydown', ENTER_KEY_CODE);
    for (let i = 0; i < 5; i++) {
      await triggerKeyEvent(
        '.nested-sortable-group',
        'keydown',
        ARROW_KEY_CODES.DOWN
      );
    }

    await triggerKeyEvent(
      '.nested-sortable-group',
      'keydown',
      ENTER_KEY_CODE
    );

    assert.dom('.nested-sortable-group-item:nth-child(3)').hasText('21', 'Nested models are reordered correctly');
  })
});
