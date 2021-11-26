'use strict';

module.exports = function (environment) {
  const ENV = {
    environment,

    'ember-a11y-testing': {
      componentOptions: {
        turnAuditOff: true,
        excludeAxeCore: true,
        axeOptions: {
          iframes: false,
          reporter: 'v2',
          resultTypes: ['violations'],
          rules: {
            'duplicate-id': { enabled: false },
            'duplicate-id-active': { enabled: false },
            'duplicate-id-aria': { enabled: false },
          },
        },
      },
    },
  };

  return ENV;
};
