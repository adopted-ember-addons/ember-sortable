import Ember from 'ember';
const { Mixin, run: { bind } } = Ember;

const THRESHOLD = 50; // ms

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
    let machine = new SortableStateMachine();

    machine.onUpdate = bind(this, '_sortableUpdate');

    machine.start(originalEvent);
  },

  /**
   * @private
   * @method _sortableUpdate
   * @param {SortableStateMachine} machine
   */
  _sortableUpdate({ state, dx, dy }) {
    this.set('sortableState', `sortable-${state}`);

    switch (state) {
      case 'dragging':
        this.$().css('transform', `translate(${dx}px, ${dy}px)`);
        break;
      case 'dropped':
        this.$().css('transform', '');
        break;
    }
  }

});

/**
 * @class SortableStateMachine
 * @constructor
 */
class SortableStateMachine {

  constructor() {
    this.state = 'default';
    this.ot = 0;
    this.ox = 0;
    this.oy = 0;
    this.dx = 0;
    this.dy = 0;
  }

  /**
   * @method start
   * @param {UIEvent} event
   */
  start(event) {
    this.state = 'waiting';
    this.ot = Date.now();
    this.ox = event.pageX;
    this.oy = event.pageY;

    this._move = bind(this, 'move');
    this._stop = bind(this, 'stop');

    on('mousemove', this._move);
    on('touchmove', this._move);
    on('mouseup', this._stop);
    on('touchend', this._stop);

    this.onUpdate(this);
  }

  /**
   * @method move
   * @param {UIEvent} event
   */
  move(event) {
    switch (this.state) {
      case 'waiting':
        let isTouch = event instanceof window.TouchEvent;
        let isTooFast = Date.now() - this.ot < THRESHOLD;

        if (isTouch && isTooFast) {
          this.state = 'swiping';
          this.stop();
        } else {
          this.state = 'dragging';
          this.move(event);
        }

        break;
      case 'dragging':
        event.preventDefault();

        this.dx = event.pageX - this.ox;
        this.dy = event.pageY - this.oy;

        this.onUpdate(this);

        break;
    }
  }

  /**
   * @method stop
   * @param {null|UIEvent} event
   */
  stop() {
    off('mousemove', this._move);
    off('touchmove', this._move);
    off('mouseup', this._stop);
    off('touchend', this._stop);

    switch (this.state) {
      case 'waiting':
        this.state = 'clicked';
        break;
      case 'dragging':
        this.state = 'dropped';
        preventClick();
        break;
    }

    this.onUpdate(this);

    delete this.onUpdate;
  }

  /**
   * @method onUpdate
   * @param {SortableStateMachine} machine
   */
  onUpdate() {}
}

function on(event, callback) {
  window.addEventListener(event, callback, true);
}

function off(event, callback) {
  window.removeEventListener(event, callback, true);
}

function preventClick() {
  let noclick = event => {
    event.stopPropagation();
    window.removeEventListener('click', noclick, true);
  };
  window.addEventListener('click', noclick, true);
}
