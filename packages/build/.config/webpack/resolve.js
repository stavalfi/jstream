const path = require('path')
const { webpackDevelopmentAlias, webpackOtherAlias, webpackProdAlias } = require('../utils/paths-resolving-strategies')

module.exports = ({ isDevelopmentMode, paths: { resolveModulesPathsArray }, constants: {} }) => {
  const baseAlias = isDevelopmentMode ? webpackDevelopmentAlias : webpackProdAlias
  return {
    extensions: ['.js', '.sass', '.json', '.ts', '.tsx'],
    modules: resolveModulesPathsArray,
    alias: {
      ...baseAlias,
      ...webpackOtherAlias,
      ...(isDevelopmentMode && { 'react-dom': '@hot-loader/react-dom' }),
    },
    plugins: [new MyConventionResolver()],
  }
}

function MyConventionResolver(source, target) {
  this.source = source || 'resolve'
  this.target = target || 'resolve'
}

MyConventionResolver.prototype.apply = function(resolver) {
  const target = resolver.ensureHook(this.target)
  resolver.getHook(this.source).tapAsync('MyConventionResolver', function(request, resolveContext, callback) {
    if (request.request[0] === '#') {
      const req = request.request.substr(1)
      const obj = Object.assign({}, request, {
        request: req + '/' + path.basename(req) + '.js',
      })
      return resolver.doResolve(target, obj, null, resolveContext, callback)
    }
    callback()
  })
}
