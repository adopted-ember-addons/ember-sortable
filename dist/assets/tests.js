'use strict';

define("dummy/tests/acceptance/auto-scroll-test", ["qunit", "@ember/test-helpers", "ember-qunit", "ember-sortable/test-support/helpers"], function (_qunit, _testHelpers, _emberQunit, _helpers) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"@ember/test-helpers",0,"ember-qunit",0,"ember-sortable/test-support/helpers"eaimeta@70e063a35619d71f

  (0, _qunit.module)('Acceptance | container auto scroll', function (hooks) {
    (0, _emberQunit.setupApplicationTest)(hooks);
    hooks.beforeEach(function () {
      document.getElementById('ember-testing-container').scrollTop = 0;
      document.documentElement.scrollTop = 0;
    });
    (0, _qunit.test)('verticaly reordering can scroll his parent container', async function (assert) {
      await (0, _testHelpers.visit)('/docautoscroll');

      let itemHeight = () => {
        let item = (0, _testHelpers.find)('[data-test-doc-auto-scroll-demo-item]');
        const itemStyle = item.currentStyle || window.getComputedStyle(item);
        return item.offsetHeight + parseInt(itemStyle.marginTop);
      };

      await (0, _helpers.drag)('mouse', '[data-test-doc-auto-scroll-demo-item]', () => {
        return {
          dy: itemHeight() * 30 + 1,
          dx: undefined
        };
      });
      assert.ok(document.getElementById('ember-testing-container').scrollTop, 'The container has scroll (top)');
    });
    (0, _qunit.test)('horizontaly reordering can scroll his parent container', async function (assert) {
      await (0, _testHelpers.visit)('/docautoscroll?direction=x');

      let itemWidth = () => {
        let item = (0, _testHelpers.find)('[data-test-doc-auto-scroll-demo-item]');
        const itemStyle = item.currentStyle || window.getComputedStyle(item);
        return item.offsetWidth + parseInt(itemStyle.marginLeft);
      };

      await (0, _helpers.drag)('mouse', '[data-test-doc-auto-scroll-demo-item]', () => {
        return {
          dy: undefined,
          dx: itemWidth() * 30 + 1
        };
      });
      assert.ok(document.getElementById('ember-testing-container').scrollLeft, 'The container has scroll (left)');
    });
  });
});
define("dummy/tests/acceptance/smoke-modifier-test", ["qunit", "@ember/test-helpers", "ember-qunit", "ember-sortable/test-support/helpers", "ember-sortable/test-support/utils/keyboard", "ember-a11y-testing/test-support/audit"], function (_qunit, _testHelpers, _emberQunit, _helpers, _keyboard, _audit) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"@ember/test-helpers",0,"ember-qunit",0,"ember-sortable/test-support/helpers",0,"ember-sortable/test-support/utils/keyboard",0,"ember-a11y-testing/test-support/audit"eaimeta@70e063a35619d71f

  (0, _qunit.module)('Acceptance | smoke modifier', function (hooks) {
    (0, _emberQunit.setupApplicationTest)(hooks);
    (0, _qunit.test)('reordering with mouse events', async function (assert) {
      await (0, _testHelpers.visit)('/'); // when a handle is present, the element itself shall not be draggable

      assert.equal(verticalContents(), 'Zero One Two Three Four');
      assert.equal(horizontalContents(), 'Zero One Two Three Four');
      assert.equal(tableContents(), 'Zero One Two Three Four');
      assert.equal(scrollableContents(), 'Zero One Two Three Four');
      let order = (0, _testHelpers.findAll)('[data-test-vertical-demo-handle]').reverse();
      await (0, _helpers.reorder)('mouse', '[data-test-vertical-demo-handle]', ...order);
      assert.equal(verticalContents(), 'Four Three Two One Zero');
      assert.equal(horizontalContents(), 'Four Three Two One Zero');
      assert.equal(tableContents(), 'Four Three Two One Zero');
      assert.equal(scrollableContents(), 'Four Three Two One Zero');
      order = (0, _testHelpers.findAll)('[data-test-vertical-demo-handle]');
      await (0, _helpers.reorder)('mouse', '[data-test-vertical-demo-handle]', order[4], order[3], order[2], order[1], order[0]);
      assert.equal(verticalContents(), 'Zero One Two Three Four');
      assert.equal(horizontalContents(), 'Zero One Two Three Four');
      assert.equal(tableContents(), 'Zero One Two Three Four');
      assert.equal(scrollableContents(), 'Zero One Two Three Four');
    });
    (0, _qunit.test)('reordering with mouse events horizontal', async function (assert) {
      await (0, _testHelpers.visit)('/');
      assert.equal(verticalContents(), 'Zero One Two Three Four');
      assert.equal(horizontalContents(), 'Zero One Two Three Four');
      assert.equal(tableContents(), 'Zero One Two Three Four');
      assert.equal(scrollableContents(), 'Zero One Two Three Four');
      let order = (0, _testHelpers.findAll)('[data-test-horizontal-demo-handle]');
      await (0, _helpers.reorder)('mouse', '[data-test-horizontal-demo-handle]', order[1], order[0], order[2], order[3], order[4]);
      assert.equal(verticalContents(), 'One Zero Two Three Four');
      assert.equal(horizontalContents(), 'One Zero Two Three Four');
      assert.equal(tableContents(), 'One Zero Two Three Four');
      assert.equal(scrollableContents(), 'One Zero Two Three Four');
    });
    (0, _qunit.test)('reordering with mouse events scrollable', async function (assert) {
      await (0, _testHelpers.visit)('/');

      let itemHeight = () => {
        let item = (0, _testHelpers.find)('[data-test-scrollable-demo-handle]');
        const itemStyle = item.currentStyle || window.getComputedStyle(item);
        return item.offsetHeight + parseInt(itemStyle.marginTop);
      };

      await (0, _helpers.drag)('mouse', '[data-test-scrollable-demo-handle] .handle', () => {
        return {
          dy: itemHeight() * 2 + 1,
          dx: undefined
        };
      });
      assert.equal(scrollableContents(), 'One Two Zero Three Four');
      let order = (0, _testHelpers.findAll)('[data-test-scrollable-demo-handle] .handle');
      await (0, _helpers.reorder)('mouse', '[data-test-scrollable-demo-handle] .handle', order[1], order[0], order[2], order[3], order[4]);
      assert.equal(scrollableContents(), 'Two One Zero Three Four');
    });
    (0, _qunit.test)('mouse event onChange has correct dragged item', async function (assert) {
      await (0, _testHelpers.visit)('/');
      let order = (0, _testHelpers.findAll)('[data-test-vertical-demo-handle]');
      await (0, _helpers.reorder)('mouse', '[data-test-vertical-demo-handle]', order[1]);
      assert.equal(justDraggedContents(), 'One');
    });
    (0, _qunit.test)('Test isAnimated still works without css for transitionDuration', async function (assert) {
      await (0, _testHelpers.visit)('/');
      assert.equal(verticalContents(), 'Zero One Two Three Four');
      assert.equal(horizontalContents(), 'Zero One Two Three Four');
      assert.equal(tableContents(), 'Zero One Two Three Four');
      assert.equal(scrollableContents(), 'Zero One Two Three Four');
      let order = (0, _testHelpers.findAll)('[data-test-vertical-demo-handle-no-css]').reverse();
      await (0, _helpers.reorder)('mouse', '[data-test-vertical-demo-handle-no-css]', ...order);
      assert.equal(verticalContents(), 'Four Three Two One Zero');
      assert.equal(horizontalContents(), 'Four Three Two One Zero');
      assert.equal(tableContents(), 'Four Three Two One Zero');
      assert.equal(scrollableContents(), 'Four Three Two One Zero');
    });
    (0, _qunit.test)('reordering with touch events', async function (assert) {
      await (0, _testHelpers.visit)('/');
      assert.equal(verticalContents(), 'Zero One Two Three Four');
      assert.equal(horizontalContents(), 'Zero One Two Three Four');
      assert.equal(tableContents(), 'Zero One Two Three Four');
      assert.equal(scrollableContents(), 'Zero One Two Three Four');
      let order = (0, _testHelpers.findAll)('[data-test-vertical-demo-handle]').reverse();
      await (0, _helpers.reorder)('touch', '[data-test-vertical-demo-handle]', ...order);
      assert.equal(verticalContents(), 'Four Three Two One Zero');
      assert.equal(horizontalContents(), 'Four Three Two One Zero');
      assert.equal(tableContents(), 'Four Three Two One Zero');
      assert.equal(scrollableContents(), 'Four Three Two One Zero');
      order = (0, _testHelpers.findAll)('[data-test-vertical-demo-handle]');
      await (0, _helpers.reorder)('touch', '[data-test-vertical-demo-handle]', order[4], order[3], order[2], order[1], order[0]);
      assert.equal(verticalContents(), 'Zero One Two Three Four');
      assert.equal(horizontalContents(), 'Zero One Two Three Four');
      assert.equal(tableContents(), 'Zero One Two Three Four');
      assert.equal(scrollableContents(), 'Zero One Two Three Four');
    });
    (0, _qunit.test)('reordering with touch events scrollable', async function (assert) {
      await (0, _testHelpers.visit)('/');
      assert.equal(verticalContents(), 'Zero One Two Three Four');
      assert.equal(horizontalContents(), 'Zero One Two Three Four');
      assert.equal(tableContents(), 'Zero One Two Three Four');
      assert.equal(scrollableContents(), 'Zero One Two Three Four');
      let order = (0, _testHelpers.findAll)('[data-test-scrollable-demo-handle] .handle').reverse();
      await (0, _helpers.reorder)('touch', '[data-test-scrollable-demo-handle] .handle', ...order);
      assert.equal(verticalContents(), 'Four Three Two One Zero');
      assert.equal(horizontalContents(), 'Four Three Two One Zero');
      assert.equal(tableContents(), 'Four Three Two One Zero');
      assert.equal(scrollableContents(), 'Four Three Two One Zero');
      order = (0, _testHelpers.findAll)('[data-test-scrollable-demo-handle] .handle');
      await (0, _helpers.reorder)('touch', '[data-test-scrollable-demo-handle] .handle', order[4], order[3], order[2], order[1], order[0]);
      assert.equal(verticalContents(), 'Zero One Two Three Four');
      assert.equal(horizontalContents(), 'Zero One Two Three Four');
      assert.equal(tableContents(), 'Zero One Two Three Four');
      assert.equal(scrollableContents(), 'Zero One Two Three Four');
    });
    (0, _qunit.test)('Touch event onChange has correct dragged item', async function (assert) {
      await (0, _testHelpers.visit)('/');
      let order = (0, _testHelpers.findAll)('[data-test-vertical-demo-handle]');
      await (0, _helpers.reorder)('touch', '[data-test-vertical-demo-handle]', order[1]);
      assert.equal(justDraggedContents(), 'One');
    });
    (0, _qunit.module)('[A11y] Reordering with keyboard events', function () {
      (0, _qunit.test)('A11yAudit', async function (assert) {
        assert.expect(1);
        await (0, _testHelpers.visit)('/');
        await (0, _audit.default)();
        assert.ok(true, 'no a11y errors found!');
      });
      (0, _qunit.test)('Keyboard selection shows UP and DOWN visual indicators on vertical sort', async function (assert) {
        assert.expect(8);
        await (0, _testHelpers.visit)('/');
        const handle = (0, _testHelpers.find)('[data-test-vertical-demo-handle]');
        await (0, _testHelpers.focus)(handle);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-handle]', 'keydown', _keyboard.SPACE_KEY_CODE);
        assert.dom('[data-test-vertical-demo-item]').hasClass('sortable-item--active');
        assert.dom(handle).doesNotHaveClass('sortable-handle-up');
        assert.dom(handle).hasClass('sortable-handle-down');
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.DOWN);
        assert.dom(handle).hasClass('sortable-handle-up');
        assert.dom(handle).hasClass('sortable-handle-down');
        await (0, _testHelpers.blur)('[data-test-vertical-demo-group]');
        assert.dom('[data-test-vertical-demo-item]').doesNotHaveClass('sortable-item--active');
        assert.dom(handle).doesNotHaveClass('sortable-handle-up');
        assert.dom(handle).doesNotHaveClass('sortable-handle-down');
      });
      (0, _qunit.test)('Keyboard selection shows LEFT and RIGHT visual indicators on horizontal sort', async function (assert) {
        assert.expect(8);
        await (0, _testHelpers.visit)('/');
        const handle = (0, _testHelpers.find)('[data-test-horizontal-demo-handle]');
        await (0, _testHelpers.focus)(handle);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-horizontal-demo-handle]', 'keydown', _keyboard.SPACE_KEY_CODE);
        assert.dom(handle).hasClass('sortable-item--active');
        assert.dom(handle).doesNotHaveClass('sortable-handle-left');
        assert.dom(handle).hasClass('sortable-handle-right');
        await (0, _testHelpers.triggerKeyEvent)('[data-test-horizontal-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.RIGHT);
        assert.dom(handle).hasClass('sortable-handle-left');
        assert.dom(handle).hasClass('sortable-handle-right');
        await (0, _testHelpers.blur)('[data-test-horizontal-demo-group]');
        assert.dom(handle).doesNotHaveClass('sortable-item--active');
        assert.dom(handle).doesNotHaveClass('sortable-handle-left');
        assert.dom(handle).doesNotHaveClass('sortable-handle-right');
      });
      (0, _qunit.test)('Keyboard selection is activated on ENTER', async function (assert) {
        assert.expect(3);
        await (0, _testHelpers.visit)('/');
        await (0, _testHelpers.focus)('[data-test-vertical-demo-handle]');
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-handle]', 'keydown', _keyboard.ENTER_KEY_CODE);
        assert.dom('[data-test-vertical-demo-group]').hasAttribute('role', 'application');
        assert.dom('[data-test-vertical-demo-group]').hasAttribute('tabindex', '-1');
        assert.dom('[data-test-vertical-demo-group]').isFocused();
      });
      (0, _qunit.test)('Keyboard selection is activated on SPACE', async function (assert) {
        assert.expect(3);
        await (0, _testHelpers.visit)('/');
        await (0, _testHelpers.focus)('[data-test-vertical-demo-handle]');
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-handle]', 'keydown', _keyboard.SPACE_KEY_CODE);
        assert.dom('[data-test-vertical-demo-group]').hasAttribute('role', 'application');
        assert.dom('[data-test-vertical-demo-group]').hasAttribute('tabindex', '-1');
        assert.dom('[data-test-vertical-demo-group]').isFocused();
      });
      (0, _qunit.test)('Keyboard selection is cancelled on ESC', async function (assert) {
        assert.expect(3);
        await (0, _testHelpers.visit)('/');
        await (0, _testHelpers.focus)('[data-test-vertical-demo-handle]');
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-handle]', 'keydown', _keyboard.ENTER_KEY_CODE);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-group]', 'keydown', _keyboard.ESCAPE_KEY_CODE);
        assert.dom('[data-test-vertical-demo-group]').hasNoAttribute('role');
        assert.dom('[data-test-vertical-demo-group]').hasNoAttribute('tabindex');
        assert.dom('[data-test-vertical-demo-group]').isNotFocused();
      });
      (0, _qunit.test)('Keyboard selection is cancelled on losing focus', async function (assert) {
        assert.expect(3);
        await (0, _testHelpers.visit)('/');
        await (0, _testHelpers.focus)('[data-test-vertical-demo-handle]');
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-handle]', 'keydown', _keyboard.ENTER_KEY_CODE);
        await (0, _testHelpers.blur)('[data-test-vertical-demo-group]');
        assert.dom('[data-test-vertical-demo-group]').hasNoAttribute('role');
        assert.dom('[data-test-vertical-demo-group]').hasNoAttribute('tabindex');
        assert.dom('[data-test-vertical-demo-group]').isNotFocused();
      });
      (0, _qunit.test)('Keyboard selection moves down on DOWN and is cancelled on ESC', async function (assert) {
        assert.expect(5);
        await (0, _testHelpers.visit)('/');
        await (0, _testHelpers.focus)('[data-test-vertical-demo-handle]');
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-handle]', 'keydown', _keyboard.SPACE_KEY_CODE);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.DOWN);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-group]', 'keydown', _keyboard.ESCAPE_KEY_CODE);
        const movedHandle = (0, _testHelpers.findAll)('[data-test-vertical-demo-handle]')[0];
        assert.dom(movedHandle).isFocused();
        assert.equal(verticalContents(), 'Zero One Two Three Four');
        assert.equal(horizontalContents(), 'Zero One Two Three Four');
        assert.equal(tableContents(), 'Zero One Two Three Four');
        assert.equal(scrollableContents(), 'Zero One Two Three Four');
      });
      (0, _qunit.test)('Keyboard selection moves down on DOWN and is cancelled on losing focus', async function (assert) {
        assert.expect(5);
        await (0, _testHelpers.visit)('/');
        await (0, _testHelpers.focus)('[data-test-vertical-demo-handle]');
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-handle]', 'keydown', _keyboard.SPACE_KEY_CODE);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.DOWN);
        await (0, _testHelpers.blur)('[data-test-vertical-demo-group]');
        const movedHandle = (0, _testHelpers.findAll)('[data-test-vertical-demo-handle]')[0];
        assert.dom(movedHandle).isNotFocused();
        assert.equal(verticalContents(), 'Zero One Two Three Four');
        assert.equal(horizontalContents(), 'Zero One Two Three Four');
        assert.equal(tableContents(), 'Zero One Two Three Four');
        assert.equal(scrollableContents(), 'Zero One Two Three Four');
      });
      (0, _qunit.test)('Keyboard selection is confirmed on ENTER', async function (assert) {
        assert.expect(5);
        await (0, _testHelpers.visit)('/');
        await (0, _testHelpers.focus)('[data-test-vertical-demo-handle]');
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-handle]', 'keydown', _keyboard.ENTER_KEY_CODE);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.DOWN);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-group]', 'keydown', _keyboard.ENTER_KEY_CODE);
        const movedHandle = (0, _testHelpers.findAll)('[data-test-vertical-demo-handle]')[1];
        assert.dom(movedHandle).isFocused();
        assert.equal(verticalContents(), 'One Zero Two Three Four');
        assert.equal(horizontalContents(), 'One Zero Two Three Four');
        assert.equal(tableContents(), 'One Zero Two Three Four');
        assert.equal(scrollableContents(), 'One Zero Two Three Four');
      });
      (0, _qunit.test)('Keyboard selection moves up on UP and is confirmed on SPACE', async function (assert) {
        assert.expect(5);
        await (0, _testHelpers.visit)('/');
        await (0, _testHelpers.focus)('[data-test-vertical-demo-handle]');
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-handle]', 'keydown', _keyboard.SPACE_KEY_CODE);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.DOWN);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.DOWN);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.UP);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-group]', 'keydown', _keyboard.SPACE_KEY_CODE);
        const movedHandle = (0, _testHelpers.findAll)('[data-test-vertical-demo-handle]')[1];
        assert.dom(movedHandle).isFocused();
        assert.equal(verticalContents(), 'One Zero Two Three Four');
        assert.equal(horizontalContents(), 'One Zero Two Three Four');
        assert.equal(tableContents(), 'One Zero Two Three Four');
        assert.equal(scrollableContents(), 'One Zero Two Three Four');
      });
      (0, _qunit.test)('Keyboard selection moves down on DOWN and is confirmed on SPACE', async function (assert) {
        assert.expect(5);
        await (0, _testHelpers.visit)('/');
        await (0, _testHelpers.focus)('[data-test-vertical-demo-handle]');
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-handle]', 'keydown', _keyboard.SPACE_KEY_CODE);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.DOWN);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-group]', 'keydown', _keyboard.SPACE_KEY_CODE);
        const movedHandle = (0, _testHelpers.findAll)('[data-test-vertical-demo-handle]')[1];
        assert.dom(movedHandle).isFocused();
        assert.equal(verticalContents(), 'One Zero Two Three Four');
        assert.equal(horizontalContents(), 'One Zero Two Three Four');
        assert.equal(tableContents(), 'One Zero Two Three Four');
        assert.equal(scrollableContents(), 'One Zero Two Three Four');
      });
      (0, _qunit.test)('Keyboard selection moves right on RIGHT and is confirmed on ENTER', async function (assert) {
        assert.expect(5);
        await (0, _testHelpers.visit)('/');
        await (0, _testHelpers.focus)('[data-test-horizontal-demo-handle]');
        await (0, _testHelpers.triggerKeyEvent)('[data-test-horizontal-demo-handle]', 'keydown', _keyboard.ENTER_KEY_CODE);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-horizontal-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.RIGHT);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-horizontal-demo-group]', 'keydown', _keyboard.ENTER_KEY_CODE);
        const movedHandle = (0, _testHelpers.findAll)('[data-test-horizontal-demo-handle]')[1];
        assert.dom(movedHandle).isFocused();
        assert.equal(verticalContents(), 'One Zero Two Three Four');
        assert.equal(horizontalContents(), 'One Zero Two Three Four');
        assert.equal(tableContents(), 'One Zero Two Three Four');
        assert.equal(scrollableContents(), 'One Zero Two Three Four');
      });
      (0, _qunit.test)('Keyboard selection moves left on LEFT and is confirmed on ENTER', async function (assert) {
        assert.expect(5);
        await (0, _testHelpers.visit)('/');
        await (0, _testHelpers.focus)('[data-test-horizontal-demo-handle]');
        await (0, _testHelpers.triggerKeyEvent)('[data-test-horizontal-demo-handle]', 'keydown', _keyboard.ENTER_KEY_CODE);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-horizontal-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.RIGHT);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-horizontal-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.RIGHT);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-horizontal-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.LEFT);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-horizontal-demo-group]', 'keydown', _keyboard.ENTER_KEY_CODE);
        const movedHandle = (0, _testHelpers.findAll)('[data-test-horizontal-demo-handle]')[1];
        assert.dom(movedHandle).isFocused();
        assert.equal(verticalContents(), 'One Zero Two Three Four');
        assert.equal(horizontalContents(), 'One Zero Two Three Four');
        assert.equal(tableContents(), 'One Zero Two Three Four');
        assert.equal(scrollableContents(), 'One Zero Two Three Four');
      });
      (0, _qunit.test)('Keyboard event onChange has correct dragged item', async function (assert) {
        await (0, _testHelpers.visit)('/');
        await (0, _testHelpers.focus)('[data-test-vertical-demo-handle]');
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-handle]', 'keydown', _keyboard.ENTER_KEY_CODE);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.DOWN);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-vertical-demo-group]', 'keydown', _keyboard.ENTER_KEY_CODE);
        assert.equal(justDraggedContents(), 'Zero');
        assert.equal(tableConditionalCellContents(), 'avocado banana cashew watermelon durian apple lemon ');
        await (0, _testHelpers.focus)('[data-test-table-conditional-cell-handle]');
        await (0, _testHelpers.triggerKeyEvent)('[data-test-table-conditional-cell-handle]', 'keydown', _keyboard.ENTER_KEY_CODE);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-table-conditional-cell-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.DOWN);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-table-conditional-cell-demo-group]', 'keydown', _keyboard.ENTER_KEY_CODE);
        assert.equal(tableConditionalCellContents(), 'banana avocado cashew watermelon durian apple lemon ');
      });
      (0, _qunit.test)('Keyboard selection works multiple times for conditionally rendered sort-handle', async function (assert) {
        await (0, _testHelpers.visit)('/');
        assert.equal(tableConditionalCellContents(), 'avocado banana cashew watermelon durian apple lemon ');
        await (0, _testHelpers.focus)('[data-test-table-conditional-cell-handle]');
        await (0, _testHelpers.triggerKeyEvent)('[data-test-table-conditional-cell-handle]', 'keydown', _keyboard.ENTER_KEY_CODE);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-table-conditional-cell-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.DOWN);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-table-conditional-cell-demo-group]', 'keydown', _keyboard.ENTER_KEY_CODE);
        assert.equal(tableConditionalCellContents(), 'banana avocado cashew watermelon durian apple lemon ');
        const moveHandle = (0, _testHelpers.findAll)('[data-test-table-conditional-cell-handle]')[4];
        await (0, _testHelpers.focus)(moveHandle);
        await (0, _testHelpers.triggerKeyEvent)(moveHandle, 'keydown', _keyboard.ENTER_KEY_CODE);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-table-conditional-cell-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.UP);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-table-conditional-cell-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.UP);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-table-conditional-cell-demo-group]', 'keydown', _keyboard.ENTER_KEY_CODE);
        assert.equal(tableConditionalCellContents(), 'banana avocado durian cashew watermelon apple lemon ');
        const moveHandle1 = (0, _testHelpers.findAll)('[data-test-table-conditional-cell-handle]')[0];
        await (0, _testHelpers.focus)(moveHandle1);
        await (0, _testHelpers.triggerKeyEvent)(moveHandle1, 'keydown', _keyboard.ENTER_KEY_CODE);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-table-conditional-cell-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.DOWN);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-table-conditional-cell-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.DOWN);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-table-conditional-cell-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.DOWN);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-table-conditional-cell-demo-group]', 'keydown', _keyboard.ARROW_KEY_CODES.DOWN);
        await (0, _testHelpers.triggerKeyEvent)('[data-test-table-conditional-cell-demo-group]', 'keydown', _keyboard.ENTER_KEY_CODE);
        assert.equal(tableConditionalCellContents(), 'avocado durian cashew watermelon banana apple lemon ');
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
      return (0, _testHelpers.find)(selector).textContent.replace(/⇕/g, '').replace(/\s+/g, ' ').replace(/^\s+/, '').replace(/\s+$/, '');
    }

    function tableConditionalCellContents() {
      const elements = (0, _testHelpers.findAll)('[data-test-fruits]');
      let result = '';

      for (const index in elements) {
        const element = elements[index];
        result += element.textContent.replace(/⇕/g, '').replace(/\s+/g, ' ').replace(/^\s+/, '').replace(/\s+$/, '');
        result += ' ';
      }

      return result;
    }
  });
});
define("dummy/tests/helpers/start-app", ["exports", "dummy/app", "dummy/config/environment", "@ember/polyfills", "@ember/runloop"], function (_exports, _app, _environment, _polyfills, _runloop) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = startApp;
  0; //eaimeta@70e063a35619d71f0,"dummy/app",0,"dummy/config/environment",0,"@ember/polyfills",0,"@ember/runloop"eaimeta@70e063a35619d71f

  function startApp(attrs) {
    let attributes = (0, _polyfills.assign)({}, _environment.default.APP);
    attributes.autoboot = true;
    attributes = (0, _polyfills.assign)(attributes, attrs); // use defaults, but you can override;

    return (0, _runloop.run)(() => {
      let application = _app.default.create(attributes);

      application.setupForTesting();
      application.injectTestHelpers();
      return application;
    });
  }
});
define("dummy/tests/integration/modifiers/sortable-group-test", ["@ember/template-factory", "qunit", "ember-qunit", "@ember/test-helpers", "@ember/object", "ember-sortable/test-support/helpers"], function (_templateFactory, _qunit, _emberQunit, _testHelpers, _object, _helpers) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit",0,"@ember/test-helpers",0,"@ember/object",0,"ember-sortable/test-support/helpers",0,"htmlbars-inline-precompile"eaimeta@70e063a35619d71f

  (0, _qunit.module)('Integration | Modifier | sortable-group', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('Works with items added after render', async function (assert) {
      this.items = ['Uno', 'Dos', 'Tres'];

      this.update = items => {
        (0, _object.set)(this, 'items', items);
      };

      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        
            <ol id="test-list" {{sortable-group onChange=this.update}}>
              {{#each this.items as |item|}}
                <li {{sortable-item model=item}}>{{item}}</li>
              {{/each}}
            </ol>
          
      */
      {
        "id": "5V4puGoA",
        "block": "[[[1,\"\\n      \"],[11,\"ol\"],[24,1,\"test-list\"],[4,[38,0],null,[[\"onChange\"],[[30,0,[\"update\"]]]]],[12],[1,\"\\n\"],[42,[28,[37,2],[[28,[37,2],[[30,0,[\"items\"]]],null]],null],null,[[[1,\"          \"],[11,\"li\"],[4,[38,3],null,[[\"model\"],[[30,1]]]],[12],[1,[30,1]],[13],[1,\"\\n\"]],[1]],null],[1,\"      \"],[13],[1,\"\\n    \"]],[\"item\"],false,[\"sortable-group\",\"each\",\"-track-array\",\"sortable-item\"]]",
        "moduleName": "(unknown template module)",
        "isStrictMode": false
      }));
      (0, _object.set)(this, 'items', [...this.items, 'Quatro']);
      await (0, _testHelpers.settled)();
      let order = (0, _testHelpers.findAll)('li');
      await (0, _helpers.reorder)('mouse', 'li', order[3], order[1], order[0], order[2]);
      assert.equal(contents('#test-list'), 'Quatro Dos Uno Tres');
      (0, _object.set)(this, 'items', this.items.slice(1));
      await (0, _testHelpers.settled)();
      await (0, _helpers.reorder)('mouse', 'li', order[2], order[1], order[0]);
      assert.equal(contents('#test-list'), 'Tres Dos Uno');
    });
    (0, _qunit.test)('you can disabled a group', async function (assert) {
      this.items = ['Uno', 'Dos', 'Tres', 'Quatro'];

      this.update = function () {
        assert.step('onChange was called while group is disabled');
      };

      this.disabled = false;
      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        
            <ol id="test-list" {{sortable-group disabled=this.disabled onChange=this.update}}>
              {{#each this.items as |item|}}
                <li {{sortable-item model=item}}>{{item}}</li>
              {{/each}}
            </ol>
          
      */
      {
        "id": "mImjEZEM",
        "block": "[[[1,\"\\n      \"],[11,\"ol\"],[24,1,\"test-list\"],[4,[38,0],null,[[\"disabled\",\"onChange\"],[[30,0,[\"disabled\"]],[30,0,[\"update\"]]]]],[12],[1,\"\\n\"],[42,[28,[37,2],[[28,[37,2],[[30,0,[\"items\"]]],null]],null],null,[[[1,\"          \"],[11,\"li\"],[4,[38,3],null,[[\"model\"],[[30,1]]]],[12],[1,[30,1]],[13],[1,\"\\n\"]],[1]],null],[1,\"      \"],[13],[1,\"\\n    \"]],[\"item\"],false,[\"sortable-group\",\"each\",\"-track-array\",\"sortable-item\"]]",
        "moduleName": "(unknown template module)",
        "isStrictMode": false
      }));
      this.set('disabled', true);
      let order = (0, _testHelpers.findAll)('li');
      await (0, _helpers.reorder)('mouse', 'li', order[3], order[1], order[0], order[2]);
      assert.ok(true, 'Reorder prevented');
      assert.verifySteps([]);
    });
    (0, _qunit.test)('Announcer has appropriate text for user actions', async function (assert) {
      this.items = ['Uno', 'Dos', 'Tres'];

      this.update = items => {
        (0, _object.set)(this, 'items', items);
      };

      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        
            <ol id="test-list" {{sortable-group onChange=this.update}}>
              {{#each this.items as |item|}}
                <li {{sortable-item model=item}}>
                  {{item}}
                  <button data-test-handle={{item}} {{sortable-handle}}>
                    handle
                  </button>
                </li>
              {{/each}}
            </ol>
          
      */
      {
        "id": "qqlRbQTM",
        "block": "[[[1,\"\\n      \"],[11,\"ol\"],[24,1,\"test-list\"],[4,[38,0],null,[[\"onChange\"],[[30,0,[\"update\"]]]]],[12],[1,\"\\n\"],[42,[28,[37,2],[[28,[37,2],[[30,0,[\"items\"]]],null]],null],null,[[[1,\"          \"],[11,\"li\"],[4,[38,3],null,[[\"model\"],[[30,1]]]],[12],[1,\"\\n            \"],[1,[30,1]],[1,\"\\n            \"],[11,\"button\"],[16,\"data-test-handle\",[30,1]],[4,[38,4],null,null],[12],[1,\"\\n              handle\\n            \"],[13],[1,\"\\n          \"],[13],[1,\"\\n\"]],[1]],null],[1,\"      \"],[13],[1,\"\\n    \"]],[\"item\"],false,[\"sortable-group\",\"each\",\"-track-array\",\"sortable-item\",\"sortable-handle\"]]",
        "moduleName": "(unknown template module)",
        "isStrictMode": false
      }));
      (0, _testHelpers.triggerKeyEvent)('[data-test-handle=Uno]', 'keydown', 32)
      /* SPACE */
      ;
      await announcerHasText();
      assert.dom(announcerSelector).hasText('item at position, 1 of 3, is activated to be repositioned.Press up and down keys to change position, Space to confirm new position, Escape to cancel.');
      (0, _testHelpers.triggerKeyEvent)('[data-test-handle=Uno]', 'keydown', 40)
      /* DOWN */
      ;
      await announcerHasText();
      assert.dom(announcerSelector).hasText('item is moved to position, 2 of 3. Press Space to confirm new position, Escape to cancel.');
      (0, _testHelpers.triggerKeyEvent)('[data-test-handle=Uno]', 'keydown', 32)
      /* SPACE */
      ;
      await announcerHasText();
      assert.dom(announcerSelector).hasText('item is successfully repositioned.');
      await (0, _testHelpers.triggerKeyEvent)('[data-test-handle=Uno]', 'keydown', 32)
      /* SPACE */
      ;
      (0, _testHelpers.triggerKeyEvent)('[data-test-handle=Uno]', 'keydown', 27)
      /* ESC */
      ;
      await announcerHasText();
      assert.dom(announcerSelector).hasText('Cancelling item repositioning');
    });

    function contents(selector) {
      return (0, _testHelpers.find)(selector).textContent.replace(/⇕/g, '').replace(/\s+/g, ' ').replace(/^\s+/, '').replace(/\s+$/, '');
    }

    let announcerSelector = '#test-list + .visually-hidden';

    let announcerHasText = async function () {
      return await (0, _testHelpers.waitUntil)(() => {
        return (0, _testHelpers.find)(announcerSelector).textContent.includes(' ');
      }, {
        timeout: 2000
      });
    };
  });
});
define("dummy/tests/test-helper", ["dummy/app", "dummy/config/environment", "qunit", "@ember/test-helpers", "qunit-dom", "ember-qunit"], function (_app, _environment, QUnit, _testHelpers, _qunitDom, _emberQunit) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"dummy/app",0,"dummy/config/environment",0,"qunit",0,"@ember/test-helpers",0,"qunit-dom",0,"ember-qunit"eaimeta@70e063a35619d71f

  (0, _testHelpers.setApplication)(_app.default.create(_environment.default.APP));
  (0, _qunitDom.setup)(QUnit.assert);
  (0, _emberQunit.start)();
});
define("dummy/tests/unit/services/ember-sortable-test", ["qunit", "ember-qunit", "@ember/array"], function (_qunit, _emberQunit, _array) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-qunit",0,"@ember/array"eaimeta@70e063a35619d71f

  (0, _qunit.module)('Unit | Service | ember-sortable', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    hooks.beforeEach(function () {
      this.sortableService = this.owner.lookup('service:ember-sortable-internal-state'); // While not truly a group modifier, the service just registers whatever object is passed

      this.groupModifier = {
        stuff: ''
      }; // While not truly an item modifier, the service just registers whatever object is passed

      this.sortableItem = {
        itemStuff: ''
      };
      this.groupName = 'GroupName';
      this.unregisteredGroupName = 'UnregisteredName';
    });
    (0, _qunit.test)('Registers/Deregisters a group', function (assert) {
      this.sortableService.registerGroup(this.groupName, this.groupModifier);
      let groupDef = this.sortableService.groups[this.groupName];
      assert.strictEqual(groupDef.groupModifier, this.groupModifier);
      assert.ok((0, _array.isArray)(groupDef.items));
      this.sortableService.deregisterGroup('unregisteredGroupName');
      groupDef = this.sortableService.groups[this.groupName]; // did not effect registered name

      assert.strictEqual(groupDef.groupModifier, this.groupModifier);
      this.sortableService.deregisterGroup(this.groupName);
      groupDef = this.sortableService.groups[this.groupName];
      assert.strictEqual(groupDef, undefined);
    });
    (0, _qunit.test)('Registers/Deregisters an item', function (assert) {
      this.sortableService.registerItem(this.groupName, this.sortableItem);
      let groupDef = this.sortableService.fetchGroup(this.groupName);
      assert.ok((0, _array.isArray)(groupDef.items));
      assert.ok(groupDef.items.includes(this.sortableItem));
      this.sortableService.deregisterItem(this.unregisteredGroupName, this.sortableItem);
      groupDef = this.sortableService.fetchGroup(this.groupName);
      assert.ok(groupDef.items.includes(this.sortableItem));
      this.sortableService.deregisterItem(this.groupName, this.sortableItem);
      assert.ok((0, _array.isArray)(groupDef.items));
      assert.notOk(groupDef.items.includes(this.sortableItem));
    });
    (0, _qunit.test)('Fetch a group', function (assert) {
      let groupDef = this.sortableService.fetchGroup(this.groupName);
      assert.ok(groupDef, 'Creates a group if one is not previously registered');
      assert.ok((0, _array.isArray)(groupDef.items));
      let groupDef2 = this.sortableService.fetchGroup(this.groupName);
      assert.strictEqual(groupDef, groupDef2, 'Fetches the correct group is one exists');
    });
  });
});
define('dummy/config/environment', [], function() {
  var prefix = 'dummy';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(decodeURIComponent(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

require('dummy/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;
//# sourceMappingURL=tests.map
