const THRESHOLD = 50; // ms

/**
 * @class SortableStateMachine
 */
export default class SortableStateMachine {

  /**
   * @constructor
   * @param {Function} onUpdate
   */
  constructor(onUpdate = () => {}) {
    this.state = 'default';
    this.onUpdate = onUpdate;
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
      this.ox = touch.pageX;
      this.oy = touch.pageY;

      this.on('touchmove', touchbind(touch, (e, t)  => this.move(e, t)));
      this.on('touchend', touchbind(touch, () => this.stop()));
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
    this.state = 'clicking';
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
    delete this.listeners;
  }

}

/**
 * @method touchbind
 * @param {Number} id
 * @param {Function} callback
 * @return {Function}
 */
function touchbind(touch, callback) {
  let { identifier } = touch;

  return event => {
    let touch = find(event.changedTouches, t => t.identifier === identifier);
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
