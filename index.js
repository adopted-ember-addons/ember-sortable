'use strict';

const fs = require('fs');

module.exports = {
  name: require('./package').name,

  included(app) {
    this._super.included.apply(this, arguments);

    // Sometimes, consuming app production build can't find the vendor, so it'll break the build with a sourceMapConcat error.
    // So guarding this with a if polyfill exists.
    if (fs.existsSync('vendor/polyfills/closest.js')) {
      app.import('vendor/polyfills/closest.js', { prepend: true});
    }
  }
};
