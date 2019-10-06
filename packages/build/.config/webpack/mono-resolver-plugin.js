module.exports = class MonoResolverPlugin {
  constructor(options = {}) {
    this.packagesProps = options.packagesProps || []
    this.ignoreModules = options.ignoreModules || []
    this.ignoreAliases = (options.ignoreAliases || []).map(regexAsString => new RegExp(regexAsString))
  }

  static isModule(moduleName) {
    return !moduleName.startsWith('.') && !moduleName.startsWith('/')
  }

  apply(resolver) {
    resolver.plugin('resolve', (request, callback) => {
      if (
        MonoResolverPlugin.isModule(request.request) &&
        !this.ignoreModules.includes(request.request) &&
        !this.ignoreAliases.some(regex => regex.test(request.request))
      ) {
        const requestPackage = this.packagesProps.find(packageProps => request.path.includes(packageProps.name))
        if (requestPackage) {
          const absModulePath = require.resolve(request.request, { paths: [requestPackage.path] })
          if (absModulePath) {
            const nextRequest = {
              ...request,
              request: absModulePath,
            }
            const log = `webpack will find the module: "${request.request}" in: ${nextRequest.request}`
            resolver.doResolve('resolve', nextRequest, log, callback)
            return
          }
        }
      }
      callback()
    })
  }
}
