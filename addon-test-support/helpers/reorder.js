import { find, findAll } from '@ember/test-helpers';
import { drag } from './drag';
import { getOffset } from '../utils/offset';

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
  for (
    let targetIndex = 0;
    targetIndex < resultSelectors.length;
    targetIndex++
  ) {
    const items = findAll(itemSelector);
    const sourceElement = find(resultSelectors[targetIndex]);
    const targetElement = items[targetIndex];
    const dx =
      getOffset(targetElement).left - OVERSHOOT - getOffset(sourceElement).left;
    const dy =
      getOffset(targetElement).top - OVERSHOOT - getOffset(sourceElement).top;

    await drag(mode, sourceElement, () => {
      return { dx: dx, dy: dy };
    });
  }
}
