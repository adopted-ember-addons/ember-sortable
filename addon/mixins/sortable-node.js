import Ember from 'ember';
const { Mixin } = Ember;

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

    machine.onUpdate = machine => this._sortableUpdate(machine);

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
    this.listeners = [];
  }

  /**
   * @method start
   * @param {UIEvent} event
   */
  start(event) {
    switch (this.state) {
      case 'default':
        this.defaultStart(event);
    }
  }

  /**
   * @method defaultStart
   * @param {UIEvent} event
   */
  defaultStart(event) {
    this.state = 'waiting';
    this.ot = Date.now();

    let touch = event.changedTouches && event.changedTouches[0];

    if (touch) {
      let id = touch.identifier;

      this.ox = touch.pageX;
      this.oy = touch.pageY;

      this.on('touchmove', touchbind(id, (e, t)  => this.move(e, t)));
      this.on('touchend', touchbind(id, () => this.stop()));
    } else {
      this.ox = event.pageX;
      this.oy = event.pageY;

      this.on('mousemove', e => this.move(e));
      this.on('mouseup', e => this.stop(e));
    }

    this.onUpdate(this);
  }


  /**
   * @method move
   * @param {UIEvent} event
   * @param {Touch} [touch]
   */
  move(event, touch) {
    switch (this.state) {
      case 'waiting':
        this.waitingMove(event, touch);
        break;
      case 'dragging':
        this.draggingMove(event, touch);
        break;
    }
  }

  /**
   * @method waitingMove
   * @param {UIEvent} event
   * @param {Touch|null} [touch]
   */
  waitingMove(event, touch) {
    let isTooFast = touch && (Date.now() - this.ot < THRESHOLD);

    if (isTooFast) {
      this.state = 'swiping';
      this.onUpdate(this);
      this.destroy();
    } else {
      this.state = 'dragging';
      this.move(event);
    }
  }

  /**
   * @method draggingMove
   * @param {UIEvent} event
   * @param {Touch} [touch]
   */
  draggingMove(event, touch) {
    event.preventDefault();

    this.dx = (touch || event).pageX - this.ox;
    this.dy = (touch || event).pageY - this.oy;

    this.onUpdate(this);
  }

  /**
   * @method stop
   */
  stop() {
    switch (this.state) {
      case 'waiting':
        this.waitingStop();
        break;
      case 'dragging':
        this.draggingStop();
        break;
    }
  }

  /**
   * @method waitingStop
   */
  waitingStop() {
    this.state = 'clicked';
    this.onUpdate(this);
    this.destroy();
  }

  /**
   * @method draggingStop
   */
  draggingStop() {
    this.state = 'dropped';
    preventNextClick();
    this.onUpdate(this);
    this.destroy();
  }

  /**
   * @method on
   * @param {String} event
   * @param {Function} callback
   * @return {Object}
   */
  on(event, callback) {
    window.addEventListener(event, callback, true);

    this.listeners.push({
      remove() {
        window.removeEventListener(event, callback, true);
      }
    });
  }

  /**
   * @method destroy
   */
  destroy() {
    this.listeners.forEach(l => l.remove());
    delete this.onUpdate;
  }

}

/**
 * @method touchbind
 * @param {Number} id
 * @param {Function} callback
 * @return {Function}
 */
function touchbind(id, callback) {
  return event => {
    let touch = find(event.changedTouches, t => t.identifier === id);
    if (touch) { callback(event, touch); }
  };
}

/**
 * @method find
 * @param {Array} list
 * @param {Function} callback
 * @return {Any}
 */
function find(list, callback) {
  return Array.prototype.find.call(list, callback);
}

/**
 * @method preventNextClick
 */
function preventNextClick() {
  let noclick = event => {
    event.stopPropagation();
    window.removeEventListener('click', noclick, true);
  };
  window.addEventListener('click', noclick, true);
}
