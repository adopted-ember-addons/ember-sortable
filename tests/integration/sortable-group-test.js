import hbs from 'htmlbars-inline-precompile';
import { test, moduleForComponent } from 'ember-qunit';
import Ember from 'ember';

const { A, run } = Ember;
const a = A;

function itemLabels() {
  return $('.sortable-item .label').toArray().map(function(item) {
    return $(item).text();
  });
}

function itemHeight() {
  return $('.sortable-item').outerHeight();
}

moduleForComponent('sortable-group', 'SortableGroup', { integration: true });

test('Drag an item', function(assert) {
  $('#ember-testing').css('zoom', '100%');

  this.set('items', a(['Uno', 'Dos', 'Tres', 'Quatro', 'Cinco']));

  this.on('reorderItems', (newOrder) => {
    this.set('items', newOrder);
  });

  this.render(hbs`
    {{#sortable-group tagName="ul" onChange="reorderItems" as |group|}}
      {{#each items as |item|}}
        {{#sortable-item tagName="li" model=item group=group handle=".handle"}}
          <span class="label">{{item}}</span>
          <span class="handle">&varr;</span>
        {{/sortable-item}}
      {{/each}}
    {{/sortable-group}}
  `);

  $('.sortable-item').css({ 'transition-property': 'none' });

  assert.equal($('.sortable-item').length, 5,
    'it shows the correct number of items'
  );

  let handle = $('.sortable-item:contains("Uno") .handle');

  run(function() {
    handle.simulate('drag', {
      dy: itemHeight() * 5
    });
  });

  assert.deepEqual(itemLabels(), ['Dos', 'Tres', 'Quatro', 'Cinco', 'Uno']);

  $('#ember-testing').css('zoom', '50%');
});

test('Drag an item while scrolling', function(assert) {
  $('#ember-testing').css('zoom', '100%');

  this.set('items', a(['Uno', 'Dos', 'Tres', 'Quatro', 'Cinco']));

  this.on('reorderItems', (newOrder) => {
    this.set('items', newOrder);
  });

  this.render(hbs`
    <div class="scrollable">
      {{#sortable-group tagName="ul" onChange="reorderItems" class="group" as |group|}}
        {{#each items as |item|}}
          {{#sortable-item tagName="li" model=item group=group handle=".handle"}}
            <span class="label">{{item}}</span>
            <span class="handle">&varr;</span>
          {{/sortable-item}}
        {{/each}}
      {{/sortable-group}}
    </div>
  `);

  $('.sortable-item').css({ 'transition-property': 'none' });

  let scrollable = $('.scrollable');
  let group = $('.group');

  scrollable.css('overflow-y', 'scroll');
  scrollable.height(itemHeight() * 5);

  group.css('padding', '0');
  group.css('margin', '0');
  group.height(itemHeight() * 10);

  let handle = $('.sortable-item:contains("Uno") .handle');
  let { left, top } = handle.offset();
  let screen = $(document);

  let center = {
    x: left + (handle.outerWidth() / 2),
    y: top + (handle.outerWidth() / 2)
  };

  let eventCoords = function(point) {
    return {
      pageX: Math.floor(point.x),
      pageY: Math.floor(point.y)
    };
  };

  run(function() {
    let steps = 3;

    handle.simulate('mousedown', eventCoords(center));
    scrollable.scrollTop(itemHeight());

    for(let i = 0; i < steps; i++) {
      screen.simulate('mousemove', eventCoords({
        x: center.x,
        y: center.y + (itemHeight() / steps) * i
      }));
    }

    screen.simulate('mouseup', eventCoords({
      x: center.x,
      y: center.y + itemHeight()
    }));
  });

  let labels = $('.sortable-item .label').toArray().map(function(item) {
    return $(item).text();
  });

  assert.deepEqual(labels, ['Dos', 'Tres', 'Uno', 'Quatro', 'Cinco']);

  $('#ember-testing').css('zoom', '50%');
});
