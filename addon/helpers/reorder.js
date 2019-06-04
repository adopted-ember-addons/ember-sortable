import { registerAsyncHelper } from '@ember/test';
import { settled, findAll } from '@ember/test-helpers';
import { drag } from '../helpers/drag';
import { getOffset } from '../helpers/native';

/**
  In tests, the dummy app is rendered at half size.
  To avoid rounding errors, we must therefore double
  the overshoot.
*/
const OVERSHOOT = 2;

/**
  Reorders elements to the specified state.

  Examples

      reorder(
        'mouse',
        '.some-list li',
        '[data-id="66278893"]',
        '[data-id="66278894"]',
        '[data-id="66278892"]'
      );

  @method reorder
  @param {'mouse'|'touch'} [mode]
    event mode
  @param {String} [itemSelector]
    selector for all items
  @param {...String} [resultSelectors]
    selectors for the resultant order
  @return {Promise}
*/

export async function reorder(mode, itemSelector, ...resultSelectors) {
  await settled();

  resultSelectors.forEach(async (selector, targetIndex) => {
    const items = findAll(itemSelector);
    const element = items.filter(item => item.matches(selector))[0];
    const targetElement = items[targetIndex];
    const dx = getOffset(targetElement).left - OVERSHOOT - getOffset(element).left;
    const dy = getOffset(targetElement).top - OVERSHOOT - getOffset(element).top;
    await drag(mode, element, () => { return { dx: dx, dy: dy }; });
  });

  await settled();
}

/**
  Reorders elements to the specified state.

  Examples

      deprecatedReorder(
        'mouse',
        '.some-list li',
        '[data-id="66278893"]',
        '[data-id="66278894"]',
        '[data-id="66278892"]'
      );

  @method reorder
  @param {'mouse'|'touch'} [mode]
    event mode
  @param {String} [itemSelector]
    selector for all items
  @param {...String} [resultSelectors]
    selectors for the resultant order
  @return {Promise}
*/

function deprecatedReorder(app, mode, itemSelector, ...resultSelectors) {
  const {
    andThen,
    findWithAssert,
    drag: deprecatedDrag,
    wait
  } = app.testHelpers;

  resultSelectors.forEach((selector, targetIndex) => {
    andThen(() => {
      let items = findWithAssert(itemSelector);
      let element = items.filter(selector);
      let targetElement = items.eq(targetIndex);
      let dx = targetElement.offset().left - OVERSHOOT - element.offset().left;
      let dy = targetElement.offset().top - OVERSHOOT - element.offset().top;

      deprecatedDrag(mode, element, () => { return { dx: dx, dy: dy }; });
    });
  });

  return wait();
}

export default registerAsyncHelper('reorder', deprecatedReorder);
