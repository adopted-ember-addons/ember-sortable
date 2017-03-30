import Ember from 'ember';
import computed from 'ember-computed';
import {invokeAction} from 'ember-invoke-action';
import {throttle} from 'ember-runloop';

import scrollParent from '../system/scroll-parent';
import ScrollContainer from '../system/scroll-container';
import {getX, getY, getBorderSpacing} from '../system/utils';

const { Mixin, $, run, run: { bind } } = Ember;
const { Promise } = Ember.RSVP;

/**
 * @module ember-sortable
 * @class SortableItemMixin
 * @extends Ember.Mixin
 */
export default Mixin.create({
  classNames: ['sortable-item'],
  classNameBindings: ['isDragging', 'isDropping'],

  attributeBindings: ['data-test-selector'],

  /**
   * Group to which the item belongs.
   *
   * @property group
   * @type SortableGroup
   * @default null
   * @public
   */
  group: null,

  /**
   * Model which the item represents.
   *
   * @property model
   * @type Any
   * @default null
   * @public
   */
  model: null,

  /**
   * Selector for the element to use as handle.
   * If not set, the entire element will be used as the handle.
   *
   * @property handle
   * @type String
   * @default null
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
   * True if the item is currently dropping.
   *
   * @property isDropping
   * @type Boolean
   * @default false
   * @protected
   */
  isDropping: false,

  /**
   * True if the item was dropped during the interaction
   *
   * @property wasDropped
   * @type Boolean
   * @default false
   * @protected
   */
  wasDropped: false,

  /**
   * @property isBusy
   * @type Boolean
   * @protected
   */
  isBusy: computed.or('isDragging', 'isDropping'),

  /**
   * The frequency with which the group is informed
   * that an update is required.
   *
   * @property updateInterval
   * @type Number
   * @default 125
   * @public
   */
  updateInterval: 125,

  /**
   * Additional spacing between active item and the rest of the elements.
   * Spacing is in pixels
   *
   * @property spacing
   * @type Number
   * @default 0
   * @public
   */
  spacing: 0,

  /**
   * The maximum scroll speed when dragging element.
   *
   * @property maxScrollSpeed
   * @type Number
   * @default 20
   * @public
   */
  maxScrollSpeed: 20,

  /**
   * True if the item transitions with animation.
   *
   * @property isAnimated
   * @type Boolean
   * @protected
   */
  isAnimated: computed(function() {
    if (!this.element || !this.$()) { return; }

    let el = this.$();
    let property = el.css('transition-property');

    return /all|transform/.test(property);
  }).volatile(),

  /**
   * The current transition duration in milliseconds.
   *
   * @property transitionDuration
   * @type Number
   * @protected
   */
  transitionDuration: computed(function() {
    let el = this.$();
    let rule = el.css('transition-duration');
    let match = rule.match(/([\d\.]+)([ms]*)/);

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
   * Horizontal position of the item
   *
   * @property x
   * @type Number
   * @protected
   */
  x: computed({
    get() {
      if (this._x === undefined) {
        let marginLeft = parseFloat(this.$().css('margin-left'));
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
   * Vertical position of the item relative to its offset parent.
   *
   * @property y
   * @type Number
   * @protected
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
   * Width of the item.
   *
   * @property width
   * @type Number
   * @protected
   */
  width: computed(function() {
    let el = this.$();
    let width = el.outerWidth(true);

    width += getBorderSpacing(el).horizontal;

    return width;
  }).volatile(),

  /**
   * Height of the item including margins.
   *
   * @property height
   * @type Number
   * @protected
   */
  height: computed(function() {
    let el = this.$();
    let height = el.outerHeight();

    let marginBottom = parseFloat(el.css('margin-bottom'));
    height += marginBottom;

    height += getBorderSpacing(el).vertical;

    return height;
  }).volatile(),

  /* Events */

  /**
   * Action that fires when the item starts being dragged.
   *
   * @event onDragStart
   * @param {Any} model Model defined for this item
   * @public
   */

  /**
   * Action that fires when the item stops being dragged.
   *
   * @event onDragStop
   * @param {Any} model Model defined for this item
   * @public
   */

  /* Ember Component hooks */

  didInsertElement() {
    this._super();
    // scheduled to prevent deprecation warning:
    // "never change properties on components, services or models during didInsertElement because it causes significant performance degradation"
    run.schedule("afterRender", this, "_tellGroup", "registerItem", this);

    // Instead of using `event.preventDefault()` in the 'primeDrag' event,
    // (doesn't work in Chrome 56), we set touch-action: none as a workaround.
    let element = this.get('handle') ? this.$(this.get('handle')) : this.$();
    element.css({ 'touch-action': 'none' });
  },

  willDestroyElement() {
    // scheduled to prevent deprecation warning:
    // "never change properties on components, services or models during didInsertElement because it causes significant performance degradation"
    run.schedule("afterRender", this, "_tellGroup", "deregisterItem", this);

    // remove event listeners that may still be attached
    $(window).off('mousemove touchmove', this._startDragListener);
    $(window).off('click mouseup touchend', this._cancelStartDragListener);
  },

  mouseDown(event) {
    if (event.which !== 1) { return; }
    if (event.ctrlKey) { return; }

    this._primeDrag(event);
  },

  touchStart(event) {
    this._primeDrag(event);
  },

  /**
   * Freeze any potential transitions
   *
   * @method freeze
   * @public
   */
  freeze() {
    let el = this.$();
    if (!el) { return; }

    el.css({ transition: 'none' });
    el.height(); // Force-apply styles
  },

  /**
   * Reset positioning of object
   *
   * @method reset
   * @public
   */
  reset() {
    let el = this.$();
    if (!el) { return; }

    delete this._y;
    delete this._x;

    el.css({ transform: '' });
    el.height(); // Force-apply styles
  },

  /**
   * Make transitions allowed again.
   *
   * @method thaw
   * @public
   */
  thaw() {
    let el = this.$();
    if (!el) { return; }

    el.css({ transition: '' });
    el.height(); // Force-apply styles
  },

  /**
   * Setup event listeners for drag and drop
   *
   * @method _primeDrag
   * @param {Event} event JS Event object
   * @private
   */
  _primeDrag(startEvent) {
    let handle = this.get('handle');

    if (handle && !$(startEvent.target).closest(handle).length) {
      return;
    }

    this._prepareDragListener = bind(this, this._prepareDrag, startEvent);

    this._cancelStartDragListener = () => {
      $(window).off('mousemove touchmove', this._prepareDragListener);
    };

    $(window).on('mousemove touchmove', this._prepareDragListener);
    $(window).one('click mouseup touchend', this._cancelStartDragListener);
  },

  /**
   * Prepares for the drag event
   *
   * @method _prepareDrag
   * @param {Event} event JS Event object
   * @param {Event} event JS Event object
   * @private
   */
  _prepareDrag(startEvent, event) {
    let distance = this.get('distance');
    let dx = Math.abs(getX(startEvent) - getX(event));
    let dy = Math.abs(getY(startEvent) - getY(event));

    if (distance <= dx || distance <= dy) {
      $(window).off('mousemove touchmove', this._prepareDragListener);
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
      $(window)
        .off('mousemove touchmove', dragThrottled)
        .off('click mouseup touchend', drop);

      this._drop();
    };

    $(window)
      .on('mousemove touchmove', dragThrottled)
      .on('click mouseup touchend', drop);

    this._tellGroup('prepare');
    this.set('isDragging', true);

    invokeAction(this, 'onDragStart', this.get('model'));

    this._scrollOnEdges(drag);
  },

  /**
   * Handles scrolling on item drag
   *
   * @method _scrollOnEdges
   * @param {Function} drag Drag handler function
   * @private
   */
  _scrollOnEdges(drag) {
    let groupDirection = this.get('group.direction');
    let $element = this.$();
    let scrollContainer = new ScrollContainer(scrollParent($element)[0]);
    let itemContainer = {
      width: $element.width(),
      height: $element.height(),
      get left() {
        return $element.offset().left;
      },
      get right() {
        return this.left + this.width;
      },
      get top() {
        return $element.offset().top;
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
   * Create drag handler for an event
   *
   * @method _makeDragHandler
   * @param {Event} startEvent
   * @return {Function} Drag handler function
   * @private
   */
  _makeDragHandler(startEvent) {
    const groupDirection = this.get('group.direction');
    let dragOrigin;
    let elementOrigin;
    let scrollOrigin;
    let parentElement = $(this.element.parentNode);

    if (groupDirection === 'x') {
      dragOrigin = getX(startEvent);
      elementOrigin = this.get('x');
      scrollOrigin = parentElement.offset().left;

      return event => {
        this._pageX = getX(event);
        let dx = this._pageX - dragOrigin;
        let scrollX = parentElement.offset().left;
        let x = elementOrigin + dx + (scrollOrigin - scrollX);

        this._drag(x);
      };
    }

    if (groupDirection === 'y') {
      dragOrigin = getY(startEvent);
      elementOrigin = this.get('y');
      scrollOrigin = parentElement.offset().top;

      return event => {
        this._pageY = getY(event);
        let dy = this._pageY - dragOrigin;
        let scrollY = parentElement.offset().top;
        let y = elementOrigin + dy + (scrollOrigin - scrollY);

        this._drag(y);
      };
    }
  },

  /**
   * Convenience function used to call a method on the group
   *
   * @method _tellGroup
   * @param {String} method Method name to call
   * @param {Any} [...args] Arguments to pass to the method
   * @private
   */
  _tellGroup(method, ...args) {
    let group = this.get('group');

    if (group) {
      group[method](...args);
    }
  },

  /**
   * Schedule position application
   *
   * @method _scheduleApplyPosition
   * @private
   */
  _scheduleApplyPosition() {
    run.scheduleOnce('render', this, '_applyPosition');
  },

  /**
   * Set transform position of the item
   *
   * @method _applyPosition
   * @private
   */
  _applyPosition() {
    if (!this.element || !this.$()) { return; }

    const groupDirection = this.get('group.direction');

    if (groupDirection === 'x') {
      let x = this.get('x');
      let dx = x - this.element.offsetLeft + parseFloat(this.$().css('margin-left'));

      this.$().css({
        transform: `translateX(${dx}px)`
      });
    }
    if (groupDirection === 'y') {
      let y = this.get('y');
      let dy = y - this.element.offsetTop;

      this.$().css({
        transform: `translateY(${dy}px)`
      });
    }
  },

  /**
   * Handle setting of things on item drag
   *
   * @method _drag
   * @param {Number} dimension Value to set for x or y
   * @private
   */
  _drag(dimension) {
    if(this.get('isDestroyed') || this.get('isDestroying')){
      return;
    }
    
    let updateInterval = this.get('updateInterval');
    const groupDirection = this.get('group.direction');

    if (groupDirection === 'x') {
      this.set('x', dimension);
    }
    if (groupDirection === 'y') {
      this.set('y', dimension);
    }

    run.throttle(this, '_tellGroup', 'update', updateInterval);
  },

  /**
   * Handle cleanup on item drop
   *
   * @method _drop
   * @private
   */
  _drop() {
    if (!this.element || !this.$()) { return; }

    this._preventClick(this.element);

    this.set('isDragging', false);
    this.set('isDropping', true);

    this._tellGroup('update');

    this._waitForTransition()
      .then(run.bind(this, '_complete'));
  },

  /**
   * Prevent clicking on an element
   *
   * @method _preventClick
   * @param {String|Element} element to prevent the click on
   * @private
   */
  _preventClick(element) {
    $(element).one('click', function(e){ 
      e.stopPropagation();
      e.preventDefault();
      e.stopImmediatePropagation();
    } );
  },

  /**
   * Returns a promise that resolves when the transition duration
   * has occurred.
   *
   * @method _waitForTransition
   * @return Promise
   * @private
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
   * Final method called on cleanup. Commits the result of the
   * drag & drop to the group
   *
   * @method _complete
   * @private
   */
  _complete() {
    if(this.get('isDestroyed') || this.get('isDestroying')){
      return;
    }
    
    invokeAction(this, 'onDragStop', this.get('model'));
    this.set('isDropping', false);
    this.set('wasDropped', true);
    this._tellGroup('commit');
  }
});
