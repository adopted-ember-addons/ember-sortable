import identify from './identify';

export default class Slot {

  constructor(node) {
    let $e = node.$();
    let { left: x, top: y } = $e.offset();

    this.node = node;
    this.id = identify(node);
    this.ox = x;
    this.oy = y;
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

  get x() {
    return this.ox + this.dx;
  }

  get y() {
    return this.oy + this.dy;
  }

  get width() {
    return this.ow + this.dw;
  }

  get height() {
    return this.oh + this.dh;
  }

  get outerWidth() {
    return this.width + this.pw;
  }

  get outerHeight()  {
    return this.height + this.ph;
  }

  get bounds() {
    let top = this.y;
    let left = this.x;
    let bottom = top + this.outerHeight;
    let right = left + this.outerWidth;

    return { top, left, bottom, right };
  }

  translateBy(x, y) {
    this.dx += x;
    this.dy += y;
  }

  resizeBy(w, h) {
    this.dw += w;
    this.dh += h;
  }

  render() {
    let { node, width, height, dx, dy } = this;
    let transform = `translate(${dx}px, ${dy}px)`;

    node.$().css({ width, height, transform });
  }

  clear() {
    let { node } = this;

    node.$().css({ width: '', height: '', transform: '' });
  }

}
