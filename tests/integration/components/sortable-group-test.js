import { run } from '@ember/runloop';
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

  let item = document.getElementById('dummy-sortable-item');
  let itemOffset = item.getBoundingClientRect();

  triggerEvent(item, 'mousedown', { pageX: itemOffset.left, pageY: itemOffset.top, which: 1 });
  triggerEvent(item, 'mousemove', { pageX: itemOffset.left, pageY: itemOffset.top, which: 1 });
  triggerEvent(item, 'mousemove', { pageX: itemOffset.left, pageY: itemOffset.top + 5, which: 1 });

  assert.notOk(item.classList.includes('is-dragging'), 'does not start dragging if the drag distance is less than the passed one');

  triggerEvent(item, 'mousemove', { pageX: itemOffset.left, pageY: itemOffset.top + 20, which: 1 });

  assert.ok(item.classList.includes('is-dragging'), 'starts dragging if the drag distance is more than the passed one');
});

test('sortable-items have tabindexes for accessibility', function (assert) {
  this.render(hbs`
    {{#sortable-group as |group|}}
      {{#sortable-item tabindex=0 model=1 id="dummy-sortable-item"}}
        sort me
      {{/sortable-item}}
    {{/sortable-group}}
  `);

  let item = this.element.getElementById('dummy-sortable-item');

  assert.equal(item.getAttribute('tabindex'), 0, 'sortable-items have tabindexes');
});

function triggerEvent(el, type, props) {
  run(() => {
    let event = new CustomEvent(type, props);
    el.dispatch(event);
  });
}
