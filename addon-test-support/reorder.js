import { findAll } from '@ember/test-helpers';
import drag from './drag';

export default async function reorder(mode, itemSelector, ...resultSelectors) {
  const items = findAll(itemSelector);

  await resultSelectors.reduce(async (acc, selector, targetIndex) => {
    await acc;

    const element = items.find(item => item.matches(selector));
    const targetElement = items[targetIndex];
    const dx = targetElement.offsetLeft - element.offsetLeft;
    const dy = targetElement.offsetTop - element.offsetTop;

    if (dx === 0 && dy === 0) {
      return Promise.resolve();
    }

    return drag(mode, element, () => ({ dx, dy }));
  }, Promise.resolve());
}
