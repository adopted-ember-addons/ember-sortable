import { find, findAll } from '@ember/test-helpers';
import { drag, type TMode } from './drag.ts';
import { getOffset } from '../utils/offset.ts';

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
export async function reorder<T extends keyof HTMLElementTagNameMap>(
  mode: TMode,
  itemSelector: string,
  ...resultSelectors: T[]
) {
  for (let targetIndex = 0; targetIndex < resultSelectors.length; targetIndex++) {
    const items = findAll(itemSelector);
    const result = resultSelectors[targetIndex];
    if (!result) {
      throw new Error(`TargetElement not found!`);
    }

    const sourceElement = find(result);

    if (!sourceElement) {
      throw new Error(`SourceElement not found!`);
    }

    const targetElement = items[targetIndex];

    if (!targetElement) {
      throw new Error(`TargetElement not found!`);
    }

    const dx = getOffset(targetElement).left - OVERSHOOT - getOffset(sourceElement).left;
    const dy = getOffset(targetElement).top - OVERSHOOT - getOffset(sourceElement).top;

    await drag(mode, result, () => {
      return { dx: dx, dy: dy };
    });
  }
}