import Gesture from './gesture';
import Arrangement from './arrangement';
import willTransition from './will-transition';
import transitionend from './transitionend';

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
    this.arrangement = new Arrangement(this.root);
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
    this.node.set('sortableState', 'dragging');

    this.arrangement.moveNode(this.node, this.gesture);

    requestAnimationFrame(() => this.renderDrag());
  }

  drop() {
    this.node.set('sortableState', 'dropping');

    requestAnimationFrame(() => this.renderDrop());
  }

  renderDrag() {
    let { dx, dy } = this.gesture;
    let { element: { style } } = this.node;

    this.arrangement.render();

    style.transform = `translate(${dx}px, ${dy}px)`;
  }

  renderDrop() {
    this.arrangement.clear();

    if (this.willTransition()) {
      this.node.$().one(transitionend, () => this.completeDrop());
    } else {
      this.completeDrop();
    }
  }

  completeDrop() {
    this.walk(n => n.set('sortableState', null));
    let { parent, position } = this.arrangement.metaFor(this.node);
    this.onComplete(parent, position);
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
