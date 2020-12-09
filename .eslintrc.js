"use strict";

module.exports = {
  root: true,
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  plugins: ["ember"],
  extends: ["eslint:recommended", "plugin:ember/recommended"],
  env: {
    browser: true,
  },
  rules: {
    "ember/no-arrow-function-computed-properties": [
      "error",
      { onlyThisContexts: true },
    ],
    "getter-return": ["error", { allowImplicit: true }],
    "ember/closure-actions": "off",
    "no-console": ["error", { allow: ["warn", "error"] }],
    "arrow-spacing": "error",
  },
  overrides: [
    // node files
    {
      files: [
        ".eslintrc.js",
        ".template-lintrc.js",
        "ember-cli-build.js",
        "index.js",
        "testem.js",
        "blueprints/*/index.js",
        "config/**/*.js",
        "tests/dummy/config/**/*.js",
      ],
      excludedFiles: [
        "addon/**",
        "addon-test-support/**",
        "app/**",
        "tests/dummy/app/**",
      ],
      parserOptions: {
        sourceType: "script",
        ecmaVersion: 2015,
      },
      env: {
        browser: false,
        node: true,
      },
      plugins: ["node"],
      extends: ["plugin:node/recommended"],
    },
  ],
};
