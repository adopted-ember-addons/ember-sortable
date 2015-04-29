import transitionend from 'ember-sortable/utils/transitionend';
import { module, test } from 'qunit';
import Ember from 'ember';
const { typeOf } = Ember;

module('transitionend');

test('it returns the correct transitionend event', function(assert) {
  assert.equal(typeOf(transitionend), 'string',
    'expected transitionend to be a string');
});
