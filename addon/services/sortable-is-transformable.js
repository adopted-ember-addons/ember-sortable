import Ember from 'ember';

export default Ember.Service.extend({
  /**
    @property _isTransformableLookup
    @private
  */
  _isTransformableLookup: {
    'table-row': null,
    'table-cell': null,
    'table-row-group': null,
    'table-caption': null,
    'table-header-group': null,
    'table-footer-group': null
  },

  /**
    @method check
  */
  check(displayType) {
    // if the scenario has already been calculated,
    // then just return its value
    if (_isTransformableLookup[displayType.toLowerCase()] !== null) {
      return _isTransformableLookup[displayType.toLowerCase()];
    }

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

      if (displayType.toLowerCase() === scenario.display) {
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

    // remove the test table
    testTable.remove();

    return pass;
  }
});
