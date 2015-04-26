import Ember from 'ember';
const { Mixin, $, computed, run } = Ember;

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
    let duration = parseFloat(el.css('transition-duration'));
    let result = property.match(/all|transform/) && duration > 0;

    return !!result;
  }).volatile(),

  /**
    Vertical position of the item relative to its offset parent.

    @property y
    @type Number
  */
  y: computed(function(_, value) {
    if (arguments.length === 2) {
      this._y = value;
      this._scheduleApplyPosition();
    }

    if (this._y !== undefined) {
      return this._y;
    } else {
      return this.element.offsetTop;
    }
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
    event.preventDefault();
    event.stopPropagation();

    if (this.get('isDragging')) { return; }
    if (this.get('isDropping')) { return; }

    let updateInterval = this.get('updateInterval');
    let originalElementY = this.get('y');
    let dragStartY = getY(event);

    let complete = () => {
      this.set('isDropping', false);
      this._tellGroup('commit');
    };

    let drag = event => {
      let dy = getY(event) - dragStartY;
      let y = originalElementY + dy;

      this.set('y', y);
      run.throttle(this, '_tellGroup', 'update', updateInterval);
    };

    let drop = () => {
      $(window)
        .off('mousemove touchmove', drag)
        .off('mouseup touchend', drop);

      if (!this.element) { return; }

      this.set('isDragging', false);
      this.set('isDropping', true);

      this._tellGroup('update');

      run.next(() => {
        if (this.get('isAnimated')) {
          this.$().one('transitionend', complete);
        } else {
          complete();
        }
      });
    };

    $(window)
      .on('mousemove touchmove', drag)
      .on('mouseup touchend', drop);

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
  let touches = event.originalEvent.changedTouches;
  let touch = touches && touches[0];

  if (touch) {
    return touch.screenY;
  } else {
    return event.pageY;
  }
}
