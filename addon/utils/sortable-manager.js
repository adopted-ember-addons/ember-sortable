import Ember from 'ember';
const { get, run: { scheduleOnce }, typeOf } = Ember;
import DraggableStateMachine from './draggable-state-machine';
import willTransition from './will-transition';
import transitionend from './transitionend';
import getBounds from './get-bounds';

/**
  @class SortableManager
  @constructor
  @param {SortableNode} options.node
  @param {Function} options.onComplete
*/
export default class SortableManager {

  constructor({ node, onComplete }) {
    this.node = node;
    this.onComplete = onComplete;
    this.machine = new DraggableStateMachine(() => this.sync());
  }

  /**
    @property node
    @type SortableNode
  */

  /**
    @property onComplete
    @type Function
  */

  /**
    @method start
    @param {UIEvent} event
  */
  start(event) {
    this.machine.start(event);
  }

  /**
    @private
    @method sync
  */
  sync() {
    let { state } = this.machine;

    this.cascade(n => n.set('sortableState', null));
    this.node.set('sortableState', `sortable-${state}`);
    this.receiver = this.findReceiver();

    if (this.receiver) {
      this.receiver.set('sortableState', `sortable-receiving`);
    }

    scheduleOnce('afterRender', this, 'afterRender');
  }

  /**
    @private
    @method afterRender
  */
  afterRender() {
    let { state, dx, dy } = this.machine;

    switch (state) {
      case 'dragging':
        this.node.$().css('transform', `translate(${dx}px, ${dy}px)`);
        this.arrange();
        break;
      case 'swiping':
      case 'clicking':
      case 'dropping':
        this.node.$().css('transform', '');
        this.complete();
        break;
    }
  }

  /**
    @private
    @method arrange
  */
  arrange() {
    // TODO
  }

  /**
    @private
    @method complete
  */
  complete() {
    let { dx, dy } = this.machine;
    let isOffset = dx !== 0 || dy !== 0;

    let complete = () => {
      this.cascade(n => n.set('sortableState', null));
      if (this.onComplete) {
        this.onComplete(this.receiver, 0);
      }
    };

    if (isOffset && willTransition(this.node.element)) {
      this.node.$().one(transitionend, complete);
    } else {
      complete();
    }
  }

  /**
    @private
    @method findReceiver
    @return {SortableNode}
  */
  findReceiver() {
    return findReceiver([this.root()], this.node, this.machine);
  }

  /**
    @private
    @method root
    @return {SortableNode}
  */
  root() {
    let result = this.node;
    while (result.sortableParent) { result = result.sortableParent; }
    return result;
  }

  /**
    Call `func` for each node in the tree.
    @private
    @method cascade
    @param {Function} func
  */
  cascade(func) {
    treeEach(this.root(), func);
  }
}

/**
  @private
  @method findReceiver
  @param {Array} candidates
  @param {SortableNode} node
  @param {Point} position
  @return {SortableNode}
*/
function findReceiver(candidates, node, position) {
  let receiver = candidates.find(candidate => {
    if (candidate === node) { return false; }
    if (!withinBounds(candidate, position)) { return false; }
    let hook = get(candidate, 'canReceiveSortable');
    let type = typeOf(hook);
    if (type === 'function') { return hook.call(candidate, node); }
    if (type === 'boolean') { return hook; }

    return true;
  });

  if (receiver) {
    return findReceiver(receiver.sortableChildren, node, position) || receiver;
  }
}

/**
  @private
  @method withinBounds
  @param {SortableNode} node
  @param {Object} point
*/
function withinBounds(node, { x, y }) {
  let { top, left, bottom, right } = getBounds(node.element);
  return left <= x && x <= right && top <= y && y <= bottom;
}

/**
  Depth-first recursive tree-traversing each.
  @private
  @method treeEach
  @param {SortableNode} node
  @param {Function} func
*/
function treeEach(node, func) {
  func(node);
  node.sortableChildren.forEach(child => treeEach(child, func));
}
