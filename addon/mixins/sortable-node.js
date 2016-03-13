import Ember from 'ember';
import DraggableStateMachine from '../utils/draggable-state-machine';
import willTransition from '../utils/will-transition';
import transitionend from '../utils/transitionend';
import getBounds from '../utils/get-bounds';
const { Mixin, run: { scheduleOnce } } = Ember;

/**
  @class SortableNode
  @constructor
*/
export default Mixin.create({

  classNameBindings: ['sortableState'],

  /**
    @property sortableModel
    @type Any
    @default null
  */
  sortableModel: null,

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
    this._super(...arguments);

    delete this.sortableParent;
    delete this.sortableChildren;
  },

  /**
    @method touchStart
    @param {jQuery.Event} event
  */
  touchStart(event) {
    this._super(...arguments);

    event.stopPropagation();

    this._sortableStart(event);
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

  // === Private ===

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
    let root = getRoot(this);

    if (state === 'dragging') {
      resetTree(root);
      seek(root, this);
    }

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
      resetTree(getRoot(this));
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
  @method getCursor
  @param {SortableNode} node
  @return {Object} { x, y }
*/
function getCursor(node) {
  return node._sortableStateMachine;
}

/**
  @private
  @method getRoot
  @param {SortableNode} node
  @return {SortableNode}
*/
function getRoot(node) {
  let result = node;
  while (result.sortableParent) { result = result.sortableParent; }
  return result;
}

/**
  @private
  @method resetTree
  @param {SortableNode} root
*/
function resetTree(root) {
  root.set('sortableState', null);
  root.sortableChildren.forEach(resetTree);
}

/**
  @private
  @method seek
  @param {SortableNode} root
*/
function seek(root, node) {
  if (withinBounds(root, node)) {
    let child = root.sortableChildren.find(child => {
      return child !== node && withinBounds(child, node);
    });

    if (child) {
      seek(child, node);
    } else {
      root.set('sortableState', 'sortable-receiving');
    }
  }
}
