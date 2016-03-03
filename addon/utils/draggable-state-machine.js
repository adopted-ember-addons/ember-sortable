/**
  @module ember-sortable
*/

// If the first touchmove arrives within TRESHOLD, we consider it a swipe
const THRESHOLD = 50; // ms

/**
  @class DraggableStateMachine
  @constructor
  @param {Function} onUpdate
 */
export default class DraggableStateMachine {

  constructor(onUpdate = () => {}) {
    this.state = 'default';
    this.onUpdate = onUpdate;
    this.ot = 0;
    this.ox = 0;
    this.oy = 0;
    this.dx = 0;
    this.dy = 0;
    this.listeners = [];
    this.isDestroyed = false;
  }

  /**
    @method start
    @param {UIEvent} event
  */
  start(event) {
    switch (this.state) {
      case 'default':
        this.defaultStart(event);
    }
  }

  /**
    @method defaultStart
    @param {UIEvent} event
  */
  defaultStart(event) {
    this.state = 'waiting';
    this.ot = event.timeStamp;

    let touch = event.targetTouches && event.targetTouches[0];

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
    @method move
    @param {UIEvent} event
    @param {Touch|null} [touch]
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
    @method waitingMove
    @param {UIEvent} event
    @param {Touch|null} [touch]
  */
  waitingMove(event, touch) {
    let isTooFast = touch && (event.timeStamp - this.ot < THRESHOLD);

    if (isTooFast) {
      this.state = 'swiping';
      this.onUpdate(this);
      this.destroy();
    } else {
      this.state = 'dragging';
      this.move(event, touch);
    }
  }

  /**
    @method draggingMove
    @param {UIEvent} event
    @param {Touch|null} [touch]
  */
  draggingMove(event, touch) {
    event.preventDefault();

    this.dx = (touch || event).pageX - this.ox;
    this.dy = (touch || event).pageY - this.oy;

    this.onUpdate(this);
  }

  /**
    @method stop
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
    @method waitingStop
  */
  waitingStop() {
    this.state = 'clicking';
    this.onUpdate(this);
    this.destroy();
  }

  /**
    @method draggingStop
   */
  draggingStop() {
    this.state = 'dropping';
    preventNextClick();
    this.onUpdate(this);
    this.destroy();
  }

  /**
    @method on
    @param {String} event
    @param {Function} callback
  */
  on(event, callback) {
    let capture = true;

    window.addEventListener(event, callback, capture);

    this.listeners.push({
      remove() {
        window.removeEventListener(event, callback, capture);
      }
    });
  }

  /**
    @method destroy
  */
  destroy() {
    if (this.isDestroyed) { return; }

    this.listeners.forEach(l => l.remove());

    delete this.onUpdate;
    delete this.listeners;

    this.isDestroyed = true;
  }

}

/**
  Wraps the given callback such that it will only be called when the incoming
  touch matches the original touch (by identifier).

  @private
  @method touchbind
  @param {Touch} touch
  @param {Function} callback
  @return {Function}
*/
function touchbind(touch, callback) {
  let { identifier } = touch;

  return event => {
    let touch = find(event.changedTouches, t => t.identifier === identifier);
    if (touch) { callback(event, touch); }
  };
}

/**
  @private
  @method find
  @param {Array} list
  @param {Function} callback
  @return {Any}
*/
function find(list, callback) {
  return Array.prototype.find.call(list, callback);
}

/**
  @private
  @method preventNextClick
*/
function preventNextClick() {
  let noclick = event => {
    event.stopPropagation();
    window.removeEventListener('click', noclick, true);
  };
  window.addEventListener('click', noclick, true);
}
