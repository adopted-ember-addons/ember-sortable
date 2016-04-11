import Gesture from './gesture';
import Arrangement from './arrangement';
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
    this.schedule(() => this.renderDrag());
  }

  drop() {
    this.node.set('sortableState', 'dropping');
    this.schedule(() => this.renderDrop());
  }

  schedule(func) {
    schedule('afterRender', func);
  }

  renderDrag() {
    let { dx, dy } = this.gesture;
    let { element: { style } } = this.node;

    this.arrangement.render();

    style.transform = `translate(${dx}px, ${dy}px)`;
  }

  renderDrop() {
    this.arrangement.render();

    if (this.willTransition()) {
      this.node.$().one(transitionend, () => this.completeDrop());
    } else {
      this.completeDrop();
    }
  }

  completeDrop() {
    let { parent, position } = this.arrangement.metaFor(this.node);
    this.walk(n => n.set('sortableState', null));
    this.arrangement.freeze();
    requestAnimationFrame(() => {
      this.onComplete(parent, position);
      schedule('afterRender', () => {
        this.arrangement.clear();
        this.arrangement.thaw();
      });
    });
  }

  cancel() {
    this.onCancel();
  }

  walk(func) {
    walk(this.root, func);
  }

  willTransition() {
    let { dx, dy } = this.arrangement.slotForNode(this.node);
    let isOffset = dx !== this.gesture.dx || dy !== this.gesture.dy;

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
