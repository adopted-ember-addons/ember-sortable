import { module, test } from 'qunit';
import { visit, find, findAll, triggerKeyEvent, focus, blur, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { drag, reorder }  from 'ember-sortable/test-support/helpers';
import { ENTER_KEY_CODE, SPACE_KEY_CODE, ESCAPE_KEY_CODE, ARROW_KEY_CODES } from "ember-sortable/test-support/utils/keyboard";
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Acceptance | smoke component', function(hooks) {
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

    await drag('mouse', '[data-test-scrollable-demo-handle] .handle', () => { return {dy: itemHeight() * 2 + 1, dx: undefined}});

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

  test('Test isAnimated still works without css for transitionDuration', async function(assert) {
    await visit('/');

    assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');

    let order = findAll('[data-test-vertical-demo-handle-no-css]').reverse();
    await reorder(
      'mouse',
      '[data-test-vertical-demo-handle-no-css]',
      ...order
    );

    assert.equal(verticalContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(horizontalContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(tableContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(scrollableContents(), 'Cinco Cuatro Tres Dos Uno');
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

  test('reordering with a delayed onChange update', async function(assert) {
    await visit('/');

    assert.equal(delayedContents(), 'Uno Dos Tres Cuatro Cinco');

    const item = find('[data-test-delayed-demo-handle]');
    const style = window.getComputedStyle(item);
    const height = item.offsetHeight + parseInt(style.marginTop);
    await drag('mouse', '[data-test-delayed-demo-handle]', () => { return { dy: height * 2 + 1, dx: undefined }});

    assert.equal(delayedContents(), 'Uno Dos Tres Cuatro Cinco');

    await waitFor('[data-test-delayed-update-finished]');

    assert.equal(delayedContents(), 'Dos Uno Tres Cuatro Cinco');
  });

  module('[A11y] Reordering with keyboard events', function() {
    test('A11yAudit', async function(assert) {
      assert.expect(1);

      await visit("/");
      await a11yAudit();
      assert.ok(true, 'no a11y errors found!');
    });

    test('Keyboard selection shows UP and DOWN visual indicators on vertical sort', async function(assert) {
      assert.expect(8);

      await visit("/");

      const handle = find('[data-test-vertical-demo-handle]');
      await focus(handle);
      await triggerKeyEvent(
        '[data-test-vertical-demo-handle]',
        'keydown',
        SPACE_KEY_CODE
      );
      assert.dom('[data-test-vertical-demo-item').hasClass('sortable-item--active');
      assert.dom(handle).doesNotHaveClass('sortable-handle-up');
      assert.dom(handle).hasClass('sortable-handle-down');

      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ARROW_KEY_CODES.DOWN
      );
      assert.dom(handle).hasClass('sortable-handle-up');
      assert.dom(handle).hasClass('sortable-handle-down');

      await blur('[data-test-vertical-demo-group]');
      assert.dom('[data-test-vertical-demo-item]').doesNotHaveClass('sortable-item--active');
      assert.dom(handle).doesNotHaveClass('sortable-handle-up');
      assert.dom(handle).doesNotHaveClass('sortable-handle-down');
    });

    test('Keyboard selection shows LEFT and RIGHT visual indicators on horizontal sort', async function(assert) {
      assert.expect(8);

      await visit("/");

      const handle = find('[data-test-horizontal-demo-handle]');
      await focus(handle);
      await triggerKeyEvent(
        '[data-test-horizontal-demo-handle]',
        'keydown',
        SPACE_KEY_CODE
      );
      assert.dom(handle).hasClass('sortable-item--active');
      assert.dom(handle).doesNotHaveClass('sortable-handle-left');
      assert.dom(handle).hasClass('sortable-handle-right');

      await triggerKeyEvent(
        '[data-test-horizontal-demo-group]',
        'keydown',
        ARROW_KEY_CODES.RIGHT
      );
      assert.dom(handle).hasClass('sortable-handle-left');
      assert.dom(handle).hasClass('sortable-handle-right');

      await blur('[data-test-horizontal-demo-group]');
      assert.dom(handle).doesNotHaveClass('sortable-item--active');
      assert.dom(handle).doesNotHaveClass('sortable-handle-left');
      assert.dom(handle).doesNotHaveClass('sortable-handle-right');
    });

    test('Keyboard selection is activated on ENTER', async function(assert) {
      assert.expect(3);

      await visit("/");
      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent(
        '[data-test-vertical-demo-handle]',
        'keydown',
        ENTER_KEY_CODE
      );

      assert
        .dom('[data-test-vertical-demo-group]')
        .hasAttribute('role', 'application');
      assert
        .dom('[data-test-vertical-demo-group]')
        .hasAttribute('tabindex', '-1');
      assert.dom('[data-test-vertical-demo-group]').isFocused();
    });

    test('Keyboard selection is activated on SPACE', async function(assert) {
      assert.expect(3);

      await visit("/");
      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent(
        '[data-test-vertical-demo-handle]',
        'keydown',
        SPACE_KEY_CODE
      );

      assert
        .dom('[data-test-vertical-demo-group]')
        .hasAttribute('role', 'application');
      assert
        .dom('[data-test-vertical-demo-group]')
        .hasAttribute('tabindex', '-1');
      assert.dom('[data-test-vertical-demo-group]').isFocused();
    });

    test('Keyboard selection is cancelled on ESC', async function(assert) {
      assert.expect(3);
      await visit("/");

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent(
        '[data-test-vertical-demo-handle]',
        'keydown',
        ENTER_KEY_CODE
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ESCAPE_KEY_CODE
      );

      assert
        .dom('[data-test-vertical-demo-group]')
        .hasNoAttribute('role');
      assert
        .dom('[data-test-vertical-demo-group]')
        .hasNoAttribute('tabindex');
      assert.dom('[data-test-vertical-demo-group]').isNotFocused();
    });

    test('Keyboard selection is cancelled on losing focus', async function(assert) {
      assert.expect(3);

      await visit("/");

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent(
        '[data-test-vertical-demo-handle]',
        'keydown',
        ENTER_KEY_CODE
      );

      await blur('[data-test-vertical-demo-group]');

      assert
        .dom('[data-test-vertical-demo-group]')
        .hasNoAttribute('role');
      assert
        .dom('[data-test-vertical-demo-group]')
        .hasNoAttribute('tabindex');
      assert.dom('[data-test-vertical-demo-group]').isNotFocused();
    });

    test('Keyboard selection moves down on DOWN and is cancelled on ESC', async function(assert) {
      assert.expect(5);

      await visit("/");

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent(
        '[data-test-vertical-demo-handle]',
        'keydown',
        SPACE_KEY_CODE
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ARROW_KEY_CODES.DOWN
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ESCAPE_KEY_CODE,
      );

      const movedHandle = findAll('[data-test-vertical-demo-handle]')[0];

      assert.dom(movedHandle).isFocused();
      assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
      assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
      assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
      assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');
    });

    test('Keyboard selection moves down on DOWN and is cancelled on losing focus', async function(assert) {
      assert.expect(5);

      await visit("/");

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent(
        '[data-test-vertical-demo-handle]',
        'keydown',
        SPACE_KEY_CODE
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ARROW_KEY_CODES.DOWN
      );

      await blur('[data-test-vertical-demo-group]');

      const movedHandle = findAll('[data-test-vertical-demo-handle]')[0];

      assert.dom(movedHandle).isNotFocused();
      assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
      assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
      assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
      assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');
    });

    test('Keyboard selection is confirmed on ENTER', async function(assert) {
      assert.expect(5);

      await visit("/");

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent(
        '[data-test-vertical-demo-handle]',
        'keydown',
        ENTER_KEY_CODE
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ARROW_KEY_CODES.DOWN
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ENTER_KEY_CODE
      );

      const movedHandle = findAll('[data-test-vertical-demo-handle]')[1];

      assert.dom(movedHandle).isFocused();
      assert.equal(verticalContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(horizontalContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(tableContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(scrollableContents(), 'Dos Uno Tres Cuatro Cinco');
    });

    test('Keyboard selection moves up on UP and is confirmed on SPACE', async function(assert) {
      assert.expect(5);

      await visit("/");

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent(
        '[data-test-vertical-demo-handle]',
        'keydown',
        SPACE_KEY_CODE
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ARROW_KEY_CODES.DOWN
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ARROW_KEY_CODES.DOWN
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ARROW_KEY_CODES.UP
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        SPACE_KEY_CODE
      );

      const movedHandle = findAll('[data-test-vertical-demo-handle]')[1];

      assert.dom(movedHandle).isFocused();
      assert.equal(verticalContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(horizontalContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(tableContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(scrollableContents(), 'Dos Uno Tres Cuatro Cinco');
    });

    test('Keyboard selection moves down on DOWN and is confirmed on SPACE', async function(assert) {
      assert.expect(5);

      await visit("/");

      await focus('[data-test-vertical-demo-handle]');
      await triggerKeyEvent(
        '[data-test-vertical-demo-handle]',
        'keydown',
        SPACE_KEY_CODE
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        ARROW_KEY_CODES.DOWN
      );
      await triggerKeyEvent(
        '[data-test-vertical-demo-group]',
        'keydown',
        SPACE_KEY_CODE
      );

      const movedHandle = findAll('[data-test-vertical-demo-handle]')[1];

      assert.dom(movedHandle).isFocused();
      assert.equal(verticalContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(horizontalContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(tableContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(scrollableContents(), 'Dos Uno Tres Cuatro Cinco');
    });

    test('Keyboard selection moves right on RIGHT and is confirmed on ENTER', async function(assert) {
      assert.expect(5);

      await visit("/");

      await focus('[data-test-horizontal-demo-handle]');
      await triggerKeyEvent(
        '[data-test-horizontal-demo-handle]',
        'keydown',
        ENTER_KEY_CODE
      );
      await triggerKeyEvent(
        '[data-test-horizontal-demo-group]',
        'keydown',
        ARROW_KEY_CODES.RIGHT
      );
      await triggerKeyEvent(
        '[data-test-horizontal-demo-group]',
        'keydown',
        ENTER_KEY_CODE
      );

      const movedHandle = findAll('[data-test-horizontal-demo-handle]')[1];

      assert.dom(movedHandle).isFocused();
      assert.equal(verticalContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(horizontalContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(tableContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(scrollableContents(), 'Dos Uno Tres Cuatro Cinco');
    });

    test('Keyboard selection moves left on LEFT and is confirmed on ENTER', async function(assert) {
      assert.expect(5);

      await visit("/");

      await focus('[data-test-horizontal-demo-handle]');
      await triggerKeyEvent(
        '[data-test-horizontal-demo-handle]',
        'keydown',
        ENTER_KEY_CODE
      );
      await triggerKeyEvent(
        '[data-test-horizontal-demo-group]',
        'keydown',
        ARROW_KEY_CODES.RIGHT
      );
      await triggerKeyEvent(
        '[data-test-horizontal-demo-group]',
        'keydown',
        ARROW_KEY_CODES.RIGHT
      );
      await triggerKeyEvent(
        '[data-test-horizontal-demo-group]',
        'keydown',
        ARROW_KEY_CODES.LEFT
      );
      await triggerKeyEvent(
        '[data-test-horizontal-demo-group]',
        'keydown',
        ENTER_KEY_CODE
      );

      const movedHandle = findAll('[data-test-horizontal-demo-handle]')[1];

      assert.dom(movedHandle).isFocused();
      assert.equal(verticalContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(horizontalContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(tableContents(), 'Dos Uno Tres Cuatro Cinco');
      assert.equal(scrollableContents(), 'Dos Uno Tres Cuatro Cinco');
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

  function delayedContents() {
    return contents('.delayed-demo ol');
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

