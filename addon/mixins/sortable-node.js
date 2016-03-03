import Ember from 'ember';
import DraggableStateMachine from '../utils/draggable-state-machine';
import transitionend from '../utils/transitionend';
const { $, Mixin, run: { scheduleOnce } } = Ember;

/**
  @class SortableNode
  @constructor
*/
export default Mixin.create({

  classNameBindings: ['sortableState'],

  /**
    @property model
    @type Any
    @default null
  */
  model: null,

  /**
    @property sortableParent
    @type SortableNode|null
    @default null
  */
  sortableParent: null,

  /**
    @property sortableChildren
    @type Array
    @default []
  */
  sortableChildren: null,

  /**
    @constructor
  */
  init() {
    this._super(...arguments);

    if (this.sortableParent) {
      this.sortableParent.sortableChildren.push(this);
    }

    this.sortableChildren = [];
  },

  /**
    @method willDestroy
  */
  willDestroy() {
    delete this.sortableParent;
    delete this.sortableChildren;
  },

  /**
    @method sortableSeekUp
    @param {SortableNode}
  */
  sortableSeekUp(node) {
    if (this.sortableParent) {
      this.sortableParent.sortableSeekUp(node);
    } else {
      this.sortableSeekDown(node);
    }
  },

  /**
    @method sortableSeekDown
    @param {SortableNode}
  */
  sortableSeekDown(node) {
    if (withinBounds(this, node)) {
      let child = this.sortableChildren.find(child => {
        return child !== node && withinBounds(child, node);
      });

      if (child) {
        child.sortableSeekDown(node);
      } else {
        console.log(`Attempting to place ${node.model.label} within ${this.model.label}`);
      }
    }
  },

  /**
    @method mouseDown
    @param {jQuery.Event} event
  */
  mouseDown(event) {
    this._super(...arguments);

    if (event.which !== 1) { return; }
    if (event.ctrlKey) { return; }

    event.preventDefault();
    event.stopPropagation();

    this._sortableStart(event);
  },

  /**
    @method touchStart
    @param {jQuery.Event} event
  */
  touchStart(event) {
    this._super(...arguments);

    event.preventDefault();
    event.stopPropagation();

    this._sortableStart(event);
  },

  /**
    @private
    @method _sortableStart
    @param {jQuery.Event} event
  */
  _sortableStart({ originalEvent }) {
    if (this._sortableStateMachine) { return; }

    this._sortableStateMachine = new DraggableStateMachine(() => {
      this._sortableSync();
    });

    this._sortableStateMachine.start(originalEvent);
  },

  /**
    @private
    @method _sortableSync
  */
  _sortableSync() {
    let { state } = this._sortableStateMachine;

    this.set('sortableState', `sortable-${state}`);

    scheduleOnce('afterRender', this, '_sortableAfterRender');
  },

  /**
    @private
    @method _sortableAfterRender
  */
  _sortableAfterRender() {
    let { state, dx, dy } = this._sortableStateMachine;

    switch (state) {
      case 'dragging':
        this.$().css('transform', `translate(${dx}px, ${dy}px)`);

        if (this.sortableParent) {
          this.sortableParent.sortableSeekUp(this);
        }
        break;
      case 'swiping':
      case 'clicking':
      case 'dropping':
        this.$().css('transform', '');
        this._sortableComplete();
        break;
    }
  },

  /**
    @private
    @method _sortableComplete
  */
  _sortableComplete() {
    let { dx, dy } = this._sortableStateMachine;
    let isOffset = dx !== 0 || dy !== 0;

    let complete = () => {
      delete this._sortableStateMachine;
      this.set('sortableState', null);
    };

    if (isOffset && willTransition(this.element)) {
      this.$().one(transitionend, complete);
    } else {
      complete();
    }
  }

});

/**
  @private
  @method willTransition
  @param {HTMLElement} el
  @return {Boolean}
*/
function willTransition(el) {
  return transitionDuration(el) > 0;
}

/**
  @private
  @method transitionDuration
  @param {HTMLElement} el
  @return {Number}
*/
function transitionDuration(el) {
  $(el).height(); // force re-flow

  let value = $(el).css('transition');
  let match = value.match(/(all|transform) ([\d\.]+)([ms]*)/);

  if (match) {
    let magnitude = parseFloat(match[2]);
    let unit = match[3];

    if (unit === 's') { magnitude *= 1000; }

    return magnitude;
  } else {
    return 0;
  }
}

/**
  @private
  @method withinBounds
  @param {SortableNode} parent
  @param {SortableNode} child
  @return {Boolean}
*/
function withinBounds(parent, child) {
  let { left: xMin, top: yMin } = parent.$().offset();
  let xMax = xMin + parent.$().outerWidth();
  let yMax = yMin + parent.$().outerHeight();
  let { left: x, top: y } = child.$().offset();

  return xMin < x && x < xMax && yMin < y && y < yMax;
}
