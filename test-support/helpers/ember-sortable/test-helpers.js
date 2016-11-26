/**
 * @module ember-sortable
 * @class Test Helpers
 */

 /**
  * Drags elements by an offset specified in pixels.
  * Example:
  *
  * ```js
  * drag(
  *   'mouse',
  *   '.some-list li[data-item=uno]',
  *   function() {
  *     return { dy: 50, dx: 20 };
  *   }
  * );
  * ```
  *
  * @method drag
  * @public
  * @param {Ember.Application} app
  * @param {'mouse'|'touch'} mode event mode
  * @param {String} itemSelector selector for the element to drag
  * @param {Function} offsetFn function returning the offset by which to drag
  * @param {Object} callbacks callbacks that are fired at the different stages of the interaction
  *
  * @return {Promise}
  */

import 'ember-sortable/helpers/drag';

/**
 * Reorders elements to the specified state.
 *
 * Example:

```js
reorder(
  'mouse',
  '.some-list li',
  '[data-id="66278893"]',
  '[data-id="66278894"]',
  '[data-id="66278892"]'
);
```
 * @method reorder
 * @public
 * @param {Ember.Application} app
 * @param {'mouse'|'touch'} mode event mode
 * @param {String} itemSelector selector for all items
 * @param {String} [...resultSelectors] selectors for the resultant order
 * @return {Promise}
 */

import 'ember-sortable/helpers/reorder';
