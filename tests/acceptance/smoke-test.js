import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, findAll } from '@ember/test-helpers';
import startApp from '../../tests/helpers/start-app';
import { drag } from 'ember-sortable/helpers/drag';
import { reorder } from 'ember-sortable/helpers/reorder';

module('Acceptance | smoke', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    this.application = startApp();
  });

  hooks.afterEach(function() {
    run(this.application, 'destroy');
  });

  test('reordering with mouse events', async function(assert) {
    assert.expect(25);

    await visit('/');

    assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');

    await reorder(
      'mouse',
      '.vertical-demo .handle',
      '[data-item=Cinco]',
      '[data-item=Cuatro]',
      '[data-item=Tres]',
      '[data-item=Dos]',
      '[data-item=Uno]'
    );

      assert.equal(verticalContents(), 'Cinco Cuatro Tres Dos Uno');
      assert.equal(horizontalContents(), 'Cinco Cuatro Tres Dos Uno');
      assert.equal(tableContents(), 'Cinco Cuatro Tres Dos Uno');
      assert.equal(scrollableContents(), 'Cinco Cuatro Tres Dos Uno');

    // await reorder(
    //   'mouse',
    //   '.horizontal-demo li',
    //   ':contains(Cuatro)',
    //   ':contains(Cinco)',
    //   ':contains(Dos)',
    //   ':contains(Uno)',
    //   ':contains(Tres)'
    // );

    //   assert.equal(verticalContents(), 'Cuatro Cinco Dos Uno Tres');
    //   assert.equal(horizontalContents(), 'Cuatro Cinco Dos Uno Tres');
    //   assert.equal(tableContents(), 'Cuatro Cinco Dos Uno Tres');
    //   assert.equal(scrollableContents(), 'Cuatro Cinco Dos Uno Tres');

    await reorder(
      'mouse',
      '.table-demo .handle',
      '[data-item=Uno]',
      '[data-item=Dos]',
      '[data-item=Tres]',
      '[data-item=Cuatro]',
      '[data-item=Cinco]'
    );

      assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
      assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
      assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
      assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');

    let itemHeight = () => {
      let item = findAll('.scrollable-demo .sortable-item')[0];
      const itemStyle = item.currentStyle || window.getComputedStyle(item);
      return item.offsetHeight + parseInt(itemStyle.marginTop);
    };

    await drag(
      'mouse',
      '.scrollable-demo .handle[data-item=Uno]',
      () => {
        // leaving undefined dx so that we test that dx is set to zero by default
        // otherwise an error will be thrown by the browser when trying to drag.
        return { dy: itemHeight() + 1, dx: undefined };
      },
      {
        dragend: function() {
          findAll('.scrollable-demo .sortable-container').scrollTop(0);
        },

        dragmove: function() {
          findAll('.scrollable-demo .sortable-container').scrollTop(itemHeight());
        }
      }
    );

      assert.equal(verticalContents(), 'Dos Tres Uno Cuatro Cinco');
      assert.equal(horizontalContents(), 'Dos Tres Uno Cuatro Cinco');
      assert.equal(tableContents(), 'Dos Tres Uno Cuatro Cinco');
      assert.equal(scrollableContents(), 'Dos Tres Uno Cuatro Cinco');

    // await reorder(
    //   'mouse',
    //   '.vertical-distance-demo li',
    //   ':contains("Tres")',
    //   ':contains("Dos")',
    //   ':contains("Uno")',
    //   ':contains("Cuatro")',
    //   ':contains("Cinco")'
    // );

    //   assert.equal(verticalContents(), 'Tres Dos Uno Cuatro Cinco');
    //   assert.equal(horizontalContents(), 'Tres Dos Uno Cuatro Cinco');
    //   assert.equal(tableContents(), 'Tres Dos Uno Cuatro Cinco');
    //   assert.equal(scrollableContents(), 'Tres Dos Uno Cuatro Cinco');
    });

  test('reordering with touch events', async function(assert) {
    assert.expect(20);

    await visit('/');

      assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
      assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
      assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
      assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');

    await reorder(
      'touch',
      '.vertical-demo .handle',
      '[data-item=Cinco]',
      '[data-item=Cuatro]',
      '[data-item=Tres]',
      '[data-item=Dos]',
      '[data-item=Uno]'
    );

      assert.equal(verticalContents(), 'Cinco Cuatro Tres Dos Uno');
      assert.equal(horizontalContents(), 'Cinco Cuatro Tres Dos Uno');
      assert.equal(tableContents(), 'Cinco Cuatro Tres Dos Uno');
      assert.equal(scrollableContents(), 'Cinco Cuatro Tres Dos Uno');

    // await reorder(
    //   'touch',
    //   '.horizontal-demo li',
    //   ':contains(Cuatro)',
    //   ':contains(Cinco)',
    //   ':contains(Dos)',
    //   ':contains(Uno)',
    //   ':contains(Tres)'
    // );

    //   assert.equal(verticalContents(), 'Cuatro Cinco Dos Uno Tres');
    //   assert.equal(horizontalContents(), 'Cuatro Cinco Dos Uno Tres');
    //   assert.equal(tableContents(), 'Cuatro Cinco Dos Uno Tres');
    //   assert.equal(scrollableContents(), 'Cuatro Cinco Dos Uno Tres');

    await reorder(
      'touch',
      '.table-demo .handle',
      '[data-item=Uno]',
      '[data-item=Dos]',
      '[data-item=Tres]',
      '[data-item=Cuatro]',
      '[data-item=Cinco]'
    );

      assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
      assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
      assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
      assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');

    // await reorder(
    //   'touch',
    //   '.vertical-distance-demo li',
    //   ':contains("Tres")',
    //   ':contains("Dos")',
    //   ':contains("Uno")',
    //   ':contains("Cuatro")',
    //   ':contains("Cinco")'
    // );

    //   assert.equal(verticalContents(), 'Tres Dos Uno Cuatro Cinco');
    //   assert.equal(horizontalContents(), 'Tres Dos Uno Cuatro Cinco');
    //   assert.equal(tableContents(), 'Tres Dos Uno Cuatro Cinco');
    //   assert.equal(scrollableContents(), 'Tres Dos Uno Cuatro Cinco');
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
      .text()
      .replace(/⇕/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^\s+/, '')
      .replace(/\s+$/, '');
  }
});
