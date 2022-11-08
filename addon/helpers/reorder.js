import { registerAsyncHelper } from '@ember/test';
import { findAll } from '@ember/test-helpers';
import { drag } from '@gynzy/ember-sortable/helpers/drag';

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
  for (let targetIndex = 0; targetIndex < resultSelectors.length; targetIndex++) {
    const selector = resultSelectors[targetIndex];
    let items = findAll(itemSelector);
    let element;
    if (selector.startsWith(':contains')) {
      element = items.filter((item) => {
        const text = selector.replace(':contains(', '').replace(')', '');
        return RegExp(text).test(item.textContent);
      })[0];
    } else {
      element = findAll(`${itemSelector}${selector}`)[0];
    }
    let targetElement = items[targetIndex];

    let dx = targetElement.getBoundingClientRect().left - OVERSHOOT - element.getBoundingClientRect().left;
    let dy = targetElement.getBoundingClientRect().top - OVERSHOOT - element.getBoundingClientRect().top;
    await drag(mode, element, () => {
      return { dx: dx, dy: dy };
    });
  }
}

export default registerAsyncHelper('reorder', reorder);
