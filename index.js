'use strict';

const fs = require('fs');
const VersionChecker = require('ember-cli-version-checker');

module.exports = {
  name: require('./package').name,

  included(app) {
    this._super.included.apply(this, arguments);

    // Sometimes, consuming app production build can't find the vendor, so it'll break the build with a sourceMapConcat error.
    // So guarding this with a if polyfill exists.
    if (fs.existsSync('vendor/polyfills/closest.js')) {
      app.import('vendor/polyfills/closest.js', { prepend: true});
    }

    var checker = new VersionChecker(this);
    var emberVersion = checker.for('ember-source');

    if (emberVersion.lt('3.10.0')) {
      this.ui.writeWarnLine('ember-sortable requires the ember-decorator-polyfill. Please add it to your `package.json`.');
    }
  }
};
