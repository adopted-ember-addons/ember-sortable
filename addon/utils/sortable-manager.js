import Ember from 'ember';
const { run: { scheduleOnce } } = Ember;
import DraggableStateMachine from './draggable-state-machine';
import willTransition from './will-transition';
import transitionend from './transitionend';

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
    this.draggable = new DraggableStateMachine(() => this.sync());
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
    this.draggable.start(event);
  }

  /**
    @method sync
  */
  sync() {
    let { state } = this.draggable;

    this.node.set('sortableState', `sortable-${state}`);

    scheduleOnce('afterRender', this, 'afterRender');
  }

  /**
    @private
    @method afterRender
  */
  afterRender() {
    let { state, dx, dy } = this.draggable;

    switch (state) {
      case 'dragging':
        this.node.$().css('transform', `translate(${dx}px, ${dy}px)`);
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
    @method complete
  */
  complete() {
    let { dx, dy } = this.draggable;
    let isOffset = dx !== 0 || dy !== 0;

    let complete = () => {
      this.node.set('sortableState', null);
      if (this.onComplete) { this.onComplete(); }
    };

    if (isOffset && willTransition(this.node.element)) {
      this.node.$().one(transitionend, complete);
    } else {
      complete();
    }
  }

}
