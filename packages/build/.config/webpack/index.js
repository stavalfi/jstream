const externals = require('./externals')
const output = require('./output')
const moduleWithRules = require('./module-with-rules')
const resolve = require('./resolve')
const plugins = require('./plugins')
const devServer = require('./dev-server')
const optimization = require('./optimization')

module.exports = {
  externals,
  output,
  moduleWithRules,
  resolve,
  plugins,
  devServer,
  optimization,
}
