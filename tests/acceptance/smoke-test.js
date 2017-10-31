import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import startApp from '../../tests/helpers/start-app';

module('Acceptance | smoke', {
  beforeEach: function() {
    this.application = startApp();
  },

  afterEach: function() {
    run(this.application, 'destroy');
  }
});

test('reordering with mouse events', function(assert) {
  visit('/');

  andThen(() => {
    assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');
  });

  reorder(
    'mouse',
    '.vertical-demo .handle',
    '[data-item=Cinco]',
    '[data-item=Cuatro]',
    '[data-item=Tres]',
    '[data-item=Dos]',
    '[data-item=Uno]'
  );

  andThen(() => {
    assert.equal(verticalContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(horizontalContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(tableContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(scrollableContents(), 'Cinco Cuatro Tres Dos Uno');
  });

  reorder(
    'mouse',
    '.horizontal-demo li',
    ':contains(Cuatro)',
    ':contains(Cinco)',
    ':contains(Dos)',
    ':contains(Uno)',
    ':contains(Tres)'
  );

  andThen(() => {
    assert.equal(verticalContents(), 'Cuatro Cinco Dos Uno Tres');
    assert.equal(horizontalContents(), 'Cuatro Cinco Dos Uno Tres');
    assert.equal(tableContents(), 'Cuatro Cinco Dos Uno Tres');
    assert.equal(scrollableContents(), 'Cuatro Cinco Dos Uno Tres');
  });

  reorder(
    'mouse',
    '.table-demo .handle',
    '[data-item=Uno]',
    '[data-item=Dos]',
    '[data-item=Tres]',
    '[data-item=Cuatro]',
    '[data-item=Cinco]'
  );

  andThen(() => {
    assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');
  });

  let itemHeight = () => {
    let item = findWithAssert('.scrollable-demo .sortable-item');
    return item.outerHeight() + parseInt(item.css('margin-top'));
  };

  drag(
    'mouse',
    '.scrollable-demo .handle[data-item=Uno]',
    () => {
      return { dy: itemHeight() + 1 };
    },
    {
      dragend: function() {
        findWithAssert('.scrollable-demo .sortable-container').scrollTop(0);
      },

      dragmove: function() {
        findWithAssert('.scrollable-demo .sortable-container').scrollTop(itemHeight());
      }
    }
  );

  andThen(() => {
    assert.equal(verticalContents(), 'Dos Tres Uno Cuatro Cinco');
    assert.equal(horizontalContents(), 'Dos Tres Uno Cuatro Cinco');
    assert.equal(tableContents(), 'Dos Tres Uno Cuatro Cinco');
    assert.equal(scrollableContents(), 'Dos Tres Uno Cuatro Cinco');
  });

  reorder(
    'mouse',
    '.vertical-distance-demo li',
    ':contains("Tres")',
    ':contains("Dos")',
    ':contains("Uno")',
    ':contains("Cuatro")',
    ':contains("Cinco")'
  );

  andThen(() => {
    assert.equal(verticalContents(), 'Tres Dos Uno Cuatro Cinco');
    assert.equal(horizontalContents(), 'Tres Dos Uno Cuatro Cinco');
    assert.equal(tableContents(), 'Tres Dos Uno Cuatro Cinco');
    assert.equal(scrollableContents(), 'Tres Dos Uno Cuatro Cinco');
  });
});

test('reordering with touch events', function(assert) {
  visit('/');

  andThen(() => {
    assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');
  });

  reorder(
    'touch',
    '.vertical-demo .handle',
    '[data-item=Cinco]',
    '[data-item=Cuatro]',
    '[data-item=Tres]',
    '[data-item=Dos]',
    '[data-item=Uno]'
  );

  andThen(() => {
    assert.equal(verticalContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(horizontalContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(tableContents(), 'Cinco Cuatro Tres Dos Uno');
    assert.equal(scrollableContents(), 'Cinco Cuatro Tres Dos Uno');
  });

  reorder(
    'touch',
    '.horizontal-demo li',
    ':contains(Cuatro)',
    ':contains(Cinco)',
    ':contains(Dos)',
    ':contains(Uno)',
    ':contains(Tres)'
  );

  andThen(() => {
    assert.equal(verticalContents(), 'Cuatro Cinco Dos Uno Tres');
    assert.equal(horizontalContents(), 'Cuatro Cinco Dos Uno Tres');
    assert.equal(tableContents(), 'Cuatro Cinco Dos Uno Tres');
    assert.equal(scrollableContents(), 'Cuatro Cinco Dos Uno Tres');
  });

  reorder(
    'touch',
    '.table-demo .handle',
    '[data-item=Uno]',
    '[data-item=Dos]',
    '[data-item=Tres]',
    '[data-item=Cuatro]',
    '[data-item=Cinco]'
  );

  andThen(() => {
    assert.equal(verticalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(horizontalContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(tableContents(), 'Uno Dos Tres Cuatro Cinco');
    assert.equal(scrollableContents(), 'Uno Dos Tres Cuatro Cinco');
  });

  reorder(
    'touch',
    '.vertical-distance-demo li',
    ':contains("Tres")',
    ':contains("Dos")',
    ':contains("Uno")',
    ':contains("Cuatro")',
    ':contains("Cinco")'
  );

  andThen(() => {
    assert.equal(verticalContents(), 'Tres Dos Uno Cuatro Cinco');
    assert.equal(horizontalContents(), 'Tres Dos Uno Cuatro Cinco');
    assert.equal(tableContents(), 'Tres Dos Uno Cuatro Cinco');
    assert.equal(scrollableContents(), 'Tres Dos Uno Cuatro Cinco');
  });
});

function verticalContents() {
  return contents('.vertical-demo ol');
}

function horizontalContents() {
  return contents('.horizontal-demo ol');
}

function tableContents() {
  return contents('.table-demo tbody');
}

function scrollableContents() {
  return contents('.scrollable-demo ol');
}

function contents(selector) {
  return find(selector)
    .text()
    .replace(/⇕/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^\s+/, '')
    .replace(/\s+$/, '');
}
