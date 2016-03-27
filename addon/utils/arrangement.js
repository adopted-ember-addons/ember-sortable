export default class Arrangement {

  constructor(slots) {
    this.slots = slots;
  }

  moveNode(node, point) {
    let oldIndex = this.indexForNode(node);
    let newIndex = this.indexForPoint(point);

    if (newIndex > oldIndex) {
      for (let i = newIndex; i >= oldIndex; i--) {
        let memo = this.slots[i].node;
        this.slots[i].node = node;
        node = memo;
      }
    } else {
      for (let i = newIndex; i <= oldIndex; i++) {
        let memo = this.slots[i].node;
        this.slots[i].node = node;
        node = memo;
      }
    }
  }

  indexForNode(node) {
    return this.slots.findIndex(s => s.node === node);
  }

  indexForPoint({ x, y }) {
    for (let i = this.slots.length - 1; i >= 0; i--) {
      let slot = this.slots[i];

      if (slot.x <= x && slot.y <= y) {
        return i;
      }
    }
  }

}
