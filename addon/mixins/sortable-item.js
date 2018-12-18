import { Promise } from 'rsvp';
import Mixin from '@ember/object/mixin';
import { run } from '@ember/runloop';
import Ember from 'ember';
import { computed } from '@ember/object';
import scrollParent from '../system/scroll-parent';
import ScrollContainer from '../system/scroll-container';
import { throttle } from '@ember/runloop';

const dragActions = ['mousemove', 'touchmove'];
const elementClickAction = 'click';
const endActions = ['click', 'mouseup', 'touchend'];

export default Mixin.create({
  classNames: ['sortable-item'],
  classNameBindings: ['isDragging', 'isDropping'],

  attributeBindings: ['data-test-selector', 'tabindex'],

  /**
    Group to which the item belongs.
    @property group
    @type SortableGroup
    @default null
  */
  group: null,

  /**
    Model which the item represents.
    @property model
    @type Object
    @default null
  */
  model: null,

  /**
    Selector for the element to use as handle.
    If unset, the entire element will be used as the handle.
    @property handle
    @type String
    @default null
  */
  handle: null,

  /**
   * Tolerance, in pixels, for when sorting should start.
   * If specified, sorting will not start until after mouse
   * is dragged beyond distance. Can be used to allow for clicks
   * on elements within a handle.
   *
   * @property distance
   * @type Integer
   * @default 0
   */
  distance: 0,

  /**
   * True if the item is currently being dragged.
   *
   * @property isDragging
   * @type Boolean
   * @default false
   * @protected
   */
  isDragging: false,

  /**
    Action that fires when the item starts being dragged.
    @property onDragStart
    @type Action
    @default null
  */
  onDragStart: null,

  /**
    Action that fires when the item stops being dragged.
    @property onDragStop
    @type Action
    @default null
  */
  onDragStop: null,

  /**
    True if the item is currently dropping.
    @property isDropping
    @type Boolean
    @default false
  */
  isDropping: false,

  /**
    True if the item was dropped during the interaction
    @property wasDropped
    @type Boolean
    @default false
  */
  wasDropped: false,


  /**
    @property isBusy
    @type Boolean
  */
  isBusy: computed.or('isDragging', 'isDropping'),

  /**
    The frequency with which the group is informed
    that an update is required.
    @property updateInterval
    @type Number
    @default 125
  */
  updateInterval: 125,

  /**
    Additional spacing between active item and the rest of the elements.
    @property spacing
    @type Number
    @default 0[px]
  */
  spacing: 0,

  /**
    True if the item transitions with animation.
    @property isAnimated
    @type Boolean
  */
  isAnimated: computed(function() {
    if (!this.element) { return; }

    let el = this.element;
    let property = getComputedStyle(el).transitionProperty;

    return /all|transform/.test(property);
  }).volatile(),

  /**
    The current transition duration in milliseconds.
    @property transitionDuration
    @type Number
  */
  transitionDuration: computed(function() {
    let el = this.element;
    let rule = getComputedStyle(el).transitionDuration;
    let match = rule.match(/([\d.]+)([ms]*)/);

    if (match) {
      let value = parseFloat(match[1]);
      let unit = match[2];

      if (unit === 's') {
        value = value * 1000;
      }

      return value;
    }

    return 0;
  }).volatile(),

  /**
    Horizontal position of the item.
    @property x
    @type Number
  */
  x: computed({
    get() {
      if (this._x === undefined) {
        let marginLeft = parseFloat(getComputedStyle(this.element).marginLeft);
        this._x = this.element.scrollLeft + this.element.offsetLeft - marginLeft;
      }

      return this._x;
    },
    set(_, value) {
      if (value !== this._x) {
        this._x = value;
        this._scheduleApplyPosition();
      }
    },
  }).volatile(),

  /**
    Vertical position of the item relative to its offset parent.
    @property y
    @type Number
  */
  y: computed({
    get() {
      if (this._y === undefined) {
        this._y = this.element.offsetTop;
      }

      return this._y;
    },
    set(key, value) {
      if (value !== this._y) {
        this._y = value;
        this._scheduleApplyPosition();
      }
    }
  }).volatile(),

  /**
    Width of the item.
    @property height
    @type Number
  */
  width: computed(function() {
    let el = this.element;
    let width = el.offsetWidth;
    let elStyles = getComputedStyle(el);

    width += parseInt(elStyles.marginLeft) + parseInt(elStyles.marginRight); // equal to jQuery.outerWidth(true)


    width += getBorderSpacing(el).horizontal;

    return width;
  }).volatile(),

  /**
    Height of the item including margins.
    @property height
    @type Number
  */
  height: computed(function() {
    let el = this.element;
    let height = el.offsetHeight;

    let marginBottom = parseFloat(getComputedStyle(el).marginBottom);
    height += marginBottom;

    height += getBorderSpacing(el).vertical;

    return height;
  }).volatile(),

  /**
    @private
    Allows host instance to use the `group` property for something else with
    minimal overriding.
  */
  _direction: computed.readOnly('group.direction'),

  /**
    @method didInsertElement
  */
  didInsertElement() {
    this._super();
    // scheduled to prevent deprecation warning:
    // "never change properties on components, services or models during didInsertElement because it causes significant performance degradation"
    run.schedule("afterRender", this, "_tellGroup", "registerItem", this);

    // Instead of using `event.preventDefault()` in the 'primeDrag' event,
    // (doesn't work in Chrome 56), we set touch-action: none as a workaround.
    let element = this.get('handle') ? document.querySelector(this.get('handle')) : this.element;
    if (element) {
      element.style['touch-action'] = 'none';
    }
  },

  /**
    @method willDestroyElement
  */
  willDestroyElement() {
    // scheduled to prevent deprecation warning:
    // "never change properties on components, services or models during didInsertElement because it causes significant performance degradation"
    run.schedule("afterRender", this, "_tellGroup", "deregisterItem", this);

    // remove event listeners that may still be attached
    dragActions.forEach(event => window.removeEventListener(event, this._startDragListener));
    endActions.forEach(event => window.removeEventListener(event, this._cancelStartDragListener));
    this.element.removeEventListener(elementClickAction, this._preventClickHandler);
    this.set('isDragging', false);
    this.set('isDropping', false);
  },

  /**
    @method mouseDown
  */
  mouseDown(event) {
    if (event.which !== 1) { return; }
    if (event.ctrlKey) { return; }

    this._primeDrag(event);
  },

  /**
    @method touchStart
  */
  touchStart(event) {
    this._primeDrag(event);
  },

  /**
    @method freeze
  */
  freeze() {
    let el = this.element;
    if (!el) { return; }

    el.style.transition = 'none';
  },

  /**
    @method reset
  */
  reset() {
    let el = this.element;
    if (!el) { return; }

    delete this._y;
    delete this._x;

    el.style.transform = '';
  },

  /**
    @method thaw
  */
  thaw() {
    let el = this.element;
    if (!el) { return; }

    el.style.transform = '';
  },

  /**
   * Setup event listeners for drag and drop
   *
   * @method _primeDrag
   * @param {Event} startEvent JS Event object
   * @private
   */
  _primeDrag(startEvent) {
    let handle = this.get('handle');

    if (handle && !startEvent.target.closest(handle)) {
      return;
    }

    startEvent.preventDefault();
    startEvent.stopPropagation();

    this._prepareDragListener = run.bind(this, this._prepareDrag, startEvent);

    dragActions.forEach(event => window.addEventListener(event, this._prepareDragListener));

    this._cancelStartDragListener = () => {
      dragActions.forEach(event => window.removeEventListener(event, this._prepareDragListener));
    };

    const selfCancellingCallback = () => {
      endActions.forEach(event => window.removeEventListener(event, selfCancellingCallback));
      this._cancelStartDragListener();
    };

    endActions.forEach(event => window.addEventListener(event, selfCancellingCallback));
  },

  /**
   * Prepares for the drag event
   *
   * @method _prepareDrag
   * @param {Event} startEvent JS Event object
   * @param {Event} event JS Event object
   * @private
   */
  _prepareDrag(startEvent, event) {
    let distance = this.get('distance');
    let dx = Math.abs(getX(startEvent) - getX(event));
    let dy = Math.abs(getY(startEvent) - getY(event));

    if (distance <= dx || distance <= dy) {
      dragActions.forEach(event => window.removeEventListener(event, this._prepareDragListener));
      this._startDrag(startEvent);
    }
  },

  /**
   * Start dragging & setup more event listeners
   *
   * @method _startDrag
   * @param {Event} event JS Event object
   * @private
   */
  _startDrag(event) {
    if (this.get('isBusy')) { return; }

    let drag = this._makeDragHandler(event);
    let dragThrottled = ev => throttle(this, drag, ev, 16, false);

    let drop = () => {
      dragActions.forEach(event => window.removeEventListener(event, dragThrottled));
      endActions.forEach(event => window.removeEventListener(event, drop));

      this._drop();
    };

    dragActions.forEach(event => window.addEventListener(event, dragThrottled));
    endActions.forEach(event => window.addEventListener(event, drop));

    this._tellGroup('prepare');
    this.set('isDragging', true);
    this.sendAction('onDragStart', this.get('model'));
    this._scrollOnEdges(drag);
  },

  /**
    The maximum scroll speed when dragging element.
    @property maxScrollSpeed
    @default 20
   */
  maxScrollSpeed: 20,

  _scrollOnEdges(drag) {
    let groupDirection = this.get('_direction');
    let element = this.element;
    let scrollContainer = new ScrollContainer(scrollParent(element));
    let itemContainer = {
      width: parseInt(getComputedStyle(element).width, 10),
      get height() {
        return parseInt(getComputedStyle(element).height, 10);
      },
      get left() {
        return element.getBoundingClientRect().left;
      },
      get right() {
        return this.left + this.width;
      },
      get top() {
        return element.getBoundingClientRect().top;
      },
      get bottom() {
        return this.top + this.height;
      }
    };

    let leadingEdgeKey, trailingEdgeKey, scrollKey, pageKey;
    if (groupDirection === 'x') {
      leadingEdgeKey = 'left';
      trailingEdgeKey = 'right';
      scrollKey = 'scrollLeft';
      pageKey = 'pageX';
    } else {
      leadingEdgeKey = 'top';
      trailingEdgeKey = 'bottom';
      scrollKey = 'scrollTop';
      pageKey = 'pageY';
    }

    let createFakeEvent = () => {
      if (this._pageX == null && this._pageY == null) { return; }
      return {
        pageX: this._pageX,
        pageY: this._pageY
      };
    };

    // Set a trigger padding that will start scrolling
    // the box when the item reaches within padding pixels
    // of the edge of the scroll container.
    let checkScrollBounds = () => {
      let leadingEdge = itemContainer[leadingEdgeKey];
      let trailingEdge = itemContainer[trailingEdgeKey];
      let scroll = scrollContainer[scrollKey]();

      let delta = 0;
      if (trailingEdge >= scrollContainer[trailingEdgeKey]) {
        delta = trailingEdge - scrollContainer[trailingEdgeKey];
      } else if (leadingEdge <= scrollContainer[leadingEdgeKey]) {
        delta = leadingEdge - scrollContainer[leadingEdgeKey];
      }

      if (delta !== 0) {
        let speed = this.get('maxScrollSpeed');
        delta = Math.min(Math.max(delta, -1 * speed), speed);

        delta = scrollContainer[scrollKey](scroll + delta) - scroll;

        let event = createFakeEvent();
        if (event) {
          if (scrollContainer.isWindow) {
            event[pageKey] += delta;
          }
          run(() => drag(event));
        }
      }
      if (this.get('isDragging')) {
        requestAnimationFrame(checkScrollBounds);
      }
    };

    if (!Ember.testing) {
      requestAnimationFrame(checkScrollBounds);
    }
  },

  /**
    @method _makeDragHandler
    @param {Event} startEvent
    @return {Function}
    @private
  */
  _makeDragHandler(startEvent) {
    const groupDirection = this.get('_direction');
    let dragOrigin;
    let elementOrigin;
    let scrollOrigin;
    let parentElement = this.element.parentNode;

    if (groupDirection === 'x') {
      dragOrigin = getX(startEvent);
      elementOrigin = this.get('x');
      scrollOrigin = parentElement.getBoundingClientRect().left;

      return event => {
        this._pageX = getX(event);
        let dx = this._pageX - dragOrigin;
        let scrollX = parentElement.getBoundingClientRect().left;
        let x = elementOrigin + dx + (scrollOrigin - scrollX);

        this._drag(x);
      };
    }

    if (groupDirection === 'y') {
      dragOrigin = getY(startEvent);
      elementOrigin = this.get('y');
      scrollOrigin = parentElement.getBoundingClientRect().top;

      return event => {
        this._pageY = getY(event);
        let dy = this._pageY - dragOrigin;
        let scrollY = parentElement.getBoundingClientRect().top;
        let y = elementOrigin + dy + (scrollOrigin - scrollY);

        this._drag(y);
      };
    }
  },

  /**
    @method _tellGroup
    @private
  */
  _tellGroup(method, ...args) {
    let group = this.get('group');

    if (group) {
      group[method](...args);
    }
  },

  /**
    @method _scheduleApplyPosition
    @private
  */
  _scheduleApplyPosition() {
    run.scheduleOnce('render', this, '_applyPosition');
  },

  /**
    @method _applyPosition
    @private
  */
  _applyPosition() {
    if (!this.element || !this.element) { return; }

    const groupDirection = this.get('_direction');

    if (groupDirection === 'x') {
      let x = this.get('x');
      let dx = x - this.element.offsetLeft + parseFloat(getComputedStyle(this.element).marginLeft);

      this.element.style.transform = `translateX(${dx}px)`;
    }
    if (groupDirection === 'y') {
      let y = this.get('y');
      let dy = y - this.element.offsetTop;

      this.element.style.transform = `translateY(${dy}px)`;
    }
  },

  /**
    @method _drag
    @private
  */
  _drag(dimension) {
    if(!this.get("isDragging")) {
      return;
    }
    let updateInterval = this.get('updateInterval');
    const groupDirection = this.get('_direction');

    if (groupDirection === 'x') {
      this.set('x', dimension);
    }
    if (groupDirection === 'y') {
      this.set('y', dimension);
    }

    run.throttle(this, '_tellGroup', 'update', updateInterval);
  },

  /**
    @method _drop
    @private
  */
  _drop() {
    if (!this.element) { return; }

    this._preventClick();

    this.set('isDragging', false);
    this.set('isDropping', true);

    this._tellGroup('update');

    this._waitForTransition()
      .then(run.bind(this, '_complete'));
  },

  /**
    @method _preventClick
    @private
  */
  _preventClick() {
    const selfCancellingCallback = () => {
      this.element.removeEventListener(elementClickAction, selfCancellingCallback);
      this._preventClickHandler();
    };

    this.element.addEventListener(elementClickAction, selfCancellingCallback);
  },

  /**
    @method _preventClickHandler
    @private
  */
  _preventClickHandler(e) {
    e.stopPropagation();
    e.preventDefault();
    e.stopImmediatePropagation();
  },

  /**
    @method _waitForTransition
    @private
    @return Promise
  */
  _waitForTransition() {
    return new Promise(resolve => {
      run.next(() => {
        let duration = 0;

        if (this.get('isAnimated')) {
          duration = this.get('transitionDuration');
        }

        run.later(this, resolve, duration);
      });
    });
  },

  /**
    @method _complete
    @private
  */
  _complete() {
    this.sendAction('onDragStop', this.get('model'));
    this.set('isDropping', false);
    this.set('wasDropped', true);
    this._tellGroup('commit');
  }
});

/**
  Gets the y offset for a given event.
  Work for touch and mouse events.
  @method getY
  @return {Number}
  @private
*/
function getY(event) {
  let originalEvent = event.originalEvent;
  let touches = originalEvent && originalEvent.changedTouches;
  let touch = touches && touches[0];

  if (touch) {
    return touch.screenY;
  } else {
    return event.clientY;
  }
}

/**
  Gets the x offset for a given event.
  @method getX
  @return {Number}
  @private
*/
function getX(event) {
  let originalEvent = event.originalEvent;
  let touches = originalEvent && originalEvent.changedTouches;
  let touch = touches && touches[0];

  if (touch) {
    return touch.screenX;
  } else {
    return event.clientX;
  }
}

/**
  Gets a numeric border-spacing values for a given element.

  @method getBorderSpacing
  @param {Element} element
  @return {Object}
  @private
*/
function getBorderSpacing(el) {
  let css = getComputedStyle(el).borderSpacing; // '0px 0px'
  let [horizontal, vertical] = css.split(' ');

  return {
    horizontal: parseFloat(horizontal),
    vertical: parseFloat(vertical)
  };
}
