import identify from './identify';
import getMargins from './get-margins';
import Ember from 'ember';

const { get } = Ember;

/**
  @class Slot
  @constructor
  @param {SortableNode} node
*/
export default class Slot {

  constructor(node) {
    let $e = node.$();
    let { left: ox, top: oy } = $e.offset();

    this.node = node;
    this.id = identify(node);
    this.ox = ox;
    this.oy = oy;
    this.ow = $e.width();
    this.oh = $e.height();
    this.pw = $e.outerWidth() - this.ow;
    this.ph = $e.outerHeight() - this.oh;
    this.dx = 0;
    this.dy = 0;
    this.dw = 0;
    this.dh = 0;
    this.children = node.sortableChildren.map(n => new Slot(n));
  }

  /**
    @property x
    @type number
  */
  get x() {
    return this.ox + this.dx;
  }
  set x(value) {
    this.dx = value - this.ox;
  }

  /**
    @property y
    @type number
  */
  get y() {
    return this.oy + this.dy;
  }
  set y(value) {
    this.dy = value - this.oy;
  }

  /**
    @property width
    @type number
  */
  get width() {
    return this.ow + this.dw;
  }
  set width(value) {
    this.dw = value - this.ow;
  }

  /**
    @property height
    @type number
  */
  get height() {
    return this.oh + this.dh;
  }
  set height(value) {
    this.dh = value - this.oh;
  }

  /**
    @property outerWidth
    @type number
  */
  get outerWidth() {
    return this.width + this.pw;
  }

  /**
    @property outerHeight
    @type number
  */
  get outerHeight()  {
    return this.height + this.ph;
  }

  /**
    @property bounds
    @type { top: number, left: number, bottom: number, right: number }
  */
  get bounds() {
    let top = this.y;
    let left = this.x;
    let bottom = top + this.outerHeight;
    let right = left + this.outerWidth;

    return { top, left, bottom, right };
  }

  /**
    @property margins
    @type { top: number, left: number, bottom: number, right: number }
  */
  get margins() {
    return getMargins(this.node.element);
  }

  /**
    @method translateBy
    @param {number} x
    @param {number} y
  */
  translateBy(x, y) {
    this.dx += x;
    this.dy += y;
  }

  /**
    @method resizeBy
    @param {number} x
    @param {number} y
  */
  resizeBy(x, y) {
    this.dw += x;
    this.dh += y;
  }

  /**
    Apply slot styles to DOM element.
    @method render
  */
  render() {
    let { node, width, height, dx, dy } = this;
    let transform = `translate(${dx}px, ${dy}px)`;

    node.$().css({ width, height, transform });
  }

  /**
    Clear slot styles from DOM element.
    @method clear
  */
  clear() {
    let { node } = this;

    node.$().css({ width: '', height: '', transform: '' });
  }

  /**
    @method covers
    @param {Object} point
  */
  covers({ x, y }) {
    let { top, left, bottom, right } = this.bounds;

    return left <= x && x <= right && top <= y && y <= bottom;
  }

  /**
    @method canReceiveNode
    @param {SortableNode} node
  */
  canReceiveNode(node) {
    if (node === this.node) { return false; }

    let hook = get(this.node, 'canReceiveSortable');
    let type = typeof hook;

    if (type === 'undefined') { hook = true; }
    if (type === 'function') { hook = this.node.canReceiveSortable(node); }

    return !!hook;
  }

}
