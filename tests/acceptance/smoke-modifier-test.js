import { module, test } from 'qunit';
import { visit, find, findAll, triggerKeyEvent, focus, blur } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { drag, reorder } from 'ember-sortable/test-support/helpers';
import {
  ENTER_KEY_CODE,
  SPACE_KEY_CODE,
  ESCAPE_KEY_CODE,
  ARROW_KEY_CODES,
} from 'ember-sortable/test-support/utils/keyboard';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Acceptance | smoke modifier', function (hooks) {
  setupApplicationTest(hooks);

  test('reordering with mouse events', async function (assert) {
    await visit('/');

    // when a handle is present, the element itself shall not be draggable
    assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');

    let order = findAll('[data-test-vertical-demo-handle]').reverse();
    await reorder('mouse', '[data-test-vertical-demo-handle]', ...order);

    assert.equal(verticalContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(horizontalContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(tableContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(scrollableContents(), 'Cinco Cuatro Tres Dos Uno');

    order = findAll('[data-test-vertical-demo-handle]');
    await reorder('mouse', '[data-test-vertical-demo-handle]', order[4], order[3], order[2], order[1], order[0]);

    assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');
  });

  test('reordering with mouse events horizontal', async function (assert) {
    await visit('/');

    assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');

    let order = findAll('[data-test-horizontal-demo-handle]');
    await reorder('mouse', '[data-test-horizontal-demo-handle]', order[1], order[0], order[2], order[3], order[4]);

    assert.equal(verticalContents(), 'Dos Uno Tres Cuatro Cinco');
    assert.equal(horizontalContents(), 'Dos Uno Tres Cuatro Cinco');
    assert.equal(tableContents(), 'Dos Uno Tres Cuatro Cinco');
    assert.equal(scrollableContents(), 'Dos Uno Tres Cuatro Cinco');
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

    assert.equal(scrollableContents(), 'Dos Tres Uno Cuatro Cinco');

    let order = findAll('[data-test-scrollable-demo-handle] .handle');

    await reorder(
      'mouse',
      '[data-test-scrollable-demo-handle] .handle',
      order[1],
      order[0],
      order[2],
      order[3],
      order[4]
    );

    assert.equal(scrollableContents(), 'Tres Dos Uno Cuatro Cinco');
  });

  test('mouse event onChange has correct dragged item', async function (assert) {
    await visit('/');

    let order = findAll('[data-test-vertical-demo-handle]');
    await reorder('mouse', '[data-test-vertical-demo-handle]', order[1]);

    assert.equal(justDraggedContents(), 'Dos');
  });

  test('Test isAnimated still works without css for transitionDuration', async function (assert) {
    await visit('/');

    assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');

    let order = findAll('[data-test-vertical-demo-handle-no-css]').reverse();
    await reorder('mouse', '[data-test-vertical-demo-handle-no-css]', ...order);

    assert.equal(verticalContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(horizontalContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(tableContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(scrollableContents(), 'Cinco Cuatro Tres Dos Uno');
  });

  test('reordering with touch events', async function (assert) {
    await visit('/');

    assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');

    let order = findAll('[data-test-vertical-demo-handle]').reverse();
    await reorder('touch', '[data-test-vertical-demo-handle]', ...order);

    assert.equal(verticalContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(horizontalContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(tableContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(scrollableContents(), 'Cinco Cuatro Tres Dos Uno');

    order = findAll('[data-test-vertical-demo-handle]');

    await reorder('touch', '[data-test-vertical-demo-handle]', order[4], order[3], order[2], order[1], order[0]);

    assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');
  });

  test('reordering with touch events scrollable', async function (assert) {
    await visit('/');

    assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');

    let order = findAll('[data-test-scrollable-demo-handle] .handle').reverse();
    await reorder('touch', '[data-test-scrollable-demo-handle] .handle', ...order);

    assert.equal(verticalContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(horizontalContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(tableContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(scrollableContents(), 'Cinco Cuatro Tres Dos Uno');

    order = findAll('[data-test-scrollable-demo-handle] .handle');

    await reorder(
      'touch',
      '[data-test-scrollable-demo-handle] .handle',
      order[4],
      order[3],
      order[2],
      order[1],
      order[0]
    );

    assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');
  });

  test('Touch event onChange has correct dragged item', async function (assert) {
    await visit('/');

    let order = findAll('[data-test-vertical-demo-handle]');
    await reorder('touch', '[data-test-vertical-demo-handle]', order[1]);

    assert.equal(justDraggedContents(), 'Dos');
  });

  module('[A11y] Reordering with keyboard events', function () {
    test('A11yAudit', async function (assert) {
      assert.expect(1);

      await visit('/');
      await a11yAudit();
      assert.ok(true, 'no a11y errors found!');
    });

    test('Keyboard selection shows UP and DOWN visual indicators on vertical sort', async function (assert) {
      assert.expect(8);

      await visit('/');

      const handle = find('[data-test-vertical-demo-handle]');
      await focus(handle);
      await triggerKeyEvent('[data-test-vertical-demo-handle]', 'keydown', SPACE_KEY_CODE);
      assert.dom('[data-test-vertical-demo-item]').hasClass('sortable-item--active');
      assert.dom(handle).doesNotHaveClass('sortable-handle-up');
      assert.dom(handle).hasClass('sortable-handle-down');

      await triggerKeyEvent('[data-test-vertical-demo-group]', 'keydown', ARROW_KEY_CODES.DOWN);
      assert.dom(handle).hasClass('sortable-handle-up');
      assert.dom(handle).hasClass('sortable-handle-down');

      await blur('[data-test-vertical-demo-group]');
      assert.dom('[data-test-vertical-demo-item]').doesNotHaveClass('sortable-item--active');
      assert.dom(handle).doesNotHaveClass('sortable-handle-up');
      assert.dom(handle).doesNotHaveClass('sortable-handle-down');
    });

    test('Keyboard selection shows LEFT and RIGHT visual indicators on horizontal sort', async function (assert) {
      assert.expect(8);

      await visit('/');

      const handle = find('[data-test-horizontal-demo-handle]');
      await focus(handle);
      await triggerKeyEvent('[data-test-horizontal-demo-handle]', 'keydown', SPACE_KEY_CODE);
      assert.dom(handle).hasClass('sortable-item--active');
      assert.dom(handle).doesNotHaveClass('sortable-handle-left');
      assert.dom(handle).hasClass('sortable-handle-right');

      await triggerKeyEvent('[data-test-horizontal-demo-group]', 'keydown', ARROW_KEY_CODES.RIGHT);
      assert.dom(handle).hasClass('sortable-handle-left');
      assert.dom(handle).hasClass('sortable-handle-right');

      await blur('[data-test-horizontal-demo-group]');
      assert.dom(handle).doesNotHaveClass('sortable-item--active');
      assert.dom(handle).doesNotHaveClass('sortable-handle-left');
      assert.dom(handle).doesNotHaveClass('sortable-handle-right');
    });

    test('Keyboard selection is activated on ENTER', async function (assert) {
      assert.expect(3);

      await visit('/');
      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent('[data-test-vertical-demo-handle]', 'keydown', ENTER_KEY_CODE);

      assert.dom('[data-test-vertical-demo-group]').hasAttribute('role', 'application');
      assert.dom('[data-test-vertical-demo-group]').hasAttribute('tabindex', '-1');
      assert.dom('[data-test-vertical-demo-group]').isFocused();
    });

    test('Keyboard selection is activated on SPACE', async function (assert) {
      assert.expect(3);

      await visit('/');
      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent('[data-test-vertical-demo-handle]', 'keydown', SPACE_KEY_CODE);

      assert.dom('[data-test-vertical-demo-group]').hasAttribute('role', 'application');
      assert.dom('[data-test-vertical-demo-group]').hasAttribute('tabindex', '-1');
      assert.dom('[data-test-vertical-demo-group]').isFocused();
    });

    test('Keyboard selection is cancelled on ESC', async function (assert) {
      assert.expect(3);
      await visit('/');

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent('[data-test-vertical-demo-handle]', 'keydown', ENTER_KEY_CODE);
      await triggerKeyEvent('[data-test-vertical-demo-group]', 'keydown', ESCAPE_KEY_CODE);

      assert.dom('[data-test-vertical-demo-group]').hasNoAttribute('role');
      assert.dom('[data-test-vertical-demo-group]').hasNoAttribute('tabindex');
      assert.dom('[data-test-vertical-demo-group]').isNotFocused();
    });

    test('Keyboard selection is cancelled on losing focus', async function (assert) {
      assert.expect(3);

      await visit('/');

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent('[data-test-vertical-demo-handle]', 'keydown', ENTER_KEY_CODE);

      await blur('[data-test-vertical-demo-group]');

      assert.dom('[data-test-vertical-demo-group]').hasNoAttribute('role');
      assert.dom('[data-test-vertical-demo-group]').hasNoAttribute('tabindex');
      assert.dom('[data-test-vertical-demo-group]').isNotFocused();
    });

    test('Keyboard selection moves down on DOWN and is cancelled on ESC', async function (assert) {
      assert.expect(5);

      await visit('/');

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent('[data-test-vertical-demo-handle]', 'keydown', SPACE_KEY_CODE);
      await triggerKeyEvent('[data-test-vertical-demo-group]', 'keydown', ARROW_KEY_CODES.DOWN);
      await triggerKeyEvent('[data-test-vertical-demo-group]', 'keydown', ESCAPE_KEY_CODE);

      const movedHandle = findAll('[data-test-vertical-demo-handle]')[0];

      assert.dom(movedHandle).isFocused();
      assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
      assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
      assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
      assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');
    });

    test('Keyboard selection moves down on DOWN and is cancelled on losing focus', async function (assert) {
      assert.expect(5);

      await visit('/');

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent('[data-test-vertical-demo-handle]', 'keydown', SPACE_KEY_CODE);
      await triggerKeyEvent('[data-test-vertical-demo-group]', 'keydown', ARROW_KEY_CODES.DOWN);

      await blur('[data-test-vertical-demo-group]');

      const movedHandle = findAll('[data-test-vertical-demo-handle]')[0];

      assert.dom(movedHandle).isNotFocused();
      assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
      assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
      assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
      assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');
    });

    test('Keyboard selection is confirmed on ENTER', async function (assert) {
      assert.expect(5);

      await visit('/');

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent('[data-test-vertical-demo-handle]', 'keydown', ENTER_KEY_CODE);
      await triggerKeyEvent('[data-test-vertical-demo-group]', 'keydown', ARROW_KEY_CODES.DOWN);
      await triggerKeyEvent('[data-test-vertical-demo-group]', 'keydown', ENTER_KEY_CODE);

      const movedHandle = findAll('[data-test-vertical-demo-handle]')[1];

      assert.dom(movedHandle).isFocused();
      assert.equal(verticalContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(horizontalContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(tableContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(scrollableContents(), 'Dos Uno Tres Cuatro Cinco');
    });

    test('Keyboard selection moves up on UP and is confirmed on SPACE', async function (assert) {
      assert.expect(5);

      await visit('/');

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent('[data-test-vertical-demo-handle]', 'keydown', SPACE_KEY_CODE);
      await triggerKeyEvent('[data-test-vertical-demo-group]', 'keydown', ARROW_KEY_CODES.DOWN);
      await triggerKeyEvent('[data-test-vertical-demo-group]', 'keydown', ARROW_KEY_CODES.DOWN);
      await triggerKeyEvent('[data-test-vertical-demo-group]', 'keydown', ARROW_KEY_CODES.UP);
      await triggerKeyEvent('[data-test-vertical-demo-group]', 'keydown', SPACE_KEY_CODE);

      const movedHandle = findAll('[data-test-vertical-demo-handle]')[1];

      assert.dom(movedHandle).isFocused();
      assert.equal(verticalContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(horizontalContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(tableContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(scrollableContents(), 'Dos Uno Tres Cuatro Cinco');
    });

    test('Keyboard selection moves down on DOWN and is confirmed on SPACE', async function (assert) {
      assert.expect(5);

      await visit('/');

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent('[data-test-vertical-demo-handle]', 'keydown', SPACE_KEY_CODE);
      await triggerKeyEvent('[data-test-vertical-demo-group]', 'keydown', ARROW_KEY_CODES.DOWN);
      await triggerKeyEvent('[data-test-vertical-demo-group]', 'keydown', SPACE_KEY_CODE);

      const movedHandle = findAll('[data-test-vertical-demo-handle]')[1];

      assert.dom(movedHandle).isFocused();
      assert.equal(verticalContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(horizontalContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(tableContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(scrollableContents(), 'Dos Uno Tres Cuatro Cinco');
    });

    test('Keyboard selection moves right on RIGHT and is confirmed on ENTER', async function (assert) {
      assert.expect(5);

      await visit('/');

      await focus('[data-test-horizontal-demo-handle]');
      await triggerKeyEvent('[data-test-horizontal-demo-handle]', 'keydown', ENTER_KEY_CODE);
      await triggerKeyEvent('[data-test-horizontal-demo-group]', 'keydown', ARROW_KEY_CODES.RIGHT);
      await triggerKeyEvent('[data-test-horizontal-demo-group]', 'keydown', ENTER_KEY_CODE);

      const movedHandle = findAll('[data-test-horizontal-demo-handle]')[1];

      assert.dom(movedHandle).isFocused();
      assert.equal(verticalContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(horizontalContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(tableContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(scrollableContents(), 'Dos Uno Tres Cuatro Cinco');
    });

    test('Keyboard selection moves left on LEFT and is confirmed on ENTER', async function (assert) {
      assert.expect(5);

      await visit('/');

      await focus('[data-test-horizontal-demo-handle]');
      await triggerKeyEvent('[data-test-horizontal-demo-handle]', 'keydown', ENTER_KEY_CODE);
      await triggerKeyEvent('[data-test-horizontal-demo-group]', 'keydown', ARROW_KEY_CODES.RIGHT);
      await triggerKeyEvent('[data-test-horizontal-demo-group]', 'keydown', ARROW_KEY_CODES.RIGHT);
      await triggerKeyEvent('[data-test-horizontal-demo-group]', 'keydown', ARROW_KEY_CODES.LEFT);
      await triggerKeyEvent('[data-test-horizontal-demo-group]', 'keydown', ENTER_KEY_CODE);

      const movedHandle = findAll('[data-test-horizontal-demo-handle]')[1];

      assert.dom(movedHandle).isFocused();
      assert.equal(verticalContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(horizontalContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(tableContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(scrollableContents(), 'Dos Uno Tres Cuatro Cinco');
    });

    test('Keyboard event onChange has correct dragged item', async function (assert) {
      await visit('/');

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent('[data-test-vertical-demo-handle]', 'keydown', ENTER_KEY_CODE);
      await triggerKeyEvent('[data-test-vertical-demo-group]', 'keydown', ARROW_KEY_CODES.DOWN);
      await triggerKeyEvent('[data-test-vertical-demo-group]', 'keydown', ENTER_KEY_CODE);

      assert.equal(justDraggedContents(), 'Uno');
    });
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

  function justDraggedContents() {
    return contents('[data-test-just-dragged]');
  }

  function contents(selector) {
    return find(selector).textContent.replace(/⇕/g, '').replace(/\s+/g, ' ').replace(/^\s+/, '').replace(/\s+$/, '');
  }
});
