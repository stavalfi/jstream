const externals = require('./externals')
const moduleWithRules = require('./module-with-rules')
const resolve = require('./resolve')
const plugins = require('./plugins')
const devServer = require('./dev-server')

module.exports = {
  externals,
  moduleWithRules,
  resolve,
  plugins,
  devServer,
}
