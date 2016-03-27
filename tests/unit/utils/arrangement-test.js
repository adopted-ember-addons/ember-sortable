import Arrangement from 'ember-sortable/utils/arrangement';
import { module, test } from 'qunit';

module('Unit | Utility | Arrangement');

test('moveNode 2 slots up', function(assert) {
  let a = { id: 'a' };
  let b = { id: 'b' };
  let c = { id: 'c' };
  let arrangement = new Arrangement([
    { node: a, x: 0, y: 0,  width: 10, height: 10 },
    { node: b, x: 0, y: 10, width: 10, height: 10 },
    { node: c, x: 0, y: 20, width: 10, height: 10 },
  ]);

  arrangement.moveNode(c, { x: 0, y: 0 });

  assert.deepEqual(arrangement.slots, [
    { node: c, x: 0, y: 0,  width: 10, height: 10 },
    { node: a, x: 0, y: 10, width: 10, height: 10 },
    { node: b, x: 0, y: 20, width: 10, height: 10 }
  ]);
});

test('moveNode 2 slots down', function(assert) {
  let a = { id: 'a' };
  let b = { id: 'b' };
  let c = { id: 'c' };
  let arrangement = new Arrangement([
    { node: a, x: 0, y: 0,  width: 10, height: 10 },
    { node: b, x: 0, y: 10, width: 10, height: 10 },
    { node: c, x: 0, y: 20, width: 10, height: 10 },
  ]);

  arrangement.moveNode(a, { x: 0, y: 20 });

  assert.deepEqual(arrangement.slots, [
    { node: b, x: 0, y: 0,  width: 10, height: 10 },
    { node: c, x: 0, y: 10, width: 10, height: 10 },
    { node: a, x: 0, y: 20, width: 10, height: 10 }
  ]);
});

test('moveNode 2 slots left', function(assert) {
  let a = { id: 'a' };
  let b = { id: 'b' };
  let c = { id: 'c' };
  let arrangement = new Arrangement([
    { node: a, x: 0,  y: 0, width: 10, height: 10 },
    { node: b, x: 10, y: 0, width: 10, height: 10 },
    { node: c, x: 20, y: 0, width: 10, height: 10 },
  ]);

  arrangement.moveNode(c, { x: 0, y: 0 });

  assert.deepEqual(arrangement.slots, [
    { node: c, x: 0,  y: 0, width: 10, height: 10 },
    { node: a, x: 10, y: 0, width: 10, height: 10 },
    { node: b, x: 20, y: 0, width: 10, height: 10 }
  ]);
});

test('moveNode 2 slots right', function(assert) {
  let a = { id: 'a' };
  let b = { id: 'b' };
  let c = { id: 'c' };
  let arrangement = new Arrangement([
    { node: a, x: 0,  y: 0, width: 10, height: 10 },
    { node: b, x: 10, y: 0, width: 10, height: 10 },
    { node: c, x: 20, y: 0, width: 10, height: 10 },
  ]);

  arrangement.moveNode(a, { x: 20, y: 0 });

  assert.deepEqual(arrangement.slots, [
    { node: b, x: 0,  y: 0, width: 10, height: 10 },
    { node: c, x: 10, y: 0, width: 10, height: 10 },
    { node: a, x: 20, y: 0, width: 10, height: 10 }
  ]);
});
