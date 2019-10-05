'use strict';

module.exports = {
  name: require('./package').name,

  included(app) {
    app.import('vendor/polyfills/closest.js', { prepend: true})
  }
};
