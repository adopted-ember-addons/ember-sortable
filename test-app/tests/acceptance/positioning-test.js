import { module, test } from 'qunit';
import { visit, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { drag } from 'ember-sortable/test-support';

async function assertPositionsStable(assert, itemElements) {
  const initialPositions = new WeakMap();
  const [firstElement] = itemElements;

  itemElements.forEach((element) =>
    initialPositions.set(element, element.getBoundingClientRect()),
  );

  await drag('mouse', firstElement, () => ({ dx: 20, dy: 20 }), {
    beforedragend() {
      itemElements.forEach((element) => {
        const initialPosition = initialPositions.get(element);
        const currentPosition = element.getBoundingClientRect();

        if (element === firstElement) {
          assert.notDeepEqual(
            currentPosition,
            initialPosition,
            'the dragged item moved',
          );
        } else {
          assert.deepEqual(
            currentPosition,
            initialPosition,
            'the item did not move',
          );
        }
      });
    },
  });
}

module('Acceptance | positioning with gap', function (hooks) {
  setupApplicationTest(hooks);

  test('correctly positions items vertically when there is no gap', async function (assert) {
    assert.expect(5);

    await visit('/');

    const containerElement = find('[data-test-vertical-demo-group]');
    const itemElements = Array.from(
      containerElement.querySelectorAll(
        '[data-test-vertical-demo-item] .handle',
      ),
    );

    await assertPositionsStable(assert, itemElements);
  });

  test('correctly positions items vertically when there is a gap', async function (assert) {
    assert.expect(5);

    await visit('/');

    const containerElement = find('[data-test-vertical-demo-group]');
    const itemElements = Array.from(
      containerElement.querySelectorAll(
        '[data-test-vertical-demo-item] .handle',
      ),
    );

    Object.assign(containerElement.style, {
      display: 'grid',
      rowGap: '20px',
      columnGap: '10px',
      gridTemplateColumns: '1fr',
    });

    await assertPositionsStable(assert, itemElements);
  });

  test('correctly positions items horizontally when there is no gap', async function (assert) {
    assert.expect(5);

    await visit('/');

    const containerElement = find('[data-test-horizontal-demo-group]');
    const itemElements = Array.from(
      containerElement.querySelectorAll('[data-test-horizontal-demo-handle]'),
    );

    await assertPositionsStable(assert, itemElements);
  });

  test('correctly positions items horizontally when there is a gap', async function (assert) {
    assert.expect(5);

    await visit('/');

    const containerElement = find('[data-test-horizontal-demo-group]');
    const itemElements = Array.from(
      containerElement.querySelectorAll('[data-test-horizontal-demo-handle]'),
    );

    Object.assign(containerElement.style, {
      display: 'grid',
      rowGap: '20px',
      columnGap: '10px',
      gridTemplateColumns: 'repeat(5, 1fr)',
    });

    await assertPositionsStable(assert, itemElements);
  });

  test('correctly positions items in a grid when there is no gap', async function (assert) {
    assert.expect(26);

    await visit('/');

    const containerElement = find('[data-test-grid-demo-group]');
    const itemElements = Array.from(
      containerElement.querySelectorAll('[data-test-grid-demo-handle]'),
    );

    await assertPositionsStable(assert, itemElements);
  });

  test('correctly positions items in a grid when there is a gap', async function (assert) {
    assert.expect(26);

    await visit('/');

    const containerElement = find('[data-test-grid-demo-group]');
    const itemElements = Array.from(
      containerElement.querySelectorAll('[data-test-grid-demo-handle]'),
    );

    Object.assign(containerElement.style, {
      rowGap: '20px',
      columnGap: '10px',
    });

    await assertPositionsStable(assert, itemElements);
  });
});
