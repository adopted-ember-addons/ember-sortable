import Ember from 'ember';
import SortableItemMixin from 'ember-sortable/mixins/sortable-item';
import { module, test } from 'qunit';

let Klass;
let subject;
let el;

module('mixin:sortable-item', {
  beforeEach() {
    el = $('<div />');
    Klass = Ember.Object.extend(SortableItemMixin, {
      $() { return el; }
    });
    subject = Klass.create();
  }
});

test('isAnimated with transform and duration', function(assert) {
  el.css({ transition: 'all .25s' });

  assert.equal(subject.get('isAnimated'), true,
    'expected isAnimated to be true');
});

test('isAnimated with transform but no duration', function(assert) {
  el.css({ transition: 'all 0s' });

  assert.equal(subject.get('isAnimated'), false,
    'expected isAnimated to be false');
});

test('isAnimated with duration but no transform', function(assert) {
  el.css({ transition: 'none' });

  assert.equal(subject.get('isAnimated'), false,
    'expected isAnimated to be false');
});
