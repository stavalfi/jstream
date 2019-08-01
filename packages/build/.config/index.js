const lintStagedConfig = require('./lint-staged.config')
const libTsConfig = require('./lib-tsconfig')
const babelConfig = require('./babel.config')
const eslintConfig = require('./.eslintrc')
const webpack = require('./webpack/webpack.config')
const utils = require('./utils')
const jest = require('./jest/jest.config')

module.exports = {
  lintStagedConfig,
  libTsConfig,
  babelConfig,
  eslintConfig,
  webpack,
  utils,
  jest,
}
