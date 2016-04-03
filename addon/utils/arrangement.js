export default class Arrangement {

  constructor(rootNode) {
    this.root = slotForNode(rootNode);
    this.indexPaths();
  }

  indexPaths() {
    this.paths = {};
    this.walk(({ id }, path) => this.paths[id] = path);
  }

  moveNode(node, point) {
    this.removeNode(node);
    this.addNodeAtPoint(node, point);
  }

  render() {
    this.walk(slot => {
      let { node: { element }, dx, dy, height } = slot;

      element.style.transform = `translate(${dx}px, ${dy}px)`;
      element.style.height = `${height}px`;
    });
  }

  clear() {
    this.walk(slot => {
      let { node: { element } } = slot;

      element.style.transform = '';
      element.style.height = '';
    });
  }

  removeNode(node) {
    let id = identify(node);
    let path = this.paths[id];

    if (!path) { return; }

    let index = path[path.length - 1];
    let parentPath = path.slice(0, -1);
    let slot = this.slotForPath(path);
    let parent = this.slotForPath(parentPath);
    let offset = slot.outerHeight;
    let affectedSiblings = parent.children.slice(index + 1);

    parent.children.splice(index, 1);
    delete this.paths[id];

    let cursor = { children: [this.root] };
    parentPath.forEach(index => {
      cursor = cursor.children[index];
      cursor.height -= offset;
    });
    affectedSiblings.forEach(child => child.dy -= offset);
  }

  addNodeAtPoint(/* node, point */) {
    // console.log(node);
    // console.log(point);
  }

  walk(func) {
    walk(this.root, func);
  }

  slotForPath(path) {
    return path.reduce(
      (result, index) => result.children[index],
      { children: [this.root] }
    );
  }

}

function slotForNode(node) {
  let id = identify(node);
  let children = node.sortableChildren.map(slotForNode);
  let height = node.$().height();
  let outerHeight = node.$().outerHeight(true);
  let dx = 0;
  let dy = 0;

  return { id, node, dx, dy, height, outerHeight, children };
}

function identify(node) {
  return node.elementId;
}

function walk(slot, func, path = [0]) {
  func(slot, path);

  slot.children.forEach((child, index) => {
    walk(child, func, path.concat(index));
  });
}
