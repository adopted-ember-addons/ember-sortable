import Gesture from './gesture';
import willTransition from './will-transition';
import transitionend from './transitionend';
import Ember from 'ember';

const { run: { schedule } } = Ember;

/**
  @class Manager
  @constructor
  @param {SortableNode} options.node
  @param {Function} options.onComplete
*/
export default class Manager {

  constructor({ node, onComplete, onCancel }) {
    this.node = node;
    this.root = getRoot(this.node);
    this.onComplete = onComplete || function() {};
    this.onCancel = onCancel || function() {};
    this.gesture = new Gesture(() => this.update());
  }

  start(event) {
    this.gesture.start(event);
  }

  update() {
    switch (this.gesture.state) {
      case 'dragging':
        this.drag();
        break;
      case 'dropping':
        this.drop();
        break;
      case 'clicking':
      case 'swiping':
        this.cancel();
        break;
    }
  }

  drag() {
    let { dx, dy } = this.gesture;

    this.node.set('sortableState', 'dragging');
    this.node.$().css('transform', `translate(${dx}px, ${dy}px)`);
  }

  drop() {
    this.node.set('sortableState', 'dropping');
    schedule('afterRender', this, 'renderDrop');
  }

  renderDrop() {
    this.node.$().css('transform', '');

    if (this.willTransition()) {
      this.node.$().one(transitionend, () => this.completeDrop());
    } else {
      this.completeDrop();
    }
  }

  completeDrop() {
    this.walk(n => n.set('sortableState', null));
    this.onComplete(this.root, 0);
  }

  cancel() {
    this.onCancel();
  }

  walk(func) {
    walk(this.root, func);
  }

  willTransition() {
    let { dx, dy } = this.gesture;
    let isOffset = dx !== 0 || dy !== 0;

    return isOffset && willTransition(this.node.element);
  }

}

function getRoot(node) {
  let root = node;
  while (root.sortableParent) { root = root.sortableParent; }
  return root;
}

function walk(node, func) {
  func(node);
  node.sortableChildren.forEach(n => walk(n, func));
}
