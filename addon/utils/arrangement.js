import Slot from './slot';
import identify from './identify';

export default class Arrangement {

  constructor(rootNode) {
    this.root = new Slot(rootNode);
    this.indexPaths();
  }

  indexPaths() {
    this.paths = {};
    this.walkTree(({ id }, path) => this.paths[id] = path);
  }

  moveNode(node, point) {
    let slot = this.removeNode(node);
    if (slot) {
      this.addSlotAtPoint(slot, point);
    }
  }

  render() {
    this.walkTree(slot => slot.render());
  }

  clear() {
    this.walkTree(slow => slow.clear());
  }

  removeNode(node) {
    let id = identify(node);
    let path = this.paths[id];

    if (!path) { return; }

    let index = path[path.length - 1];
    let parentPath = path.slice(0, -1);
    let slot = this.slotForPath(path);
    let parent = this.slotForPath(parentPath);
    let affectedSiblings = parent.children.slice(index);

    let offset = -slot.outerHeight;

    parent.children.splice(index, 1);
    this.indexPaths();

    affectedSiblings.forEach(s => s.shiftBy(offset));
    this.walkPath(parentPath, s => s.resizeBy(offset));

    return slot;
  }

  addSlotAtPoint(slot, point) {
    let { x, y } = point;

    let within = slot => {
      let { top, left, bottom, right } = slot.rect;
      return left <= x && x <= right && top <= y && y <= bottom;
    };

    let find = candidates => {
      let candidate = candidates.find(within);

      if (candidate) {
        return find(candidate.children) || candidate;
      }
    };

    let findIndex = slots => {
      for (let i = slots.length - 1; i >= 0; i--) {
        let { y } = newSiblings[i];
        if (top <= y) { return i; }
      }

      return 0;
    };

    let newParent = find([this.root]);
    let newSiblings = newParent.children;
    let newIndex = findIndex(newSiblings);
    let parentPath = this.paths[newParent.id];
    let offset = slot.outerHeight;

    newSiblings.splice(newIndex, 0, slot);

    this.walkPath(parentPath, s => s.resizeBy(offset));
    newSiblings.slice(newIndex + 1).forEach(s => s.shiftBy(offset));

    this.indexPaths();
  }

  slotForPath(path) {
    return path.reduce(
      (result, index) => result.children[index],
      { children: [this.root] }
    );
  }

  walkTree(func) {
    walk(this.root, func);
  }

  walkPath(path, func) {
    let cursor = { children: [this.root] };

    path.forEach(index => {
      cursor = cursor.children[index];
      func(cursor);
    });
  }

  metaFor(node) {
    let id = identify(node);
    let path = this.paths[id];
    let parentPath = path.slice(0, -1);
    let slot = this.slotForPath(path);
    let parentSlot = this.slotForPath(parentPath);
    let parent = parentSlot.node;
    let position = parentSlot.children.indexOf(slot);

    return { parent, position };
  }
}

function walk(slot, func, path = [0]) {
  func(slot, path);

  slot.children.forEach((child, index) => {
    walk(child, func, path.concat(index));
  });
}
