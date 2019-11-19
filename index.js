'use strict';

module.exports = {
  name: require('./package').name,

  included(app) {
    this._super.included(...arguments);

    app.import('vendor/polyfills/closest.js', { prepend: true});
  }
};
