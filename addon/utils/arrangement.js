import Slot from './slot';
import identify from './identify';

export default class Arrangement {

  constructor(rootNode) {
    this.root = new Slot(rootNode);
    this.reindex();
  }

  reindex() {
    this.paths = {};
    this.walkTree(({ id }, path) => this.paths[id] = path);
  }

  moveNode(node, point) {
    let id = identify(node);
    let path = this.paths[id];
    let slot = this.slotForPath(path);
    let oldParentPath = path.slice(0, -1);
    let oldParent = this.slotForPath(oldParentPath);
    let oldPosition = path[path.length - 1];
    let { parent, position } = this.findHome(slot, point);

    if (!parent) { return; }

    if (oldParent === parent && oldPosition === position) { return; }
    if (oldParent === parent && oldPosition < position) { position -= 1; }

    let offset = slot.outerHeight + slot.margins.bottom;
    let siblings = parent.children;

    this.detachNode(node);

    siblings.splice(position, 0, slot);
    this.reindex();

    let prevSibling = siblings[position - 1];
    let parentPath = this.paths[parent.id];
    let tail = siblings.slice(position);

    tail.forEach(s => s.translateBy(0, offset));
    this.walkPath(parentPath, s => s.resizeBy(0, offset));

    if (prevSibling) {
      slot.y = prevSibling.bounds.bottom + Math.max(prevSibling.margins.bottom, slot.margins.top);
    } else {
      slot.y = parent.y;
    }
  }

  detachNode(node) {
    let id = identify(node);
    let path = this.paths[id];
    let parentPath = path.slice(0, -1);
    let index = path[path.length - 1];
    let slot = this.slotForPath(path);
    let parent = this.slotForPath(parentPath);
    let offset = -(slot.outerHeight + slot.margins.bottom);
    let tail = parent.children.slice(index + 1);

    parent.children.splice(index, 1);
    this.reindex();

    tail.forEach(s => s.translateBy(0, offset));
    this.walkPath(parentPath, s => s.resizeBy(0, offset));
  }

  findHome(slot, point) {
    let parent = findParent([this.root], slot, point);
    let slotPoint = { y: slot.oy + point.dy };
    let position = parent && findPosition(parent.children, slotPoint);

    return { parent, position };
  }

  render() {
    this.walkTree(slot => slot.render());
  }

  clear() {
    this.walkTree(slot => slot.clear());
  }

  freeze() {
    this.walkTree(slot => slot.freeze());
  }

  thaw() {
    this.walkTree(slot => slot.thaw());
  }

  slotForPath(path) {
    return path.reduce(
      ({ children }, index) => children[index],
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

  slotForNode(node) {
    let id = identify(node);
    let path = this.paths[id];
    let result = this.slotForPath(path);

    return result;
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

function findParent(candidates, slot, point) {
  let candidate = candidates.find(c => {
    return c.covers(point) && c.canReceiveNode(slot.node);
  });

  if (candidate) {
    let sx = slot.ox + point.dx;
    let cx = candidate.x;
    let dx = sx - cx;
    let threshold = 8;
    let shouldDescend = dx >= threshold;
    let child = shouldDescend && findParent(candidate.children, slot, point);

    return child || candidate;
  } else {
    return null;
  }
}

function findPosition(slots, point) {
  let all = slots.concat(point).sort((a, b) => a.y - b.y);
  let result = all.indexOf(point);

  return result;
}
