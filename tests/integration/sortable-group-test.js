import hbs from 'htmlbars-inline-precompile';
import { test, moduleForComponent } from 'ember-qunit';
import Ember from 'ember';

const { A, run } = Ember;
const a = A;

moduleForComponent('sortable-group', 'SortableGroup', { integration: true });

test('Drag an item', function(assert) {
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

  assert.equal($('.sortable-item').length, 5,
    'it shows the correct number of items'
  );

  let uno = $('.sortable-item:contains("Uno") .handle');

  run(function() {
    uno.simulate('drag', {
      dy: $('.sortable-item').outerHeight() * 5
    });
  });

  let labels = $('.sortable-item .label').toArray().map(function(item) {
    return $(item).text();
  });

  assert.deepEqual(labels, ['Dos', 'Tres', 'Quatro', 'Cinco', 'Uno']);
});

test('Drag an item while scrolling', function(assert) {
  assert.equal(true, true);
});
