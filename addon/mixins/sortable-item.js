import Ember from 'ember';
const { Mixin, $, computed, run } = Ember;
const { Promise } = Ember.RSVP;

export default Mixin.create({
  classNames: ['sortable-item'],
  classNameBindings: ['isDragging', 'isDropping'],

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
    True if the item is currently being dragged.

    @property isDragging
    @type Boolean
    @default false
  */
  isDragging: false,

  /**
    True if the item is currently dropping.

    @property isDropping
    @type Boolean
    @default false
  */
  isDropping: false,

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
    True if the item transitions with animation.

    @property isAnimated
    @type Boolean
  */
  isAnimated: computed(function() {
    let el = this.$();
    let property = el.css('transition-property');

    return /all|transform/.test(property);
  }).volatile(),

  /**
    The current transition duration in milliseconds.

    @property transitionDuration
    @type Number
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
    Vertical position of the item relative to its offset parent.

    @property y
    @type Number
  */
  y: computed(function(_, value) {
    if (arguments.length === 2 && value !== this._y) {
      this._y = value;
      this._scheduleApplyPosition();
    }

    if (this._y === undefined) {
      this._y = this.element.offsetTop;
    }

    return this._y;
  }),

  /**
    Height of the item including margins.

    @property height
    @type Number
  */
  height: computed(function() {
    let height = this.$().outerHeight();
    let marginBottom = parseFloat(this.$().css('margin-bottom'));
    return height + marginBottom;
  }).volatile(),

  /**
    @method didInsertElement
  */
  didInsertElement() {
    this._tellGroup('registerItem', this);
  },

  /**
    @method willDestroyElement
  */
  willDestroyElement() {
    this._tellGroup('deregisterItem', this);
  },

  /**
    @method mouseDown
  */
  mouseDown(event) {
    this._startDrag(event);
  },

  /**
    @method touchStart
  */
  touchStart(event) {
    this._startDrag(event);
  },

  /**
    @method _startDrag
    @private
  */
  _startDrag(event) {
    let handle = this.get('handle');

    if (handle && !$(event.target).is(handle)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (this.get('isBusy')) { return; }

    let dragOrigin = getY(event);
    let elementOrigin = this.get('y');

    let drag = event => {
      let dy = getY(event) - dragOrigin;
      let y = elementOrigin + dy;

      this._drag(y);
    };

    let drop = () => {
      $(window)
        .off('mousemove touchmove', drag)
        .off('mouseup touchend', drop);

      this._drop();
    };

    $(window)
      .on('mousemove touchmove', drag)
      .on('mouseup touchend', drop);

    this._tellGroup('prepare');
    this.set('isDragging', true);
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
    if (!this.element) { return; }

    let y = this.get('y');
    let dy = y - this.element.offsetTop;

    this.$().css({
      transform: `translateY(${dy}px)`
    });
  },

  /**
    @method _drag
    @private
  */
  _drag(y) {
    let updateInterval = this.get('updateInterval');

    this.set('y', y);

    run.throttle(this, '_tellGroup', 'update', updateInterval);
  },

  /**
    @method _drop
    @private
  */
  _drop() {
    if (!this.element) { return; }

    this.set('isDragging', false);
    this.set('isDropping', true);

    this._tellGroup('update');

    this._waitForTransition()
      .then(run.bind(this, '_complete'));
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
    this.set('isDropping', false);
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
    return event.pageY;
  }
}
