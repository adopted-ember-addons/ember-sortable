'use strict';
const path = require('path');

module.exports = {
  name: require('./package').name,

  included(app) {
    app.import(path.join(this.treePaths.vendor, 'polyfills', 'closest.js'), { prepend: true})
  }
};
