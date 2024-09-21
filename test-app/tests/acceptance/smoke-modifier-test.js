import { module, test } from 'qunit';
import {
  visit,
  find,
  findAll,
  triggerKeyEvent,
  focus,
  blur,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import {
  drag,
  reorder,
  ENTER_KEY_CODE,
  SPACE_KEY_CODE,
  ESCAPE_KEY_CODE,
  ARROW_KEY_CODES,
} from 'ember-sortable/test-support';

module('Acceptance | smoke modifier', function (hooks) {
  setupApplicationTest(hooks);

  test('reordering with mouse events', async function (assert) {
    await visit('/');

    // when a handle is present, the element itself shall not be draggable
    assert.equal(verticalContents(), 'Zero One Two Three Four');
    assert.equal(horizontalContents(), 'Zero One Two Three Four');
    assert.equal(
      gridContents(),
      'Item 1 Item 2 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
    );
    assert.equal(
      gridDemo2Contents(),
      'Item 1 Item 2 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
    );
    assert.equal(tableContents(), 'Zero One Two Three Four');
    assert.equal(scrollableContents(), 'Zero One Two Three Four');

    let order = findAll('[data-test-vertical-demo-handle]').reverse();
    await reorder('mouse', '[data-test-vertical-demo-handle]', ...order);

    assert.equal(verticalContents(), 'Four Three Two One Zero');
    assert.equal(horizontalContents(), 'Four Three Two One Zero');
    assert.equal(
      gridContents(),
      'Item 1 Item 2 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
    );
    assert.equal(
      gridDemo2Contents(),
      'Item 1 Item 2 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
    );
    assert.equal(tableContents(), 'Four Three Two One Zero');
    assert.equal(scrollableContents(), 'Four Three Two One Zero');

    order = findAll('[data-test-vertical-demo-handle]');
    await reorder(
      'mouse',
      '[data-test-vertical-demo-handle]',
      order[4],
      order[3],
      order[2],
      order[1],
      order[0],
    );

    assert.equal(verticalContents(), 'Zero One Two Three Four');
    assert.equal(horizontalContents(), 'Zero One Two Three Four');
    assert.equal(
      gridContents(),
      'Item 1 Item 2 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
    );
    assert.equal(
      gridDemo2Contents(),
      'Item 1 Item 2 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
    );
    assert.equal(tableContents(), 'Zero One Two Three Four');
    assert.equal(scrollableContents(), 'Zero One Two Three Four');
  });

  test('reordering with mouse events horizontal', async function (assert) {
    await visit('/');

    assert.equal(verticalContents(), 'Zero One Two Three Four');
    assert.equal(horizontalContents(), 'Zero One Two Three Four');
    assert.equal(
      gridContents(),
      'Item 1 Item 2 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
    );
    assert.equal(
      gridDemo2Contents(),
      'Item 1 Item 2 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
    );
    assert.equal(tableContents(), 'Zero One Two Three Four');
    assert.equal(scrollableContents(), 'Zero One Two Three Four');

    let order = findAll('[data-test-horizontal-demo-handle]');
    await reorder(
      'mouse',
      '[data-test-horizontal-demo-handle]',
      order[1],
      order[0],
      order[2],
      order[3],
      order[4],
    );

    assert.equal(verticalContents(), 'One Zero Two Three Four');
    assert.equal(horizontalContents(), 'One Zero Two Three Four');
    assert.equal(
      gridContents(),
      'Item 1 Item 2 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
    );
    assert.equal(
      gridDemo2Contents(),
      'Item 1 Item 2 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
    );
    assert.equal(tableContents(), 'One Zero Two Three Four');
    assert.equal(scrollableContents(), 'One Zero Two Three Four');
  });

  test('reordering with mouse events grid', async function (assert) {
    await visit('/');

    // when a handle is present, the element itself shall not be draggable
    assert.equal(verticalContents(), 'Zero One Two Three Four');
    assert.equal(horizontalContents(), 'Zero One Two Three Four');
    assert.equal(
      gridContents(),
      'Item 1 Item 2 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
    );
    assert.equal(
      gridDemo2Contents(),
      'Item 1 Item 2 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
    );
    assert.equal(tableContents(), 'Zero One Two Three Four');
    assert.equal(scrollableContents(), 'Zero One Two Three Four');

    let order = findAll('[data-test-grid-demo-handle]').reverse();
    await reorder('mouse', '[data-test-grid-demo-handle]', ...order);

    assert.equal(verticalContents(), 'Zero One Two Three Four');
    assert.equal(horizontalContents(), 'Zero One Two Three Four');
    assert.equal(
      gridContents(),
      'Item 26 Item 25 Item 24 Item 23 Item 22 Item 21 Item 20 Item 19 Item 18 Item 17 Item 16 Item 15 Item 14 Item 13 Item 12 Item 11 Item 10 Item 9 Item 8 Item 7 Item 6 Item 5 Item 4 Item 3 Item 2 Item 1',
    );
    assert.equal(
      gridDemo2Contents(),
      'Item 1 Item 2 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
    );
    assert.equal(tableContents(), 'Zero One Two Three Four');
    assert.equal(scrollableContents(), 'Zero One Two Three Four');

    order = findAll('[data-test-grid-demo-handle]');
    await reorder(
      'mouse',
      '[data-test-grid-demo-handle]',
      order[4],
      order[3],
      order[2],
      order[1],
      order[0],
    );

    assert.equal(verticalContents(), 'Zero One Two Three Four');
    assert.equal(horizontalContents(), 'Zero One Two Three Four');
    assert.equal(
      gridContents(),
      'Item 22 Item 23 Item 24 Item 25 Item 26 Item 21 Item 20 Item 19 Item 18 Item 17 Item 16 Item 15 Item 14 Item 13 Item 12 Item 11 Item 10 Item 9 Item 8 Item 7 Item 6 Item 5 Item 4 Item 3 Item 2 Item 1',
    );
    assert.equal(
      gridDemo2Contents(),
      'Item 1 Item 2 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
    );
    assert.equal(tableContents(), 'Zero One Two Three Four');
    assert.equal(scrollableContents(), 'Zero One Two Three Four');
  });

  test('reordering with mouse events grid demo 2', async function (assert) {
    await visit('/');

    // when a handle is present, the element itself shall not be draggable
    assert.equal(verticalContents(), 'Zero One Two Three Four');
    assert.equal(horizontalContents(), 'Zero One Two Three Four');
    assert.equal(
      gridContents(),
      'Item 1 Item 2 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
    );
    assert.equal(
      gridDemo2Contents(),
      'Item 1 Item 2 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
    );
    assert.equal(tableContents(), 'Zero One Two Three Four');
    assert.equal(scrollableContents(), 'Zero One Two Three Four');

    let order = findAll('[data-test-grid-demo-2-handle]').reverse();
    await reorder('mouse', '[data-test-grid-demo-2-handle]', ...order);

    assert.equal(verticalContents(), 'Zero One Two Three Four');
    assert.equal(horizontalContents(), 'Zero One Two Three Four');
    assert.equal(
      gridContents(),
      'Item 1 Item 2 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
    );
    assert.equal(
      gridDemo2Contents(),
      'Item 26 Item 25 Item 24 Item 23 Item 22 Item 21 Item 20 Item 19 Item 18 Item 17 Item 16 Item 15 Item 14 Item 13 Item 12 Item 11 Item 10 Item 9 Item 8 Item 7 Item 6 Item 5 Item 4 Item 3 Item 2 Item 1',
    );
    assert.equal(tableContents(), 'Zero One Two Three Four');
    assert.equal(scrollableContents(), 'Zero One Two Three Four');

    order = findAll('[data-test-grid-demo-2-handle]');
    await reorder(
      'mouse',
      '[data-test-grid-demo-2-handle]',
      order[4],
      order[3],
      order[2],
      order[1],
      order[0],
    );

    assert.equal(verticalContents(), 'Zero One Two Three Four');
    assert.equal(horizontalContents(), 'Zero One Two Three Four');
    assert.equal(
      gridContents(),
      'Item 1 Item 2 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
    );
    assert.equal(
      gridDemo2Contents(),
      'Item 22 Item 23 Item 24 Item 25 Item 26 Item 21 Item 20 Item 19 Item 18 Item 17 Item 16 Item 15 Item 14 Item 13 Item 12 Item 11 Item 10 Item 9 Item 8 Item 7 Item 6 Item 5 Item 4 Item 3 Item 2 Item 1',
    );
    assert.equal(tableContents(), 'Zero One Two Three Four');
    assert.equal(scrollableContents(), 'Zero One Two Three Four');
  });

  test('reordering with mouse events scrollable', async function (assert) {
    await visit('/');

    let itemHeight = () => {
      let item = find('[data-test-scrollable-demo-handle]');
      const itemStyle = item.currentStyle || window.getComputedStyle(item);
      return item.offsetHeight + parseInt(itemStyle.marginTop);
    };

    await drag('mouse', '[data-test-scrollable-demo-handle] .handle', () => {
      return { dy: itemHeight() * 2 + 1, dx: undefined };
    });

    assert.equal(scrollableContents(), 'One Two Zero Three Four');

    let order = findAll('[data-test-scrollable-demo-handle] .handle');

    await reorder(
      'mouse',
      '[data-test-scrollable-demo-handle] .handle',
      order[1],
      order[0],
      order[2],
      order[3],
      order[4],
    );

    assert.equal(scrollableContents(), 'Two One Zero Three Four');
  });

  test('mouse event onChange has correct dragged item', async function (assert) {
    await visit('/');

    let order = findAll('[data-test-vertical-demo-handle]');
    await reorder('mouse', '[data-test-vertical-demo-handle]', order[1]);

    assert.equal(justDraggedContents(), 'One');
  });

  test('Test isAnimated still works without css for transitionDuration', async function (assert) {
    await visit('/');

    assert.equal(verticalContents(), 'Zero One Two Three Four');
    assert.equal(horizontalContents(), 'Zero One Two Three Four');
    assert.equal(tableContents(), 'Zero One Two Three Four');
    assert.equal(scrollableContents(), 'Zero One Two Three Four');

    let order = findAll('[data-test-vertical-demo-handle-no-css]').reverse();
    await reorder('mouse', '[data-test-vertical-demo-handle-no-css]', ...order);

    assert.equal(verticalContents(), 'Four Three Two One Zero');
    assert.equal(horizontalContents(), 'Four Three Two One Zero');
    assert.equal(tableContents(), 'Four Three Two One Zero');
    assert.equal(scrollableContents(), 'Four Three Two One Zero');
  });

  test('reordering with touch events', async function (assert) {
    await visit('/');

    assert.equal(verticalContents(), 'Zero One Two Three Four');
    assert.equal(horizontalContents(), 'Zero One Two Three Four');
    assert.equal(tableContents(), 'Zero One Two Three Four');
    assert.equal(scrollableContents(), 'Zero One Two Three Four');

    let order = findAll('[data-test-vertical-demo-handle]').reverse();
    await reorder('touch', '[data-test-vertical-demo-handle]', ...order);

    assert.equal(verticalContents(), 'Four Three Two One Zero');
    assert.equal(horizontalContents(), 'Four Three Two One Zero');
    assert.equal(tableContents(), 'Four Three Two One Zero');
    assert.equal(scrollableContents(), 'Four Three Two One Zero');

    order = findAll('[data-test-vertical-demo-handle]');

    await reorder(
      'touch',
      '[data-test-vertical-demo-handle]',
      order[4],
      order[3],
      order[2],
      order[1],
      order[0],
    );

    assert.equal(verticalContents(), 'Zero One Two Three Four');
    assert.equal(horizontalContents(), 'Zero One Two Three Four');
    assert.equal(tableContents(), 'Zero One Two Three Four');
    assert.equal(scrollableContents(), 'Zero One Two Three Four');
  });

  test('reordering with touch events grid', async function (assert) {
    await visit('/');

    assert.equal(
      gridContents(),
      'Item 1 Item 2 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
    );

    let order = findAll('[data-test-grid-demo-handle]').reverse();
    await reorder('touch', '[data-test-grid-demo-handle]', ...order);

    assert.equal(
      gridContents(),
      'Item 26 Item 25 Item 24 Item 23 Item 22 Item 21 Item 20 Item 19 Item 18 Item 17 Item 16 Item 15 Item 14 Item 13 Item 12 Item 11 Item 10 Item 9 Item 8 Item 7 Item 6 Item 5 Item 4 Item 3 Item 2 Item 1',
    );

    order = findAll('[data-test-grid-demo-handle]');

    await reorder(
      'touch',
      '[data-test-grid-demo-handle]',
      order[4],
      order[3],
      order[2],
      order[1],
      order[0],
    );

    assert.equal(
      gridContents(),
      'Item 22 Item 23 Item 24 Item 25 Item 26 Item 21 Item 20 Item 19 Item 18 Item 17 Item 16 Item 15 Item 14 Item 13 Item 12 Item 11 Item 10 Item 9 Item 8 Item 7 Item 6 Item 5 Item 4 Item 3 Item 2 Item 1',
    );
  });

  test('reordering with touch events grid demo 2', async function (assert) {
    await visit('/');

    assert.equal(
      gridDemo2Contents(),
      'Item 1 Item 2 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
    );

    let order = findAll('[data-test-grid-demo-2-handle]').reverse();
    await reorder('touch', '[data-test-grid-demo-2-handle]', ...order);

    assert.equal(
      gridDemo2Contents(),
      'Item 26 Item 25 Item 24 Item 23 Item 22 Item 21 Item 20 Item 19 Item 18 Item 17 Item 16 Item 15 Item 14 Item 13 Item 12 Item 11 Item 10 Item 9 Item 8 Item 7 Item 6 Item 5 Item 4 Item 3 Item 2 Item 1',
    );

    order = findAll('[data-test-grid-demo-2-handle]');

    await reorder(
      'touch',
      '[data-test-grid-demo-2-handle]',
      order[4],
      order[3],
      order[2],
      order[1],
      order[0],
    );

    assert.equal(
      gridDemo2Contents(),
      'Item 22 Item 23 Item 24 Item 25 Item 26 Item 21 Item 20 Item 19 Item 18 Item 17 Item 16 Item 15 Item 14 Item 13 Item 12 Item 11 Item 10 Item 9 Item 8 Item 7 Item 6 Item 5 Item 4 Item 3 Item 2 Item 1',
    );
  });

  test('reordering with touch events scrollable', async function (assert) {
    await visit('/');

    assert.equal(verticalContents(), 'Zero One Two Three Four');
    assert.equal(horizontalContents(), 'Zero One Two Three Four');
    assert.equal(tableContents(), 'Zero One Two Three Four');
    assert.equal(scrollableContents(), 'Zero One Two Three Four');

    let order = findAll('[data-test-scrollable-demo-handle] .handle').reverse();
    await reorder(
      'touch',
      '[data-test-scrollable-demo-handle] .handle',
      ...order,
    );

    assert.equal(verticalContents(), 'Four Three Two One Zero');
    assert.equal(horizontalContents(), 'Four Three Two One Zero');
    assert.equal(tableContents(), 'Four Three Two One Zero');
    assert.equal(scrollableContents(), 'Four Three Two One Zero');

    order = findAll('[data-test-scrollable-demo-handle] .handle');

    await reorder(
      'touch',
      '[data-test-scrollable-demo-handle] .handle',
      order[4],
      order[3],
      order[2],
      order[1],
      order[0],
    );

    assert.equal(verticalContents(), 'Zero One Two Three Four');
    assert.equal(horizontalContents(), 'Zero One Two Three Four');
    assert.equal(tableContents(), 'Zero One Two Three Four');
    assert.equal(scrollableContents(), 'Zero One Two Three Four');
  });

  test('Touch event onChange has correct dragged item', async function (assert) {
    await visit('/');

    let order = findAll('[data-test-vertical-demo-handle]');
    await reorder('touch', '[data-test-vertical-demo-handle]', order[1]);

    assert.equal(justDraggedContents(), 'One');

    order = findAll('[data-test-grid-demo-handle]');
    await reorder('touch', '[data-test-grid-demo-handle]', order[1]);

    assert.equal(justDraggedContents(), 'Item 2');
  });

  module('Reordering with keyboard events', function () {
    test('Keyboard selection shows UP and DOWN visual indicators on vertical sort', async function (assert) {
      assert.expect(8);

      await visit('/');

      const handle = find('[data-test-vertical-demo-handle]');
      await focus(handle);
      await triggerKeyEvent(
        '[data-test-vertical-demo-handle]',
        'keydown',
        SPACE_KEY_CODE,
      );
      assert
        .dom('[data-test-vertical-demo-item]')
        .hasClass('sortable-item--active');
      assert.dom(handle).doesNotHaveClass('sortable-handle-up');
      assert.dom(handle).hasClass('sortable-handle-down');

      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ARROW_KEY_CODES.DOWN,
      );
      assert.dom(handle).hasClass('sortable-handle-up');
      assert.dom(handle).hasClass('sortable-handle-down');

      await blur('[data-test-vertical-demo-group]');
      assert
        .dom('[data-test-vertical-demo-item]')
        .doesNotHaveClass('sortable-item--active');
      assert.dom(handle).doesNotHaveClass('sortable-handle-up');
      assert.dom(handle).doesNotHaveClass('sortable-handle-down');
    });

    test('Keyboard selection shows LEFT and RIGHT visual indicators on horizontal sort', async function (assert) {
      assert.expect(8);

      await visit('/');

      const handle = find('[data-test-horizontal-demo-handle]');
      await focus(handle);
      await triggerKeyEvent(
        '[data-test-horizontal-demo-handle]',
        'keydown',
        SPACE_KEY_CODE,
      );
      assert.dom(handle).hasClass('sortable-item--active');
      assert.dom(handle).doesNotHaveClass('sortable-handle-left');
      assert.dom(handle).hasClass('sortable-handle-right');

      await triggerKeyEvent(
        '[data-test-horizontal-demo-group]',
        'keydown',
        ARROW_KEY_CODES.RIGHT,
      );
      assert.dom(handle).hasClass('sortable-handle-left');
      assert.dom(handle).hasClass('sortable-handle-right');

      await blur('[data-test-horizontal-demo-group]');
      assert.dom(handle).doesNotHaveClass('sortable-item--active');
      assert.dom(handle).doesNotHaveClass('sortable-handle-left');
      assert.dom(handle).doesNotHaveClass('sortable-handle-right');
    });

    test('Keyboard selection shows LEFT and RIGHT visual indicators on grid sort', async function (assert) {
      assert.expect(8);

      await visit('/');

      const handle = find('[data-test-grid-demo-handle]');
      await focus(handle);
      await triggerKeyEvent(
        '[data-test-grid-demo-handle]',
        'keydown',
        SPACE_KEY_CODE,
      );
      assert.dom(handle).hasClass('sortable-item--active');
      assert.dom(handle).doesNotHaveClass('sortable-handle-left');
      assert.dom(handle).hasClass('sortable-handle-right');

      await triggerKeyEvent(
        '[data-test-grid-demo-group]',
        'keydown',
        ARROW_KEY_CODES.RIGHT,
      );
      assert.dom(handle).hasClass('sortable-handle-left');
      assert.dom(handle).hasClass('sortable-handle-right');

      await blur('[data-test-grid-demo-group]');
      assert.dom(handle).doesNotHaveClass('sortable-item--active');
      assert.dom(handle).doesNotHaveClass('sortable-handle-left');
      assert.dom(handle).doesNotHaveClass('sortable-handle-right');
    });

    test('Keyboard selection shows LEFT and RIGHT visual indicators on grid demo 2 sort', async function (assert) {
      assert.expect(8);

      await visit('/');

      const handle = find('[data-test-grid-demo-2-handle]');
      await focus(handle);
      await triggerKeyEvent(
        '[data-test-grid-demo-2-handle]',
        'keydown',
        SPACE_KEY_CODE,
      );
      assert.dom(handle).hasClass('sortable-item--active');
      assert.dom(handle).doesNotHaveClass('sortable-handle-left');
      assert.dom(handle).hasClass('sortable-handle-right');

      await triggerKeyEvent(
        '[data-test-grid-demo-2-group]',
        'keydown',
        ARROW_KEY_CODES.RIGHT,
      );
      assert.dom(handle).hasClass('sortable-handle-left');
      assert.dom(handle).hasClass('sortable-handle-right');

      await blur('[data-test-grid-demo-2-group]');
      assert.dom(handle).doesNotHaveClass('sortable-item--active');
      assert.dom(handle).doesNotHaveClass('sortable-handle-left');
      assert.dom(handle).doesNotHaveClass('sortable-handle-right');
    });

    test('Keyboard selection is activated on ENTER', async function (assert) {
      assert.expect(3);

      await visit('/');
      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent(
        '[data-test-vertical-demo-handle]',
        'keydown',
        ENTER_KEY_CODE,
      );

      assert
        .dom('[data-test-vertical-demo-group]')
        .hasAttribute('role', 'application');
      assert
        .dom('[data-test-vertical-demo-group]')
        .hasAttribute('tabindex', '-1');
      assert.dom('[data-test-vertical-demo-group]').isFocused();
    });

    test('Keyboard selection is activated on SPACE', async function (assert) {
      assert.expect(3);

      await visit('/');
      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent(
        '[data-test-vertical-demo-handle]',
        'keydown',
        SPACE_KEY_CODE,
      );

      assert
        .dom('[data-test-vertical-demo-group]')
        .hasAttribute('role', 'application');
      assert
        .dom('[data-test-vertical-demo-group]')
        .hasAttribute('tabindex', '-1');
      assert.dom('[data-test-vertical-demo-group]').isFocused();
    });

    test('Keyboard selection is cancelled on ESC', async function (assert) {
      assert.expect(3);
      await visit('/');

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent(
        '[data-test-vertical-demo-handle]',
        'keydown',
        ENTER_KEY_CODE,
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ESCAPE_KEY_CODE,
      );

      assert.dom('[data-test-vertical-demo-group]').hasNoAttribute('role');
      assert.dom('[data-test-vertical-demo-group]').hasNoAttribute('tabindex');
      assert.dom('[data-test-vertical-demo-group]').isNotFocused();
    });

    test('Keyboard selection is cancelled on losing focus', async function (assert) {
      assert.expect(3);

      await visit('/');

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent(
        '[data-test-vertical-demo-handle]',
        'keydown',
        ENTER_KEY_CODE,
      );

      await blur('[data-test-vertical-demo-group]');

      assert.dom('[data-test-vertical-demo-group]').hasNoAttribute('role');
      assert.dom('[data-test-vertical-demo-group]').hasNoAttribute('tabindex');
      assert.dom('[data-test-vertical-demo-group]').isNotFocused();
    });

    test('Keyboard selection moves down on DOWN and is cancelled on ESC', async function (assert) {
      assert.expect(5);

      await visit('/');

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent(
        '[data-test-vertical-demo-handle]',
        'keydown',
        SPACE_KEY_CODE,
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ARROW_KEY_CODES.DOWN,
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ESCAPE_KEY_CODE,
      );

      const movedHandle = findAll('[data-test-vertical-demo-handle]')[0];

      assert.dom(movedHandle).isFocused();
      assert.equal(verticalContents(), 'Zero One Two Three Four');
      assert.equal(horizontalContents(), 'Zero One Two Three Four');
      assert.equal(tableContents(), 'Zero One Two Three Four');
      assert.equal(scrollableContents(), 'Zero One Two Three Four');
    });

    test('Keyboard selection moves down on DOWN and is cancelled on losing focus', async function (assert) {
      assert.expect(5);

      await visit('/');

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent(
        '[data-test-vertical-demo-handle]',
        'keydown',
        SPACE_KEY_CODE,
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ARROW_KEY_CODES.DOWN,
      );

      await blur('[data-test-vertical-demo-group]');

      const movedHandle = findAll('[data-test-vertical-demo-handle]')[0];

      assert.dom(movedHandle).isNotFocused();
      assert.equal(verticalContents(), 'Zero One Two Three Four');
      assert.equal(horizontalContents(), 'Zero One Two Three Four');
      assert.equal(tableContents(), 'Zero One Two Three Four');
      assert.equal(scrollableContents(), 'Zero One Two Three Four');
    });

    test('Keyboard selection is confirmed on ENTER', async function (assert) {
      assert.expect(5);

      await visit('/');

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent(
        '[data-test-vertical-demo-handle]',
        'keydown',
        ENTER_KEY_CODE,
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ARROW_KEY_CODES.DOWN,
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ENTER_KEY_CODE,
      );

      const movedHandle = findAll('[data-test-vertical-demo-handle]')[1];

      assert.dom(movedHandle).isFocused();
      assert.equal(verticalContents(), 'One Zero Two Three Four');
      assert.equal(horizontalContents(), 'One Zero Two Three Four');
      assert.equal(tableContents(), 'One Zero Two Three Four');
      assert.equal(scrollableContents(), 'One Zero Two Three Four');
    });

    test('Keyboard selection moves up on UP and is confirmed on SPACE', async function (assert) {
      assert.expect(5);

      await visit('/');

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent(
        '[data-test-vertical-demo-handle]',
        'keydown',
        SPACE_KEY_CODE,
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ARROW_KEY_CODES.DOWN,
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ARROW_KEY_CODES.DOWN,
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ARROW_KEY_CODES.UP,
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        SPACE_KEY_CODE,
      );

      const movedHandle = findAll('[data-test-vertical-demo-handle]')[1];

      assert.dom(movedHandle).isFocused();
      assert.equal(verticalContents(), 'One Zero Two Three Four');
      assert.equal(horizontalContents(), 'One Zero Two Three Four');
      assert.equal(tableContents(), 'One Zero Two Three Four');
      assert.equal(scrollableContents(), 'One Zero Two Three Four');
    });

    test('Keyboard selection moves down on DOWN and is confirmed on SPACE', async function (assert) {
      assert.expect(5);

      await visit('/');

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent(
        '[data-test-vertical-demo-handle]',
        'keydown',
        SPACE_KEY_CODE,
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ARROW_KEY_CODES.DOWN,
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        SPACE_KEY_CODE,
      );

      const movedHandle = findAll('[data-test-vertical-demo-handle]')[1];

      assert.dom(movedHandle).isFocused();
      assert.equal(verticalContents(), 'One Zero Two Three Four');
      assert.equal(horizontalContents(), 'One Zero Two Three Four');
      assert.equal(tableContents(), 'One Zero Two Three Four');
      assert.equal(scrollableContents(), 'One Zero Two Three Four');
    });

    test('Keyboard selection moves right on RIGHT and is confirmed on ENTER', async function (assert) {
      assert.expect(5);

      await visit('/');

      await focus('[data-test-horizontal-demo-handle]');
      await triggerKeyEvent(
        '[data-test-horizontal-demo-handle]',
        'keydown',
        ENTER_KEY_CODE,
      );
      await triggerKeyEvent(
        '[data-test-horizontal-demo-group]',
        'keydown',
        ARROW_KEY_CODES.RIGHT,
      );
      await triggerKeyEvent(
        '[data-test-horizontal-demo-group]',
        'keydown',
        ENTER_KEY_CODE,
      );

      const movedHandle = findAll('[data-test-horizontal-demo-handle]')[1];

      assert.dom(movedHandle).isFocused();
      assert.equal(verticalContents(), 'One Zero Two Three Four');
      assert.equal(horizontalContents(), 'One Zero Two Three Four');
      assert.equal(tableContents(), 'One Zero Two Three Four');
      assert.equal(scrollableContents(), 'One Zero Two Three Four');
    });

    test('Keyboard selection moves left on LEFT and is confirmed on ENTER', async function (assert) {
      assert.expect(5);

      await visit('/');

      await focus('[data-test-horizontal-demo-handle]');
      await triggerKeyEvent(
        '[data-test-horizontal-demo-handle]',
        'keydown',
        ENTER_KEY_CODE,
      );
      await triggerKeyEvent(
        '[data-test-horizontal-demo-group]',
        'keydown',
        ARROW_KEY_CODES.RIGHT,
      );
      await triggerKeyEvent(
        '[data-test-horizontal-demo-group]',
        'keydown',
        ARROW_KEY_CODES.RIGHT,
      );
      await triggerKeyEvent(
        '[data-test-horizontal-demo-group]',
        'keydown',
        ARROW_KEY_CODES.LEFT,
      );
      await triggerKeyEvent(
        '[data-test-horizontal-demo-group]',
        'keydown',
        ENTER_KEY_CODE,
      );

      const movedHandle = findAll('[data-test-horizontal-demo-handle]')[1];

      assert.dom(movedHandle).isFocused();
      assert.equal(verticalContents(), 'One Zero Two Three Four');
      assert.equal(horizontalContents(), 'One Zero Two Three Four');
      assert.equal(tableContents(), 'One Zero Two Three Four');
      assert.equal(scrollableContents(), 'One Zero Two Three Four');
    });

    test('Keyboard selection moves right on RIGHT and is confirmed on ENTER in grid', async function (assert) {
      assert.expect(2);

      await visit('/');

      await focus('[data-test-grid-demo-handle]');
      await triggerKeyEvent(
        '[data-test-grid-demo-handle]',
        'keydown',
        ENTER_KEY_CODE,
      );
      await triggerKeyEvent(
        '[data-test-grid-demo-group]',
        'keydown',
        ARROW_KEY_CODES.RIGHT,
      );
      await triggerKeyEvent(
        '[data-test-grid-demo-group]',
        'keydown',
        ENTER_KEY_CODE,
      );

      const movedHandle = findAll('[data-test-grid-demo-handle]')[1];

      assert.dom(movedHandle).isFocused();
      assert.equal(
        gridContents(),
        'Item 2 Item 1 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
      );
    });

    test('Keyboard selection moves right on RIGHT and is confirmed on ENTER in grid demo 2', async function (assert) {
      assert.expect(2);

      await visit('/');

      await focus('[data-test-grid-demo-2-handle]');
      await triggerKeyEvent(
        '[data-test-grid-demo-2-handle]',
        'keydown',
        ENTER_KEY_CODE,
      );
      await triggerKeyEvent(
        '[data-test-grid-demo-2-group]',
        'keydown',
        ARROW_KEY_CODES.RIGHT,
      );
      await triggerKeyEvent(
        '[data-test-grid-demo-2-group]',
        'keydown',
        ENTER_KEY_CODE,
      );

      const movedHandle = findAll('[data-test-grid-demo-2-handle]')[1];

      assert.dom(movedHandle).isFocused();
      assert.equal(
        gridDemo2Contents(),
        'Item 2 Item 1 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
      );
    });

    test('Keyboard selection moves left on LEFT and is confirmed on ENTER in grid', async function (assert) {
      assert.expect(2);

      await visit('/');

      await focus('[data-test-grid-demo-handle]');
      await triggerKeyEvent(
        '[data-test-grid-demo-handle]',
        'keydown',
        ENTER_KEY_CODE,
      );
      await triggerKeyEvent(
        '[data-test-grid-demo-group]',
        'keydown',
        ARROW_KEY_CODES.RIGHT,
      );
      await triggerKeyEvent(
        '[data-test-grid-demo-group]',
        'keydown',
        ARROW_KEY_CODES.RIGHT,
      );
      await triggerKeyEvent(
        '[data-test-grid-demo-group]',
        'keydown',
        ARROW_KEY_CODES.LEFT,
      );
      await triggerKeyEvent(
        '[data-test-grid-demo-group]',
        'keydown',
        ENTER_KEY_CODE,
      );

      const movedHandle = findAll('[data-test-grid-demo-handle]')[1];

      assert.dom(movedHandle).isFocused();
      assert.equal(
        gridContents(),
        'Item 2 Item 1 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
      );
    });

    test('Keyboard selection moves left on LEFT and is confirmed on ENTER in grid demo 2', async function (assert) {
      assert.expect(2);

      await visit('/');

      await focus('[data-test-grid-demo-2-handle]');
      await triggerKeyEvent(
        '[data-test-grid-demo-2-handle]',
        'keydown',
        ENTER_KEY_CODE,
      );
      await triggerKeyEvent(
        '[data-test-grid-demo-2-group]',
        'keydown',
        ARROW_KEY_CODES.RIGHT,
      );
      await triggerKeyEvent(
        '[data-test-grid-demo-2-group]',
        'keydown',
        ARROW_KEY_CODES.RIGHT,
      );
      await triggerKeyEvent(
        '[data-test-grid-demo-2-group]',
        'keydown',
        ARROW_KEY_CODES.LEFT,
      );
      await triggerKeyEvent(
        '[data-test-grid-demo-2-group]',
        'keydown',
        ENTER_KEY_CODE,
      );

      const movedHandle = findAll('[data-test-grid-demo-2-handle]')[1];

      assert.dom(movedHandle).isFocused();
      assert.equal(
        gridDemo2Contents(),
        'Item 2 Item 1 Item 3 Item 4 Item 5 Item 6 Item 7 Item 8 Item 9 Item 10 Item 11 Item 12 Item 13 Item 14 Item 15 Item 16 Item 17 Item 18 Item 19 Item 20 Item 21 Item 22 Item 23 Item 24 Item 25 Item 26',
      );
    });

    test('Keyboard event onChange has correct dragged item', async function (assert) {
      await visit('/');

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent(
        '[data-test-vertical-demo-handle]',
        'keydown',
        ENTER_KEY_CODE,
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ARROW_KEY_CODES.DOWN,
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ENTER_KEY_CODE,
      );

      assert.equal(justDraggedContents(), 'Zero');

      assert.equal(
        tableConditionalCellContents(),
        'avocado banana cashew watermelon durian apple lemon ',
      );
      await focus('[data-test-table-conditional-cell-handle]');

      await triggerKeyEvent(
        '[data-test-table-conditional-cell-handle]',
        'keydown',
        ENTER_KEY_CODE,
      );
      await triggerKeyEvent(
        '[data-test-table-conditional-cell-demo-group]',
        'keydown',
        ARROW_KEY_CODES.DOWN,
      );
      await triggerKeyEvent(
        '[data-test-table-conditional-cell-demo-group]',
        'keydown',
        ENTER_KEY_CODE,
      );

      assert.equal(
        tableConditionalCellContents(),
        'banana avocado cashew watermelon durian apple lemon ',
      );
    });

    test('Keyboard selection works multiple times for conditionally rendered sort-handle', async function (assert) {
      await visit('/');

      assert.equal(
        tableConditionalCellContents(),
        'avocado banana cashew watermelon durian apple lemon ',
      );

      await focus('[data-test-table-conditional-cell-handle]');

      await triggerKeyEvent(
        '[data-test-table-conditional-cell-handle]',
        'keydown',
        ENTER_KEY_CODE,
      );
      await triggerKeyEvent(
        '[data-test-table-conditional-cell-demo-group]',
        'keydown',
        ARROW_KEY_CODES.DOWN,
      );
      await triggerKeyEvent(
        '[data-test-table-conditional-cell-demo-group]',
        'keydown',
        ENTER_KEY_CODE,
      );

      assert.equal(
        tableConditionalCellContents(),
        'banana avocado cashew watermelon durian apple lemon ',
      );

      const moveHandle = findAll(
        '[data-test-table-conditional-cell-handle]',
      )[4];
      await focus(moveHandle);

      await triggerKeyEvent(moveHandle, 'keydown', ENTER_KEY_CODE);
      await triggerKeyEvent(
        '[data-test-table-conditional-cell-demo-group]',
        'keydown',
        ARROW_KEY_CODES.UP,
      );
      await triggerKeyEvent(
        '[data-test-table-conditional-cell-demo-group]',
        'keydown',
        ARROW_KEY_CODES.UP,
      );
      await triggerKeyEvent(
        '[data-test-table-conditional-cell-demo-group]',
        'keydown',
        ENTER_KEY_CODE,
      );

      assert.equal(
        tableConditionalCellContents(),
        'banana avocado durian cashew watermelon apple lemon ',
      );

      const moveHandle1 = findAll(
        '[data-test-table-conditional-cell-handle]',
      )[0];
      await focus(moveHandle1);

      await triggerKeyEvent(moveHandle1, 'keydown', ENTER_KEY_CODE);
      await triggerKeyEvent(
        '[data-test-table-conditional-cell-demo-group]',
        'keydown',
        ARROW_KEY_CODES.DOWN,
      );
      await triggerKeyEvent(
        '[data-test-table-conditional-cell-demo-group]',
        'keydown',
        ARROW_KEY_CODES.DOWN,
      );
      await triggerKeyEvent(
        '[data-test-table-conditional-cell-demo-group]',
        'keydown',
        ARROW_KEY_CODES.DOWN,
      );
      await triggerKeyEvent(
        '[data-test-table-conditional-cell-demo-group]',
        'keydown',
        ARROW_KEY_CODES.DOWN,
      );
      await triggerKeyEvent(
        '[data-test-table-conditional-cell-demo-group]',
        'keydown',
        ENTER_KEY_CODE,
      );

      assert.equal(
        tableConditionalCellContents(),
        'avocado durian cashew watermelon banana apple lemon ',
      );
    });
  });

  function verticalContents() {
    return contents('.vertical-demo ol');
  }

  function horizontalContents() {
    return contents('.horizontal-demo ol');
  }

  function gridContents() {
    return contents('.grid-demo [data-test-grid-demo-group]');
  }

  function gridDemo2Contents() {
    return contents('.grid-demo-2 [data-test-grid-demo-2-group]');
  }

  function tableContents() {
    return contents('.table-demo tbody');
  }

  function scrollableContents() {
    return contents('.scrollable-demo ol');
  }

  function justDraggedContents() {
    return contents('[data-test-just-dragged]');
  }

  function contents(selector) {
    return find(selector)
      .textContent.replace(/⇕/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^\s+/, '')
      .replace(/\s+$/, '');
  }

  function tableConditionalCellContents() {
    const elements = findAll('[data-test-fruits]');
    let result = '';

    for (const index in elements) {
      const element = elements[index];
      if (element.textContent) {
        result += element.textContent
          .replace(/⇕/g, '')
          .replace(/\s+/g, ' ')
          .replace(/^\s+/, '')
          .replace(/\s+$/, '');
        result += ' ';
      }
    }
    return result;
  }
});
