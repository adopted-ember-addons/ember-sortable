import Ember from 'ember';

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

export function reorder(_app, mode, itemSelector, ...resultSelectors) {
  resultSelectors.forEach((selector, targetIndex) => {
    andThen(() => {
      let items = findWithAssert(itemSelector);
      let element = items.filter(selector);
      let targetElement = items.eq(targetIndex);
      let dx = targetElement.offset().left - 1 - element.offset().left;
      let dy = targetElement.offset().top - 1 - element.offset().top;

      drag(mode, element, () => { return { dx: dx, dy: dy }; });
    });
  });

  return wait();
}

export default Ember.Test.registerAsyncHelper('reorder', reorder);
