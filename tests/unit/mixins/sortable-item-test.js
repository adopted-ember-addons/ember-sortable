import Ember from 'ember';
import SortableItemMixin from '../../../mixins/sortable-item';
import { module, test } from 'qunit';

module('SortableItemMixin');

// Replace this with your real tests.
test('it works', function(assert) {
  var SortableItemObject = Ember.Object.extend(SortableItemMixin);
  var subject = SortableItemObject.create();
  assert.ok(subject);
});
