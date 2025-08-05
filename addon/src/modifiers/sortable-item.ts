/* eslint-disable ember/no-computed-properties-in-native-classes */
import Modifier from 'ember-modifier';
import { Promise, defer } from 'rsvp';
import { action, set } from '@ember/object';
import { DRAG_ACTIONS, ELEMENT_CLICK_ACTION, END_ACTIONS } from '../utils/constant.ts';
import { run, throttle, bind, scheduleOnce, later } from '@ember/runloop';
import { DEBUG } from '@glimmer/env';
import { getX, getY } from '../utils/coordinate.ts';
import ScrollContainer from '../system/scroll-container.ts';
import scrollParent from '../system/scroll-parent.ts';
import { getBorderSpacing } from '../utils/css-calculation.ts';
import { buildWaiter } from '@ember/test-waiters';
import * as s from '@ember/service';
import { assert, deprecate } from '@ember/debug';
import { registerDestructor } from '@ember/destroyable';
import { isTesting } from '@embroider/macros';
import type { ArgsFor, PositionalArgs, NamedArgs } from 'ember-modifier';
import type EmberSortableService from '../services/ember-sortable-internal-state.ts';
import type Owner from '@ember/owner';
import type { Group } from '../services/ember-sortable-internal-state.ts';
import type SortableGroupModifier from './sortable-group.ts';
import type { TDirection } from './sortable-group.ts';

const service = s.service ?? s.inject;

const sortableItemWaiter = buildWaiter('sortable-item-waiter');

export interface MoveDirection {
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
}

interface ItemContainer {
  width: number;
  readonly height: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

export interface FakeEvent {
  pageX: number;
  pageY: number;
  clientX: number;
  clientY: number;
}

export interface SortableItemModifierSignature<T> {
  Args: {
    Named: {
      model: T;
      groupName?: string;
      disabled?: boolean;
      updateInterval?: number;
      spacing?: number;
      isDraggingDisabled?: boolean;
      handle?: string;
      distance?: number;
      disableCheckScrollBounds?: boolean;
      onDragStart?: (item: T) => void;
      onDragStop?: (item: T) => void;
    };
  };
  Element: HTMLElement;
}

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
export default class SortableItemModifier<T> extends Modifier<SortableItemModifierSignature<T>> {
  className = 'sortable-item';

  @service('ember-sortable-internal-state') declare sortableService: EmberSortableService<T>;

  startEvent?: FakeEvent | Event;

  _sortableGroup?: Group<T>;
  _x?: number;
  _y?: number;
  _dragOriginX?: number;
  _dragOriginY?: number;
  _pageX?: number;
  _pageY?: number;

  /**
   * The SortableGroupModifier this item belongs to. Assigned by the group
   * when it inspects all the items in the list
   *
   * @type SortableGroupModifier
   */
  get sortableGroup(): SortableGroupModifier<T> {
    if (this._sortableGroup === undefined) {
      this._sortableGroup = this.sortableService.fetchGroup(this.groupName);
      assert(
        `No sortable group named ${this.groupName} found. Please check that the groups and items have the same groupName`,
        this._sortableGroup !== undefined,
      );
    }
    return this._sortableGroup.groupModifier!;
  }

  get model(): T {
    return this.named.model;
  }

  get direction(): TDirection {
    return this.sortableGroup?.direction;
  }

  get groupDisabled(): boolean {
    return this.sortableGroup?.disabled;
  }

  /**
   * This is the group name used to keep groups separate if there are more than one on the screen at a time.
   * If no group is assigned a default is used
   *
   * @default "_EmberSortableGroup"
   * @returns {string}
   */
  get groupName(): string {
    return this.named.groupName || '_EmberSortableGroup';
  }

  /**
   The frequency with which the group is informed
   that an update is required.
   @property updateInterval
   @type Number
   @default 125
   */
  get updateInterval(): number {
    return this.named.updateInterval || 125;
  }

  /**
   Additional spacing between active item and the rest of the elements.
   @property spacing
   @type Number
   @default 0[px]
   */
  get spacing(): number {
    return this.named.spacing || 0;
  }

  /**
   Removes the ability for the current item to be sorted
   @property disabled
   @type  boolean
   @default false
   */
  get isDisabled(): boolean {
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
      },
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

  handleElement?: HTMLElement | null;

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
  get distance(): number {
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
   * Gives info in which direction the element will be moved
   *
   * @property moveDirection
   * @type Object
   */
  get moveDirection(): MoveDirection {
    const moveDirection = {
      left: false,
      right: false,
      top: false,
      bottom: false,
    };

    if (!this.isDragging) {
      return moveDirection;
    }

    const dragOriginX = this._dragOriginX;
    const dragOriginY = this._dragOriginY;

    if (dragOriginX && this._pageX && dragOriginX > this._pageX) {
      moveDirection.left = true;
    }

    if (dragOriginX && this._pageX && dragOriginX < this._pageX) {
      moveDirection.right = true;
    }

    if (dragOriginY && this._pageY && dragOriginY > this._pageY) {
      moveDirection.top = true;
    }

    if (dragOriginY && this._pageY && dragOriginY < this._pageY) {
      moveDirection.bottom = true;
    }

    return moveDirection;
  }

  /**
   Action that fires when the item starts being dragged.
   @property onDragStart
   @type Function
   @param {Object} item model
   @default null
   */
  get onDragStart(): (item: T) => void {
    return this.named.onDragStart || ((item: T) => item);
  }

  /**
   Action that fires when the item stops being dragged.
   @property onDragStop
   @type Function
   @param {Object} item model
   @default null
   */
  get onDragStop(): (item: T) => void {
    return this.named.onDragStop || ((item: T) => item);
  }

  /**
   True if the item is currently dropping.
   @property isDropping
   @type Boolean
   @default false
   */
  _isDropping = false;
  get isDropping(): boolean {
    return this._isDropping;
  }
  set isDropping(value: boolean) {
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
  get isBusy(): boolean {
    return this.isDragging || this.isDropping;
  }

  /**
   @property disableCheckScrollBounds
   */
  get disableCheckScrollBounds(): boolean {
    return this.named.disableCheckScrollBounds !== undefined ? this.named.disableCheckScrollBounds : isTesting();
  }

  /**
   @method mouseDown
   */
  @action
  mouseDown(event: MouseEvent) {
    if (event.which !== 1) {
      return;
    }
    if (event.ctrlKey) {
      return;
    }

    this._primeDrag(event);
  }

  @action
  keyDown(event: Event) {
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
  touchStart(event: TouchEvent) {
    this._primeDrag(event);
  }

  /**
   @method freeze
   */
  freeze(): void {
    const el = this.element;
    if (!el) {
      return;
    }

    el.style.transition = 'none';
  }

  /**
   @method reset
   */
  reset(): void {
    const el = this.element;
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
  thaw(): void {
    const el = this.element;
    if (!el) {
      return;
    }

    el.style.transition = '';
  }

  _prepareDragListener!: () => void;
  _cancelStartDragListener!: () => void;

  /**
   * Setup event listeners for drag and drop
   *
   * @method _primeDrag
   * @param {Event} startEvent JS Event object
   * @private
   */
  _primeDrag(startEvent: Event) {
    if (this.isDisabled) {
      return;
    }

    if (this.handleElement && !(startEvent.target as HTMLElement | null)?.closest(this.handle)) {
      return;
    }

    startEvent.preventDefault();
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
  _prepareDrag(startEvent: MouseEvent, event: MouseEvent) {
    // Block drag start while any item has busy state
    if (this.sortableGroup.sortedItems.some((x) => x.isBusy)) {
      return;
    }
    const distance = this.distance;
    const dx = Math.abs(getX(startEvent) - getX(event));
    const dy = Math.abs(getY(startEvent) - getY(event));

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
  _startDrag(event: MouseEvent | TouchEvent) {
    if (this.isBusy) {
      return;
    }

    const drag = this._makeDragHandler(event);
    const dragThrottled = (ev: Event) => throttle(this, drag, ev, 16, false);

    const drop = () => {
      DRAG_ACTIONS.forEach((event) => window.removeEventListener(event, dragThrottled));
      END_ACTIONS.forEach((event) => window.removeEventListener(event, drop));

      run(() => {
        this._drop();
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

  _scrollOnEdges(drag: (event: FakeEvent | Event) => void) {
    const groupDirection = this.direction;
    const element = this.element;
    const scrollContainer = new ScrollContainer(scrollParent(element));
    const itemContainer: ItemContainer = {
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

    let leadingEdgeKey: keyof ItemContainer,
      trailingEdgeKey: keyof ItemContainer,
      scrollKey: keyof ScrollContainer,
      pageKey: keyof FakeEvent;
    if (groupDirection === 'grid' || groupDirection === 'x') {
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

    const createFakeEvent = (): FakeEvent | void => {
      if (this._pageX == null && this._pageY == null) {
        return;
      }
      return {
        pageX: this._pageX ?? 0,
        pageY: this._pageY ?? 0,
        clientX: this._pageX ?? 0,
        clientY: this._pageY ?? 0,
      };
    };

    // Set a trigger padding that will start scrolling
    // the box when the item reaches within padding pixels
    // of the edge of the scroll container.
    const checkScrollBounds = () => {
      const leadingEdge = itemContainer[leadingEdgeKey];
      const trailingEdge = itemContainer[trailingEdgeKey];
      const scroll = scrollContainer[scrollKey]();

      let delta = 0;
      if (trailingEdge >= scrollContainer[trailingEdgeKey]) {
        delta = trailingEdge - scrollContainer[trailingEdgeKey];
      } else if (leadingEdge <= scrollContainer[leadingEdgeKey]) {
        delta = leadingEdge - scrollContainer[leadingEdgeKey];
      }

      if (delta !== 0) {
        const speed = this.maxScrollSpeed;
        delta = Math.min(Math.max(delta, -1 * speed), speed);

        delta = scrollContainer[scrollKey](scroll + delta) - scroll;

        const event = createFakeEvent();
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
  _makeDragHandler(startEvent: FakeEvent | Event): (event: FakeEvent | Event) => void {
    const groupDirection = this.direction;
    let dragOrigin: number;
    let elementOrigin: number;
    let scrollOrigin: number;
    const parentElement = this.element.parentNode as HTMLElement | null;

    if (!parentElement) {
      return () => {};
    }

    if (groupDirection === 'grid') {
      this.startEvent = startEvent;
      const dragOriginX = getX(startEvent);
      this._dragOriginX = getX(startEvent);
      const elementOriginX = this.x;
      const scrollOriginX = parentElement.getBoundingClientRect().left;

      const dragOriginY = getY(startEvent);
      this._dragOriginY = dragOriginY;
      const elementOriginY = this.y;
      const scrollOriginY = parentElement.getBoundingClientRect().top;

      return (event) => {
        this._pageX = getX(event);
        const dx = this._pageX - dragOriginX;
        const scrollX = parentElement.getBoundingClientRect().left;
        const x = elementOriginX + dx + (scrollOriginX - scrollX);

        this._pageY = getY(event);
        const dy = this._pageY - dragOriginY;
        const scrollY = parentElement.getBoundingClientRect().top;
        const y = elementOriginY + dy + (scrollOriginY - scrollY);

        this._drag(x, y);
      };
    }

    if (groupDirection === 'x') {
      dragOrigin = getX(startEvent);
      elementOrigin = this.x;
      scrollOrigin = parentElement.getBoundingClientRect().left;

      return (event) => {
        this._pageX = getX(event);
        const dx = this._pageX - dragOrigin;
        const scrollX = parentElement.getBoundingClientRect().left;
        const x = elementOrigin + dx + (scrollOrigin - scrollX);

        this._drag(x, 0);
      };
    }

    if (groupDirection === 'y') {
      dragOrigin = getY(startEvent);
      elementOrigin = this.y;
      scrollOrigin = parentElement.getBoundingClientRect().top;

      return (event) => {
        this._pageY = getY(event);
        const dy = this._pageY - dragOrigin;
        const scrollY = parentElement.getBoundingClientRect().top;
        const y = elementOrigin + dy + (scrollOrigin - scrollY);

        this._drag(0, y);
      };
    }

    return () => {};
  }

  /**
   @method _scheduleApplyPosition
   @private
   */
  _scheduleApplyPosition(): void {
    scheduleOnce('render', this, this._applyPosition);
  }

  /**
   @method _applyPosition
   @private
   */
  _applyPosition(): void {
    if (!this.element || !this.element) {
      return;
    }

    const groupDirection = this.direction;

    if (groupDirection === 'grid') {
      const x = this.x;
      const dx = x - this.element.offsetLeft + parseFloat(getComputedStyle(this.element).marginLeft);

      const y = this.y;
      const dy = y - this.element.offsetTop;

      this.element.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    if (groupDirection === 'x') {
      const x = this.x;
      const dx = x - this.element.offsetLeft + parseFloat(getComputedStyle(this.element).marginLeft);

      this.element.style.transform = `translateX(${dx}px)`;
    }
    if (groupDirection === 'y') {
      const y = this.y;
      const dy = y - this.element.offsetTop;

      this.element.style.transform = `translateY(${dy}px)`;
    }
  }

  /**
   @method _drag
   @private
   */
  _drag(dimensionX: number, dimensionY: number) {
    if (!this.isDragging) {
      return;
    }
    const updateInterval = this.updateInterval;

    this.x = dimensionX;
    this.y = dimensionY;

    // @ts-expect-error Argument of type 'this' is not assignable to parameter of type 'AnyFn'.
    throttle(this, this.sortableGroup.update, updateInterval);
  }

  /**
   @method _drop
   @private
   */
  _drop(): void {
    if (!this.element) {
      return;
    }

    const transitionPromise = this._waitForTransition();

    this._preventClick();

    // Get sortableItems before making drop end and pass it to update function
    // This is necessary for direction grid, otherwise ordering is not working correctly (because in sortedItems we check if item isDragged)
    // Calling this getter here, makes no difference for other directions
    const sortedItems = this.sortableGroup.sortedItems;

    set(this, 'isDragging', false);
    set(this, 'isDropping', true);

    this.sortableGroup.update(sortedItems);

    const allTransitionPromise = this._waitForAllTransitions();

    Promise.all([transitionPromise, allTransitionPromise]).then(() => this._complete());
  }

  /**
   @method _preventClick
   @private
   */
  _preventClick(): void {
    const selfCancellingCallback = (event: Event) => {
      this.element.removeEventListener(ELEMENT_CLICK_ACTION, selfCancellingCallback);
      this._preventClickHandler(event);
    };

    this.element.addEventListener(ELEMENT_CLICK_ACTION, selfCancellingCallback);
  }

  /**
   @method _preventClickHandler
   @private
   */
  _preventClickHandler(e: Event): void {
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
    let waiterToken: unknown;

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

      const duration = this.transitionDuration;

      // When transition is ended before we have added the event (found this issue already with 125ms), the dragging is blocked, since fully page refresh
      // To ensure that this would never happen, we need an later, to resolve the promise, when it wasn't resolved by transitionEnd
      // The duration addition with 200ms is just a choice (taken from else case), its just a way to let transitionend a little bit more time
      // Note: Unfortunately this issue is also not solvable with Element.getAnimations(), getAnimations brings no active animation at this point
      later(() => {
        deferred.resolve();
      }, duration + 200);
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
   @method _waitForTransitions
   @private
   @return Promise
   */
  _waitForAllTransitions() {
    let waiterToken: unknown;

    if (DEBUG) {
      waiterToken = sortableItemWaiter.beginAsync();
    }

    let transitionPromise;

    if (this.isAnimated) {
      const animations = this.sortableGroup.sortedItems.map((x) => x.element.getAnimations());

      const animationPromises = animations.flatMap((animationList) => {
        return animationList.map(animation => animation.finished);
      });

      transitionPromise = Promise.all(animationPromises);
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
  _complete(): void {
    this.onDragStop(this.model);
    set(this, 'isDropping', false);
    set(this, 'wasDropped', true);
    this.sortableGroup.commit();
  }

  get isAnimated(): boolean | undefined {
    if (!this.element) {
      return undefined;
    }

    const el = this.element;
    const transitionProperty = getComputedStyle(el).transitionProperty;

    return /all|transform/.test(transitionProperty) && this.transitionDuration > 0;
  }

  /**
   The current transition duration in milliseconds.
   @property transitionDuration
   @type Number
   */
  get transitionDuration(): number {
    const items = this.sortableGroup.sortedItems.filter((x) => !x.isDragging && !x.isDropping);
    const el = items[0]?.element ?? this.element; // Fallback when only one element is present in list
    const rule = getComputedStyle(el).transitionDuration;
    const match = rule.match(/([\d.]+)([ms]*)/);

    if (match) {
      let value = parseFloat(match[1] ?? '');
      const unit = match[2];

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
  get x(): number {
    if (this._x === undefined) {
      const marginLeft = parseFloat(getComputedStyle(this.element).marginLeft);
      this._x = this.element.scrollLeft + this.element.offsetLeft - marginLeft;
    }

    return this._x;
  }
  set x(value: number) {
    if (value !== this._x) {
      this._x = value;
      this._scheduleApplyPosition();
    }
  }

  /**
   Vertical position of the item relative to its offset parent.
   @property y
   @type Number
   */
  get y(): number {
    if (this._y === undefined) {
      this._y = this.element.offsetTop;
    }

    return this._y;
  }

  set y(value: number) {
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
  get width(): number {
    const el = this.element;
    let width = el.offsetWidth;
    const elStyles = getComputedStyle(el);

    width += parseInt(elStyles.marginLeft) + parseInt(elStyles.marginRight); // equal to jQuery.outerWidth(true)

    width += getBorderSpacing(el).horizontal;

    return width;
  }

  /**
   Height of the item including margins.
   @property height
   @type Number
   */
  get height(): number {
    const el = this.element;
    let height = el.offsetHeight;
    const elStyles = getComputedStyle(el);

    // This is needed atm only for grid, to fix jumping on drag-start.
    // In test-app it looks like there is a side-effect when we activate also for direction vertical.
    // If any user will anytime report a jumping in vertical direction, we should activate for every direction and fix our test-app
    if (this.direction === 'grid') {
      height += parseFloat(elStyles.marginTop);
    }

    height += parseFloat(elStyles.marginBottom);

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

  setupHandleElement(disabled = false) {
    this.handleElement = this.element.querySelector(this.handle);

    const touchAction = disabled ? 'initial' : 'none';
    if (this.handleElement) {
      this.handleElement.style['touchAction'] = touchAction;
    } else {
      this.element.style['touchAction'] = touchAction;
    }
  }

  element!: HTMLElement;
  didSetup = false;
  named!: NamedArgs<SortableItemModifierSignature<T>>;

  /**
   * tracks if event listeners have been registered. Registering event handlers is unnecessary if item is disabled.
   */
  listenersRegistered = false;

  constructor(owner: Owner, args: ArgsFor<SortableItemModifierSignature<T>>) {
    super(owner, args);
    registerDestructor(this, cleanup);
  }

  override modify(
    element: HTMLElement,
    _positional: PositionalArgs<SortableItemModifierSignature<T>>,
    named: NamedArgs<SortableItemModifierSignature<T>>,
  ) {
    this.element = element;
    this.named = named;

    this.element.classList.add(this.className);

    // Instead of using `event.preventDefault()` in the 'primeDrag' event,
    // (doesn't work in Chrome 56), we set touch-action: none as a workaround.
    this.setupHandleElement(this.named.disabled);

    if (!this.didSetup) {
      this.element.dataset['sortableItem'] = 'true';
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
function cleanup<T>(instance: SortableItemModifier<T>) {
  instance.removeEventListener();
  instance.sortableService.deregisterItem(instance.groupName, instance);
}
