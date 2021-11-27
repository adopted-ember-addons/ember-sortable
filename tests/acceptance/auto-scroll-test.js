import { module, test } from 'qunit';
import { visit, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { drag } from 'ember-sortable/test-support/helpers';

function fakeDocumentContainer() {
  let testingContainer = document.getElementById('ember-testing-container');
  let testingApp = document.getElementById('ember-testing');

  document.getElementById('ember-testing');

  let originalStyle = {
    containerHeight: testingContainer.style.height,
    containerWidth: testingContainer.style.width,
    containerOverflow: testingContainer.style.overflow,

    appHeight: testingApp.style.height,
    appWidth: testingApp.style.width,
  };

  document.getElementById('ember-testing-container').style.height = 'auto';
  document.getElementById('ember-testing-container').style.width = 'auto';
  document.getElementById('ember-testing-container').style.overflow = 'visible';
  document.getElementById('ember-testing').style.height = 'auto';
  document.getElementById('ember-testing').style.height = 'auto';

  return () => {
    document.getElementById('ember-testing-container').style.height = originalStyle.containerHeight;
    document.getElementById('ember-testing-container').style.width = originalStyle.containerWidth;
    document.getElementById('ember-testing-container').style.overflow = originalStyle.containerOverflow;
    document.getElementById('ember-testing').style.height = originalStyle.appHeight;
    document.getElementById('ember-testing').style.height = originalStyle.appWidth;
  };
}

module('Acceptance | container auto scroll', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    document.getElementById('ember-testing-container').scrollTop = 0;
    document.documentElement.scrollTop = 0;
  });

  test('verticaly reordering can scroll his parent container (not document)', async function (assert) {
    await visit('/docautoscroll');

    let itemHeight = () => {
      let item = find('[data-test-doc-auto-scroll-demo-item]');
      const itemStyle = item.currentStyle || window.getComputedStyle(item);
      return item.offsetHeight + parseInt(itemStyle.marginTop);
    };

    await drag('mouse', '[data-test-doc-auto-scroll-demo-item]', () => {
      return { dy: itemHeight() * 30 + 1, dx: undefined };
    });
    assert.ok(document.getElementById('ember-testing-container').scrollTop, 'The container has scroll (top)');
  });

  test('horizontaly reordering can scroll his parent container (not document)', async function (assert) {
    await visit('/docautoscroll?direction=x');

    let itemWidth = () => {
      let item = find('[data-test-doc-auto-scroll-demo-item]');
      const itemStyle = item.currentStyle || window.getComputedStyle(item);
      return item.offsetWidth + parseInt(itemStyle.marginLeft);
    };

    await drag('mouse', '[data-test-doc-auto-scroll-demo-item]', () => {
      return { dy: undefined, dx: itemWidth() * 30 + 1 };
    });
    assert.ok(document.getElementById('ember-testing-container').scrollLeft, 'The container has scroll (left)');
  });

  test('verticaly reordering can scroll his parent container (document)', async function (assert) {
    let restoreTestingContainer = fakeDocumentContainer();

    await visit('/docautoscroll');

    let itemHeight = () => {
      let item = find('[data-test-doc-auto-scroll-demo-item]');
      const itemStyle = item.currentStyle || window.getComputedStyle(item);
      return item.offsetHeight + parseInt(itemStyle.marginTop);
    };

    await drag('mouse', '[data-test-doc-auto-scroll-demo-item]', () => {
      return { dy: itemHeight() * 30 + 1, dx: undefined };
    });
    assert.ok(document.documentElement.scrollTop, 'The document has scroll (top)');
    restoreTestingContainer();
  });

  test('horizontaly reordering can scroll his parent container (document)', async function (assert) {
    let restoreTestingContainer = fakeDocumentContainer();

    await visit('/docautoscroll?direction=x');

    let itemWidth = () => {
      let item = find('[data-test-doc-auto-scroll-demo-item]');
      const itemStyle = item.currentStyle || window.getComputedStyle(item);
      return item.offsetWidth + parseInt(itemStyle.marginLeft);
    };

    await drag('mouse', '[data-test-doc-auto-scroll-demo-item]', () => {
      return { dy: undefined, dx: itemWidth() * 30 + 1 };
    });
    assert.ok(document.documentElement.scrollLeft, 'The document has scroll (left)');
    restoreTestingContainer();
  });
});
