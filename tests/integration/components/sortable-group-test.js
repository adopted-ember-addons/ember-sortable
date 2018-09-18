import { run } from '@ember/runloop';
import $ from 'jquery';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | sortable group', function(hooks) {
  setupRenderingTest(hooks);

  test('distance attribute prevents the drag before the specified value', async function(assert) {
    await render(hbs`
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

  test('sortable-items have tabindexes for accessibility', async function(assert) {
    await render(hbs`
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
});
