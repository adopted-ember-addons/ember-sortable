import Ember from 'ember';
import DragStateMachine from 'ember-sortable/drag-state-machine';
const { $, Mixin, run: { next, schedule } } = Ember;

/**
 * @class SortableNode
 * @constructor
 */
export default Mixin.create({
  classNameBindings: ['sortableState'],

  /**
   * @method mouseDown
   * @param {jQuery.Event} event
   */
  mouseDown(event) {
    this._super(...arguments);

    if (event.which !== 1) { return; }
    if (event.ctrlKey) { return; }

    event.stopPropagation();

    this._sortableStart(event);
  },

  /**
   * @method touchStart
   * @param {jQuery.Event} event
   */
  touchStart(event) {
    this._super(...arguments);

    event.stopPropagation();

    this._sortableStart(event);
  },

  /**
   * @private
   * @method _sortableStart
   * @param {jQuery.Event} event
   */
  _sortableStart({ originalEvent }) {
    if (this._sortableStateMachine) { return; }

    this._sortableStateMachine = new DragStateMachine(() => {
      this._sortableUpdate();
    });

    this._sortableStateMachine.start(originalEvent);
  },

  /**
   * @private
   * @method _sortableUpdate
   */
  _sortableUpdate() {
    let { state } = this._sortableStateMachine;
    this.set('sortableState', `sortable-${state}`);
    schedule('afterRender', this, '_sortableAfterRender');
  },

  /**
   * @private
   * @method _sortableAfterRender
   */
  _sortableAfterRender() {
    let { state, dx, dy } = this._sortableStateMachine;

    switch (state) {
      case 'dragging':
        this.$().css('transform', `translate(${dx}px, ${dy}px)`);
        break;
      case 'swiped':
      case 'clicked':
      case 'dropped':
        this.$().css('transform', '');
        next(() => this._sortableComplete());
        break;
    }
  },

  /**
   * @private
   * @method _sortableComplete
   */
  _sortableComplete() {
    let { dx, dy } = this._sortableStateMachine;
    let isOffset = dx > 0 || dy > 0;

    let complete = () => {
      delete this._sortableStateMachine;
      this.set('sortableState', null);
    };

    if (willTransition(this.element) && isOffset) {
      this.$().one('transitionend', complete);
    } else {
      complete();
    }
  }

});

/**
 * @private
 * @method willTransition
 * @param {HTMLElement} el
 * @return {Boolean}
 */
function willTransition(el) {
  return transitionDuration(el) > 0;
}

/**
 * @private
 * @method transitionDuration
 * @param {HTMLElement} el
 * @return {Number}
 */
function transitionDuration(el) {
  let value = $(el).css('transition');
  let match = value.match(/(all|transform) ([\d\.]+)([ms]*)/);

  if (match) {
    let magnitude = parseFloat(match[2]);
    let unit = match[3];

    if (unit === 's') {
      magnitude *= 1000;
    }

    return magnitude;
  }

  return 0;
}
