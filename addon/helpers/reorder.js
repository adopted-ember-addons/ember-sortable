import { settled } from "@ember/test-helpers";
import { defer, resolve } from "rsvp";
import drag from "./drag";
import $ from "jquery";
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

const promiseMap = (arr, iteratee) => {
  const deferred = defer();
  const res = [];
  let pos = 0;
  const runIteratee = () => {

    if (!arr.length) {
      return resolve()
    }

    let item = arr.splice(0, 1)[0];
    return iteratee(item, pos).then(result => {
      res.push(result);
      pos++;
      if (arr.length) {
        return runIteratee();
      }
    });
  };

  return runIteratee().then(
    () => {
      deferred.resolve(res);
    },
    err => {
      deferred.reject(err);
    }
  );
};

export async function reorder(mode, itemSelector, ...resultSelectors) {
  // await settled()

  await promiseMap(resultSelectors, async (selector, targetIndex) => {
    await settled();
    let items = $(itemSelector);
    let element = $(`${itemSelector}${selector}`);
    let targetElement = items.eq(targetIndex);
    let dx = targetElement.offset().left - OVERSHOOT - element.offset().left;
    let dy = targetElement.offset().top - OVERSHOOT - element.offset().top;
    await drag(mode, element, () => {
      return { dx, dy };
    });
  });
}

export default reorder;
