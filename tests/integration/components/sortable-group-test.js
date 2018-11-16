import { run } from '@ember/runloop';
import $ from 'jquery';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('sortable-group', 'Integration | Component | sortable group', {
  integration: true
});

test('distance attribute prevents the drag before the specified value', function(assert) {
  this.render(hbs`
    {{#sortable-group as |group|}}
      {{#sortable-item distance=15 model=1 group=group id="dummy-sortable-item"}}
        {{item}}
      {{/sortable-item}}
    {{/sortable-group}}
  `);

  let item = $('#dummy-sortable-item');
  let itemOffset = item.offset();

  triggerEvent(item, 'mousedown', { pageX: itemOffset.left, pageY: itemOffset.top, which: 1 });
  triggerEvent(item, 'mousemove', { pageX: itemOffset.left, pageY: itemOffset.top, which: 1 });
  triggerEvent(item, 'mousemove', { pageX: itemOffset.left, pageY: itemOffset.top + 5, which: 1 });

  assert.notOk(item.hasClass('is-dragging'), 'does not start dragging if the drag distance is less than the passed one');

  triggerEvent(item, 'mousemove', { pageX: itemOffset.left, pageY: itemOffset.top + 20, which: 1 });

  assert.ok(item.hasClass('is-dragging'), 'starts dragging if the drag distance is more than the passed one');
});

test('sortable-items have tabindexes for accessibility', function (assert) {
  this.render(hbs`
    {{#sortable-group as |group|}}
      {{#sortable-item tabindex=0 model=1 id="dummy-sortable-item"}}
        sort me
      {{/sortable-item}}
    {{/sortable-group}}
  `);

  let item = this.$('#dummy-sortable-item');

  assert.equal(item.attr('tabindex'), 0, 'sortable-items have tabindexes');
});

function triggerEvent(el, type, props) {
  run(() => {
    let event = $.Event(type, props);
    $(el).trigger(event);
  });
}
