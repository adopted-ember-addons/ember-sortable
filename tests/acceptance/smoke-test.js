import { module, test } from 'qunit';
import { visit, find, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { drag }  from '../ember-sortable/helpers/drag';
import { reorder } from '../ember-sortable/helpers/reorder';

module('Acceptance | smoke', function(hooks) {
  setupApplicationTest(hooks);

  test('reordering with mouse events', async function(assert) {
    await visit('/');

    assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');

    let order = findAll('[data-test-vertical-demo-handle]').reverse();
    await reorder(
      'mouse',
      '[data-test-vertical-demo-handle]',
      ...order
    );

    assert.equal(verticalContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(horizontalContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(tableContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(scrollableContents(), 'Cinco Cuatro Tres Dos Uno');

    order = findAll('[data-test-horizontal-demo-handle]');
    await reorder(
      'mouse',
      '[data-test-horizontal-demo-handle]',
      order[1],
      order[0],
      order[3],
      order[4],
      order[2],
    );

    assert.equal(verticalContents(), 'Cuatro Cinco Dos Uno Tres');
    assert.equal(horizontalContents(), 'Cuatro Cinco Dos Uno Tres');
    assert.equal(tableContents(), 'Cuatro Cinco Dos Uno Tres');
    assert.equal(scrollableContents(), 'Cuatro Cinco Dos Uno Tres');

    order = findAll('[data-test-table-demo-handle');
    await reorder(
      'mouse',
      '[data-test-table-demo-handle]',
      order[3],
      order[2],
      order[4],
      order[0],
      order[1]
    )

    assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');

    let itemHeight = () => {
      let item = find('[data-test-scrollable-demo-handle]');
      const itemStyle = item.currentStyle || window.getComputedStyle(item);
      return item.offsetHeight + parseInt(itemStyle.marginTop);
    };

    await drag('mouse', '[data-test-scrollable-demo-handle] > .handle', () => { return {dy: itemHeight() * 2 + 1, dx: undefined}});

    assert.equal(verticalContents(), 'Dos Tres Uno Cuatro Cinco');
    assert.equal(horizontalContents(), 'Dos Tres Uno Cuatro Cinco');
    assert.equal(tableContents(), 'Dos Tres Uno Cuatro Cinco');
    assert.equal(scrollableContents(), 'Dos Tres Uno Cuatro Cinco');

    order = findAll('[data-test-vertical-distance-demo-handle]');

    await reorder(
      'mouse',
      '[data-test-vertical-distance-demo-handle]',
      order[1],
      order[0],
      order[2],
      order[3],
      order[4]
    );

    assert.equal(verticalContents(), 'Tres Dos Uno Cuatro Cinco');
    assert.equal(horizontalContents(), 'Tres Dos Uno Cuatro Cinco');
    assert.equal(tableContents(), 'Tres Dos Uno Cuatro Cinco');
    assert.equal(scrollableContents(), 'Tres Dos Uno Cuatro Cinco');
  });

  test('reordering with touch events', async function(assert) {
    await visit('/');

    assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');

    let order = findAll('[data-test-vertical-demo-handle]').reverse();
    await reorder(
      'touch',
      '[data-test-vertical-demo-handle]',
      ...order
    );

    assert.equal(verticalContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(horizontalContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(tableContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(scrollableContents(), 'Cinco Cuatro Tres Dos Uno');

    order = findAll('[data-test-horizontal-demo-handle]');

    await reorder(
      'touch',
      '[data-test-horizontal-demo-handle]',
      order[1],
      order[0],
      order[3],
      order[4],
      order[2],
    );

    assert.equal(verticalContents(), 'Cuatro Cinco Dos Uno Tres');
    assert.equal(horizontalContents(), 'Cuatro Cinco Dos Uno Tres');
    assert.equal(tableContents(), 'Cuatro Cinco Dos Uno Tres');
    assert.equal(scrollableContents(), 'Cuatro Cinco Dos Uno Tres');

    order = findAll('[data-test-table-demo-handle]');

    await reorder(
      'touch',
      '[data-test-table-demo-handle]',
      order[3],
      order[2],
      order[4],
      order[0],
      order[1]
    );

    assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');

    order = findAll('[data-test-vertical-distance-demo-handle]');
    await reorder(
      'touch',
      '[data-test-vertical-distance-demo-handle]',
      order[2],
      order[1],
      order[0],
      order[3],
      order[4],
    );

    assert.equal(verticalContents(), 'Tres Dos Uno Cuatro Cinco');
    assert.equal(horizontalContents(), 'Tres Dos Uno Cuatro Cinco');
    assert.equal(tableContents(), 'Tres Dos Uno Cuatro Cinco');
    assert.equal(scrollableContents(), 'Tres Dos Uno Cuatro Cinco');
  });

  function verticalContents() {
    return contents('.vertical-demo ol');
  }

  function horizontalContents() {
    return contents('.horizontal-demo ol');
  }

  function tableContents() {
    return contents('.table-demo tbody');
  }

  function scrollableContents() {
    return contents('.scrollable-demo ol');
  }

  function contents(selector) {
    return find(selector)
      .textContent
      .replace(/⇕/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^\s+/, '')
      .replace(/\s+$/, '');
  }
});

