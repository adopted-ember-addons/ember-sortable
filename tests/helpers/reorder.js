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
  let start, move, end;

  if (mode === 'mouse') {
    start = 'mousedown';
    move = 'mousemove';
    end = 'mouseup';
  } else if (mode === 'touch') {
    start = 'touchstart';
    move = 'touchmove';
    end = 'touchend';
  } else {
    throw new Error(`Unsupported mode: '${mode}'`);
  }

  resultSelectors.forEach((selector, targetIndex) => {
    andThen(() => {
      let items = findWithAssert(itemSelector);
      let element = items.filter(selector);
      let targetElement = items.eq(targetIndex);

      triggerEvent(element, start, {
        pageX: element.offset().left,
        pageY: element.offset().top
      });
      triggerEvent(element, move, {
        pageX: element.offset().left,
        pageY: element.offset().top
      });
      triggerEvent(element, move, {
        pageX: targetElement.offset().left - 1,
        pageY: targetElement.offset().top - 1
      });
      triggerEvent(element, end, {
        pageX: targetElement.offset().left - 1,
        pageY: targetElement.offset().top - 1
      });
    });
  });

  return wait();
}

export default Ember.Test.registerAsyncHelper('reorder', reorder);
