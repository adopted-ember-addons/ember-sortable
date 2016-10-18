import Ember from 'ember';

export default Ember.Service.extend({
  /**
    Lookup table which stores results of past tests for faster lookup,
    after the first computation,
    @property _isTransformableLookup
    @private
  */
  _isTransformableLookup: {
    'tr': null,
    'td': null,
    'tbody': null,
    'caption': null,
    'thead': null,
    'tfoot': null
  },

  /**
    Check if the selector in questions is a transformable element
    in the current browser.
    @method check
  */
  check(selector) {
    // if selector is null, default to true in order 
    // to maintain backwards compatability
    if (selector === null) {
      return true;
    }

    // if the scenario has already been calculated,
    // then just return its value
    let normalizedSelector = selector.toLowerCase();
    if (this.get(`_isTransformableLookup.${normalizedSelector}`) !== null) {
      console.log('lookup hit');
      return this.get(`_isTransformableLookup.${normalizedSelector}`);
    }
    console.log('lookup miss');
    const scenarios = [
      { display: 'table-row', selector: 'tr' },
      { display: 'table-cell', selector: 'td' },
      { display: 'table-row-group', selector: 'tbody' },
      { display: 'table-caption', selector: 'caption' },
      { display: 'table-header-group', selector: 'thead' },
      { display: 'table-footer-group', selector: 'tfoot' }
    ];

    let testTable = Ember.$(
      `<table id='test-drag-support'>
        <caption></caption>
        <thead>
          <tr><th></th></tr>
        </thead>
        <tbody>
          <tr><td></td></tr>
        </tbody>
        <tfoot>
          <tr><td></td></tr>
        </tfoot>
      </table>')`
    );

    // insert the test table so we can perform calculations
    testTable.css({
      display: 'block',
      position: 'absolute',
      top: '-1000px'
    });
    testTable.appendTo('body');

    let pass = true;

    for (let i = 0; i < scenarios.length; ++i) {
      let scenario = scenarios[i];

      if (normalizedSelector === scenario.selector) {
        /* Test Transformability */
        let element = testTable.find(scenario.selector).first(),
          initial = element[0].getBoundingClientRect().top,
          transformed;

        element.css({ transform: 'translateY(10px)'});
        transformed = element[0].getBoundingClientRect().top;

        pass = transformed === initial + 10;
        break;
      }
    }

    // remove the test table now that calculations are done
    testTable.remove();

    // save result of the calculation in the lookup table for future uses
    this.set('_isTransformableLookup', pass);

    return pass;
  }
});
