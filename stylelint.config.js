module.exports = {
  customSyntax: 'postcss-html',
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recommended-vue',
    'stylelint-config-prettier',
  ],
  // add your custom config here
  // https://stylelint.io/user-guide/configuration
  rules: {
    'function-no-unknown': null,
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'layer',
        ],
      },
    ],
    'at-rule-descriptor-no-unknown': null,
    'at-rule-descriptor-value-no-unknown': null,
    'at-rule-no-deprecated': null,
    'at-rule-prelude-no-invalid': null,
    'declaration-property-value-keyword-no-deprecated': null,
    'syntax-string-no-invalid': null,
  },
};
