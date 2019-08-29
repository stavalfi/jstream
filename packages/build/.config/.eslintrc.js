const {
  paths: { webpackConfigPath },
} = require('./utils')

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      classes: true,
      modules: true,
      legacyDecorators: true,
      jsx: true,
    },
  },
  env: {
    es6: true,
    browser: true,
    node: true,
    mocha: true,
    'jest/globals': true,
    jest: true,
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'json', 'import', 'jest'],
  extends: [
    'eslint:recommended',
    'prettier',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:jest/recommended',
  ],
  globals: {
    __DEV__: true,
  },
  rules: {
    'jest/valid-expect': 'off',
    'eol-last': 0,
    'jsx-quotes': 1,
    'new-cap': 0,
    'no-console': 'off',
    'no-debugger': 1,
    'no-underscore-dangle': 0,
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { vars: 'local', args: 'none', ignoreRestSiblings: true }],
    'no-use-before-define': 0,
    'prefer-template': 1,
    'react/jsx-no-undef': 1,
    'react/jsx-uses-react': 1,
    'react/jsx-uses-vars': 1,
    'space-before-blocks': 1,
    strict: 0,
    'no-useless-escape': 0,
    'getter-return': 0,
    curly: 'error',
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/default': 'error',
    'import/no-extraneous-dependencies': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: webpackConfigPath,
      },
    },
  },
}
