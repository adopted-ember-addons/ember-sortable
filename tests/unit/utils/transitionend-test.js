import { typeOf } from '@ember/utils';
import transitionend from 'ember-sortable/utils/transitionend';
import { module, test } from 'qunit';

module('transitionend');

test('it returns the correct transitionend event', function(assert) {
  assert.equal(typeOf(transitionend), 'string',
    'expected transitionend to be a string');
});
