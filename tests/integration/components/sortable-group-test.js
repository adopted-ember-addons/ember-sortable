import $ from 'jquery';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { triggerEvent } from '@ember/test-helpers';

moduleForComponent('sortable-group', 'Integration | Component | sortable group', {
  integration: true
});

test('distance attribute prevents the drag before the specified value', async function(assert) {
  await this.render(hbs`
    {{#sortable-group as |group|}}
      {{#group.item distance=15 model=1 id="dummy-sortable-item"}}
        {{item}}
      {{/group.item}}
    {{/sortable-group}}
  `);

  let item = $('#dummy-sortable-item');
  let itemElem = item[0];
  let itemOffset = item.offset();

  await triggerEvent(itemElem, 'mousedown', { clientX: itemOffset.left, clientY: itemOffset.top, which: 1 });
  await triggerEvent(itemElem, 'mousemove', { clientX: itemOffset.left, clientY: itemOffset.top, which: 1 });
  await triggerEvent(itemElem, 'mousemove', { clientX: itemOffset.left, clientY: itemOffset.top + 5, which: 1 });

  assert.dom(itemElem).doesNotHaveClass('is-dragging', 'does not start dragging if the drag distance is less than the passed one');

  await triggerEvent(itemElem, 'mousemove', { clientX: itemOffset.left, clientY: itemOffset.top + 20, which: 1 });

  assert.dom(itemElem).hasClass('is-dragging', 'starts dragging if the drag distance is more than the passed one');
});

test('sortable-items have tabindexes for accessibility', async function(assert) {
  await this.render(hbs`
    {{#sortable-group as |group|}}
      {{#group.item tabindex=0 model=1 id="dummy-sortable-item"}}
        sort me
      {{/group.item}}
    {{/sortable-group}}
  `);

  assert.dom('#dummy-sortable-item').hasAttribute('tabindex', '0', 'sortable-items have tabindexes');
});
