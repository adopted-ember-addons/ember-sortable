import identify from './identify';

export default class Slot {

  constructor(node) {
    this.node = node;
    this.id = identify(node);
    this.rect = node.element.getBoundingClientRect();
    this.dx = 0;
    this.dy = 0;
    this.height = node.$().height();
    this.outerHeight = node.$().outerHeight();
    this.children = node.sortableChildren.map(n => new Slot(n));
  }

  resizeBy(amount) {
    this.height += amount;
    this.outerHeight += amount;
  }

  shiftBy(amount) {
    this.dy += amount;
  }

  render() {
    let { node, height, dx, dy } = this;
    let transform = `translate(${dx}px, ${dy}px)`;

    node.$().css({ transform, height });
  }

  clear() {
    let { node } = this;

    node.$().css({ transform: '', height: '' });
  }

}
