/* eslint-disable ember/no-computed-properties-in-native-classes */
import Modifier from 'ember-modifier';
import { Promise, defer } from 'rsvp';
import { action, set } from '@ember/object';
import { DRAG_ACTIONS, ELEMENT_CLICK_ACTION, END_ACTIONS } from '../utils/constant';
import { run, throttle, bind, scheduleOnce, later } from '@ember/runloop';
import { DEBUG } from '@glimmer/env';
import { getX, getY } from '../utils/coordinate';
import ScrollContainer from '../system/scroll-container';
import scrollParent from '../system/scroll-parent';
import { getBorderSpacing } from '../utils/css-calculation';
import { buildWaiter } from '@ember/test-waiters';
import { inject as service } from '@ember/service';
import { assert, deprecate } from '@ember/debug';
import { registerDestructor } from '@ember/destroyable';
import { isTesting } from '@embroider/macros';

const sortableItemWaiter = buildWaiter('sortable-item-waiter');

/**
 * Modifier to mark an element as an item to be reordered
 *
 * @param {Object} model The model that this item will represent
 * @param {boolean} [disabled=false] Set to true to make this item not sortable
 * @param {Function}  [onDragStart] An optional callback for when dragging starts.
 * @param {Function}  [onDragStop] An optional callback for when dragging stops.
 *
 * @module drag-drop/draggable-group
 * @example
 *    <ol {{sortable-group onChange=this.update a11yAnnouncementConfig=this.myA11yConfig}}>
 *      {{#each model.items as |item|}}
 *        <li {{sortable-item model=item}}>
 *          {{item.name}}
 *          <span class="handle" {{sortable-handle}}>&varr;</span>
 *        </li>
 *      {{/each}}
 *    </ol>
 */
export default class SortableItemModifier extends Modifier {
  className = 'sortable-item';

  @service('ember-sortable-internal-state') sortableService;

  _sortableGroup;
  /**
   * The SortableGroupModifier this item belongs to. Assigned by the group
   * when it inspects all the items in the list
   *
   * @type SortableGroupModifier
   */
  get sortableGroup() {
    if (this._sortableGroup === undefined) {
      this._sortableGroup = this.sortableService.fetchGroup(this.groupName);
      assert(
        `No sortable group named ${this.groupName} found. Please check that the groups and items have the same groupName`,
        this._sortableGroup !== undefined
      );
    }
    return this._sortableGroup.groupModifier;
  }

  get model() {
    return this.named.model;
  }

  get direction() {
    return this.sortableGroup?.direction;
  }

  get groupDisabled() {
    return this.sortableGroup?.disabled;
  }

  /**
   * This is the group name used to keep groups separate if there are more than one on the screen at a time.
   * If no group is assigned a default is used
   *
   * @default "_EmberSortableGroup"
   * @returns {*|string}
   */
  get groupName() {
    return this.named.groupName || '_EmberSortableGroup';
  }

  /**
   The frequency with which the group is informed
   that an update is required.
   @property updateInterval
   @type Number
   @default 125
   */
  get updateInterval() {
    return this.named.updateInterval || 125;
  }

  /**
   Additional spacing between active item and the rest of the elements.
   @property spacing
   @type Number
   @default 0[px]
   */
  get spacing() {
    return this.named.spacing || 0;
  }

  /**
   Removes the ability for the current item to be sorted
   @property disabled
   @type  boolean
   @default false
   */
  get isDisabled() {
    deprecate(
      '"isDraggingDisabled" is deprecated.  Please migrate to "disabled" named argument',
      !('isDraggingDisabled' in this.named),
      {
        id: 'ember-sortable.is-dragging-disabled',
        url: 'https://github.com/adopted-ember-addons/ember-sortable#readme',
        until: '3.0.0',
        for: 'ember-sortable',
        since: {
          available: '2.2.6',
          enabled: '2.2.6',
        },
      }
    );

    return this.groupDisabled || this.named.disabled || this.named.isDraggingDisabled || false;
  }

  /**
   Selector for the element to use as handle.
   1. By default, we will hook it the yielded sortable-handle.
   2. If you don't use the sortable-handle, the entire element will be used as the handle.
   3. In very rare situations, if you want to use a handle, but not the sortable-handle,
   you can override this class with your own handle's selector. This behavior will be
   synonymous with v1
   @property handle
   @type String
   @default "[data-sortable-handle]"
   */
  get handle() {
    return this.named.handle || '[data-sortable-handle]';
  }

  handleElement;

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
  get distance() {
    return this.named.distance || 0;
  }

  /**
   * True if the item is currently being dragged.
   *
   * @property isDragging
   * @type boolean
   * @default false
   * @protected
   */
  _isDragging = false;
  get isDragging() {
    return this._isDragging;
  }
  set isDragging(value) {
    if (value) {
      this.element.classList.add('is-dragging');
    } else {
      this.element.classList.remove('is-dragging');
    }
    this._isDragging = value;
  }

  /**
   Action that fires when the item starts being dragged.
   @property onDragStart
   @type Function
   @param {Object} item model
   @default null
   */
  get onDragStart() {
    return this.named.onDragStart || ((item) => item);
  }

  /**
   Action that fires when the item stops being dragged.
   @property onDragStop
   @type Function
   @param {Object} item model
   @default null
   */
  get onDragStop() {
    return this.named.onDragStop || ((item) => item);
  }

  /**
   True if the item is currently dropping.
   @property isDropping
   @type Boolean
   @default false
   */
  _isDropping = false;
  get isDropping() {
    return this._isDropping;
  }
  set isDropping(value) {
    if (value) {
      this.element.classList.add('is-dropping');
    } else {
      this.element.classList.remove('is-dropping');
    }
    this._isDropping = value;
  }

  /**
   True if the item was dropped during the interaction
   @property wasDropped
   @type Boolean
   @default false
   */
  wasDropped = false;

  /**
   @property isBusy
   @type Boolean
   */
  get isBusy() {
    return this.isDragging || this.isDropping;
  }

  /**
   @property disableCheckScrollBounds
   */
  get disableCheckScrollBounds() {
    return this.named.disableCheckScrollBounds != undefined ? this.named.disableCheckScrollBounds : isTesting();
  }

  /**
   @method mouseDown
   */
  @action
  mouseDown(event) {
    if (event.which !== 1) {
      return;
    }
    if (event.ctrlKey) {
      return;
    }

    this._primeDrag(event);
  }

  @action
  keyDown(event) {
    if (this.isDisabled) {
      return;
    }

    this.setupHandleElement();

    // If the event is coming from within the item, we do not want to activate keyboard reorder mode.
    if (event.target === this.handleElement || event.target === this.element) {
      this.sortableGroup.activateKeyDown(this);
    } else {
      this.sortableGroup.deactivateKeyDown();
    }
  }

  /**
   @method touchStart
   */
  @action
  touchStart(event) {
    this._primeDrag(event);
  }

  /**
   @method freeze
   */
  freeze() {
    let el = this.element;
    if (!el) {
      return;
    }

    el.style.transition = 'none';
  }

  /**
   @method reset
   */
  reset() {
    let el = this.element;
    if (!el) {
      return;
    }

    delete this._y;
    delete this._x;

    el.style.transform = '';
  }

  /**
   @method thaw
   */
  thaw() {
    let el = this.element;
    if (!el) {
      return;
    }

    el.style.transition = '';
  }

  /**
   * Setup event listeners for drag and drop
   *
   * @method _primeDrag
   * @param {Event} startEvent JS Event object
   * @private
   */
  _primeDrag(startEvent) {
    if (this.isDisabled) {
      return;
    }

    if (this.handleElement && !startEvent.target.closest(this.handle)) {
      return;
    }

    if (startEvent.type !== 'touchstart') {
      //click event (touch) of child elements is prevented by the following line
      startEvent.preventDefault();
    }
    startEvent.stopPropagation();

    this._prepareDragListener = bind(this, this._prepareDrag, startEvent);

    DRAG_ACTIONS.forEach((event) => window.addEventListener(event, this._prepareDragListener));

    this._cancelStartDragListener = () => {
      DRAG_ACTIONS.forEach((event) => window.removeEventListener(event, this._prepareDragListener));
    };

    const selfCancellingCallback = () => {
      END_ACTIONS.forEach((event) => window.removeEventListener(event, selfCancellingCallback));
      this._cancelStartDragListener();
    };

    END_ACTIONS.forEach((event) => window.addEventListener(event, selfCancellingCallback));
  }

  /**
   * Prepares for the drag event
   *
   * @method _prepareDrag
   * @param {Event} startEvent JS Event object
   * @param {Event} event JS Event object
   * @private
   */
  _prepareDrag(startEvent, event) {
    let distance = this.distance;
    let dx = Math.abs(getX(startEvent) - getX(event));
    let dy = Math.abs(getY(startEvent) - getY(event));

    if (distance <= dx || distance <= dy) {
      DRAG_ACTIONS.forEach((event) => window.removeEventListener(event, this._prepareDragListener));
      this._startDrag(startEvent);
    }
  }

  /**
   * Start dragging & setup more event listeners
   *
   * @method _startDrag
   * @param {Event} event JS Event object
   * @private
   */
  _startDrag(event) {
    if (this.isBusy) {
      return;
    }

    let drag = this._makeDragHandler(event);
    let dragThrottled = (ev) => throttle(this, drag, ev, 16, false);

    let drop = () => {
      DRAG_ACTIONS.forEach((event) => window.removeEventListener(event, dragThrottled));
      END_ACTIONS.forEach((event) => window.removeEventListener(event, drop));

      run(() => {
        // Click event is not triggered on mobile after drop and causes next click to fail
        const isTouch = event.type === 'touchstart';
        this._drop(isTouch);
      });
    };

    DRAG_ACTIONS.forEach((event) => window.addEventListener(event, dragThrottled));
    END_ACTIONS.forEach((event) => window.addEventListener(event, drop));

    this.sortableGroup.prepare();
    set(this, 'isDragging', true);
    this.onDragStart(this.model);
    this._scrollOnEdges(drag);
  }

  /**
   The maximum scroll speed when dragging element.
   @property maxScrollSpeed
   @default 20
   */
  maxScrollSpeed = 20;

  _scrollOnEdges(drag) {
    let groupDirection = this.direction;
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
      },
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
      if (this._pageX == null && this._pageY == null) {
        return;
      }
      return {
        pageX: this._pageX,
        pageY: this._pageY,
        clientX: this._pageX,
        clientY: this._pageY,
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
        let speed = this.maxScrollSpeed;
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
      if (this.isDragging) {
        requestAnimationFrame(checkScrollBounds);
      }
    };

    if (!this.disableCheckScrollBounds) {
      requestAnimationFrame(checkScrollBounds);
    }
  }

  /**
   @method _makeDragHandler
   @param {Event} startEvent
   @return {Function}
   @private
   */
  _makeDragHandler(startEvent) {
    const groupDirection = this.direction;
    let dragOrigin;
    let elementOrigin;
    let scrollOrigin;
    let parentElement = this.element.parentNode;

    if (groupDirection === 'x') {
      dragOrigin = getX(startEvent);
      elementOrigin = this.x;
      scrollOrigin = parentElement.getBoundingClientRect().left;

      return (event) => {
        this._pageX = getX(event);
        let dx = this._pageX - dragOrigin;
        let scrollX = parentElement.getBoundingClientRect().left;
        let x = elementOrigin + dx + (scrollOrigin - scrollX);

        this._drag(x);
      };
    }

    if (groupDirection === 'y') {
      dragOrigin = getY(startEvent);
      elementOrigin = this.y;
      scrollOrigin = parentElement.getBoundingClientRect().top;

      return (event) => {
        this._pageY = getY(event);
        let dy = this._pageY - dragOrigin;
        let scrollY = parentElement.getBoundingClientRect().top;
        let y = elementOrigin + dy + (scrollOrigin - scrollY);

        this._drag(y);
      };
    }
  }

  /**
   @method _scheduleApplyPosition
   @private
   */
  _scheduleApplyPosition() {
    scheduleOnce('render', this, '_applyPosition');
  }

  /**
   @method _applyPosition
   @private
   */
  _applyPosition() {
    if (!this.element || !this.element) {
      return;
    }

    const groupDirection = this.direction;

    if (groupDirection === 'x') {
      let x = this.x;
      let dx = x - this.element.offsetLeft + parseFloat(getComputedStyle(this.element).marginLeft);

      this.element.style.transform = `translateX(${dx}px)`;
    }
    if (groupDirection === 'y') {
      let y = this.y;
      let dy = y - this.element.offsetTop;

      this.element.style.transform = `translateY(${dy}px)`;
    }
  }

  /**
   @method _drag
   @private
   */
  _drag(dimension) {
    if (!this.isDragging) {
      return;
    }
    let updateInterval = this.updateInterval;
    const groupDirection = this.direction;

    if (groupDirection === 'x') {
      this.x = dimension;
    }
    if (groupDirection === 'y') {
      this.y = dimension;
    }

    throttle(this, this.sortableGroup.update, updateInterval);
  }

  /**
   @method _drop
   @private
   */
  _drop(isTouch) {
    if (!this.element) {
      return;
    }

    let transitionPromise = this._waitForTransition();

    if (!isTouch) {
      this._preventClick();
    }

    set(this, 'isDragging', false);
    set(this, 'isDropping', true);

    this.sortableGroup.update();
    transitionPromise.then(() => this._complete());
  }

  /**
   @method _preventClick
   @private
   */
  _preventClick() {
    const selfCancellingCallback = (event) => {
      this.element.removeEventListener(ELEMENT_CLICK_ACTION, selfCancellingCallback);
      this._preventClickHandler(event);
    };

    this.element.addEventListener(ELEMENT_CLICK_ACTION, selfCancellingCallback);
  }

  /**
   @method _preventClickHandler
   @private
   */
  _preventClickHandler(e) {
    e.stopPropagation();
    e.preventDefault();
    e.stopImmediatePropagation();
  }

  /**
   @method _waitForTransition
   @private
   @return Promise
   */
  _waitForTransition() {
    let waiterToken;

    if (DEBUG) {
      waiterToken = sortableItemWaiter.beginAsync();
    }

    let transitionPromise;

    if (this.isAnimated) {
      const deferred = defer();
      this.element.addEventListener('transitionend', deferred.resolve);
      transitionPromise = deferred.promise.finally(() => {
        this.element.removeEventListener('transitionend', deferred.resolve);
      });
    } else {
      const duration = this.isAnimated ? this.transitionDuration : 200;
      transitionPromise = new Promise((resolve) => later(resolve, duration));
    }

    if (DEBUG) {
      transitionPromise = transitionPromise.finally(() => {
        sortableItemWaiter.endAsync(waiterToken);
      });
    }

    return transitionPromise;
  }

  /**
   @method _complete
   @private
   */
  _complete() {
    this.onDragStop(this.model);
    set(this, 'isDropping', false);
    set(this, 'wasDropped', true);
    this.sortableGroup.commit();
  }

  get isAnimated() {
    if (!this.element) {
      return undefined;
    }

    let el = this.element;
    let transitionProperty = getComputedStyle(el).transitionProperty;

    return /all|transform/.test(transitionProperty) && this.transitionDuration > 0;
  }

  /**
   The current transition duration in milliseconds.
   @property transitionDuration
   @type Number
   */
  get transitionDuration() {
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
  }

  /**
   Horizontal position of the item.
   @property x
   @type Number
   */
  get x() {
    if (this._x === undefined) {
      let marginLeft = parseFloat(getComputedStyle(this.element).marginLeft);
      this._x = this.element.scrollLeft + this.element.offsetLeft - marginLeft;
    }

    return this._x;
  }
  set x(value) {
    if (value !== this._x && Math.abs(value - this._x) >= 5) {
      this._x = value;
      this._scheduleApplyPosition();
    }
  }

  /**
   Vertical position of the item relative to its offset parent.
   @property y
   @type Number
   */
  get y() {
    if (this._y === undefined) {
      this._y = this.element.offsetTop;
    }

    return this._y;
  }

  set y(value) {
    if (value !== this._y) {
      this._y = value;
      this._scheduleApplyPosition();
    }
  }

  /**
   Width of the item.
   @property height
   @type Number
   */
  get width() {
    let el = this.element;
    let width = el.offsetWidth;
    let elStyles = getComputedStyle(el);

    width += parseInt(elStyles.marginLeft) + parseInt(elStyles.marginRight); // equal to jQuery.outerWidth(true)

    width += getBorderSpacing(el).horizontal;

    return width;
  }

  /**
   Height of the item including margins.
   @property height
   @type Number
   */
  get height() {
    let el = this.element;
    let height = el.offsetHeight;

    let marginBottom = parseFloat(getComputedStyle(el).marginBottom);
    height += marginBottom;

    height += getBorderSpacing(el).vertical;

    return height;
  }

  addEventListener() {
    this.element.addEventListener('keydown', this.keyDown);
    this.element.addEventListener('mousedown', this.mouseDown);
    this.element.addEventListener('touchstart', this.touchStart);
    this.listenersRegistered = true;
  }

  removeEventListener() {
    this.element.removeEventListener('keydown', this.keyDown);
    this.element.removeEventListener('mousedown', this.mouseDown);
    this.element.removeEventListener('touchstart', this.touchStart);
    this.listenersRegistered = false;
  }

  setupHandleElement() {
    this.handleElement = this.element.querySelector(this.handle);

    if (this.handleElement) {
      this.handleElement.style['touch-action'] = 'none';
    } else {
      this.element.style['touch-action'] = 'none';
    }
  }

  element;
  didSetup = false;

  /**
   * tracks if event listeners have been registered. Registering event handlers is unnecessary if item is disabled.
   */
  listenersRegistered = false;

  constructor(owner, args) {
    super(owner, args);
    registerDestructor(this, cleanup);
  }

  modify(element, _positional, named) {
    this.element = element;
    this.named = named;

    this.element.classList.add(this.className);

    // Instead of using `event.preventDefault()` in the 'primeDrag' event,
    // (doesn't work in Chrome 56), we set touch-action: none as a workaround.
    this.setupHandleElement();

    if (!this.didSetup) {
      this.element.dataset.sortableItem = true;
      this.sortableService.registerItem(this.groupName, this);
      this.didSetup = true;
    }

    if (this.named.disabled && this.listenersRegistered) {
      this.removeEventListener();
    } else if (!this.named.disabled && !this.listenersRegistered) {
      this.addEventListener();
    }
  }
}

/**
 *
 * @param {SortableItemModifier} instance
 */
function cleanup(instance) {
  instance.removeEventListener();
  instance.sortableService.deregisterItem(instance.groupName, instance);
}
