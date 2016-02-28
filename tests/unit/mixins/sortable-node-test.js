import Ember from 'ember';
import SortableNodeMixin from 'ember-sortable/mixins/sortable-node';
import { module, test } from 'qunit';

module('Unit | Mixin | sortable node');

// Replace this with your real tests.
test('it works', function(assert) {
  let SortableNodeObject = Ember.Object.extend(SortableNodeMixin);
  let subject = SortableNodeObject.create();
  assert.ok(subject);
});
