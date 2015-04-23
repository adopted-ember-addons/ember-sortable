import Ember from 'ember';
import layout from '../templates/components/sortable-item';
const { $, Component, computed, on } = Ember;
const UPDATE_THROTTLE = 125;

export default Component.extend({
  layout: layout,
  classNames: ['sortable-item'],
  classNameBindings: ['isDragging'],

  /**
    Group to which item belongs.

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
    Vertical position of the item relative to its offset parent.

    @property y
    @type Number
  */
  y: computed(function() {
    return this.$().position().top;
  }).volatile(),

  /**
    Height of the item including margins.

    @property height
    @type Number
  */
  height: computed(function() {
    return this.$().outerHeight(true);
  }).volatile(),


  /**
    @method didInsertElement
  */
  didInsertElement() {
    this.tellGroup('registerItem', this);
  },

  /**
    @method willDestroyElement
  */
  willDestroyElement() {
    this.tellGroup('deregisterItem', this);
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

    let oy = getY(event);

    let drag = event => {
      event.dy = getY(event) - oy;

      this._drag(event);
    }

    let drop = event => {
      $('body')
        .off('mousemove touchmove', drag)
        .off('mouseup touchend', drop);

      this._drop(event);
    }

    $('body')
      .on('mousemove touchmove', drag)
      .on('mouseup touchend', drop);

    this.set('isDragging', true);
  },

  /**
    @method _drag
    @private
  */
  drag(event) {
    this.$().css({
      transform: `translate3d(0, ${event.dy}px, 0)`
    });

    run.throttle(this, 'tellGroup', 'update', UPDATE_THROTTLE);
  },

  /**
    @method _drop
    @private
  */
  _drop(event) {
    this.set('isDragging', false);
    this.tellGroup('commit');
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
