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
    @method sortableReset
  */
  sortableReset() {
    this.set('sortableState', null);
    this.sortableChildren.forEach(child => {
      child.sortableReset();
    });
  },

  /**
    @method sortableSeek
    @param {SortableNode}
  */
  sortableSeek(node) {
    if (withinBounds(this, node)) {
      let child = this.sortableChildren.find(child => {
        return child !== node && withinBounds(child, node);
      });

      if (child) {
        child.sortableSeek(node);
      } else {
        this.set('sortableState', 'sortable-receiving');
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
        root(this).sortableReset();
        root(this).sortableSeek(this);
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
      root(this).sortableReset();
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
  let { top, left, bottom, right } = getBounds(parent.element);
  let { x, y } = getCursor(child);

  return left <= x && x <= right && top <= y && y <= bottom;
}

/**
  @private
  @method getBounds
  @param {HTMLElement} element
  @return {Object} { top, left, bottom, right }
*/
function getBounds(element) {
  let $el = $(element);
  let { left, top } = $el.offset();
  let right = left + $el.outerWidth();
  let bottom = top + $el.outerHeight();

  return { top, left, bottom, right };
}

/**
  @private
  @method getCursor
  @param {SortableNode} node
  @return {Object} { x, y }
*/
function getCursor(node) {
  return node._sortableStateMachine;
}

function root(node) {
  let result = node;
  while (result.sortableParent) { result = result.sortableParent; }
  return result;
}
