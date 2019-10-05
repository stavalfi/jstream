const fetch = require('node-fetch')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { ModuleFilenameHelpers } = require('webpack')
const ExternalModule = require('webpack/lib/ExternalModule')

const getCdnUrl = (libraryName, libraryVersion) =>
  fetch(`https://api.cdnjs.com/libraries/${libraryName}`)
    .then(response => response.json())
    .then(libData => libData.filename)
    .then(filename => `https://cdnjs.cloudflare.com/ajax/libs/${libraryName}/${libraryVersion}/${filename}`)

const generateCdnScripsObjects = libDataArray => {
  Promise.all(libDataArray.map(libData => getCdnUrl(libData.name, libData.version)))
    .catch(cb)
    .then(urls =>
      urls.map(url => ({
        attributes: {
          type: 'text/javascript',
          src: url,
        },
        tagName: 'script',
        voidTag: false,
      })),
    )
}

const moduleRegex = /^((?:@[a-z0-9][\w-.]+\/)?[a-z0-9][\w-.]*)/

class WebpackCdnPlugin {
  constructor(options = {}) {
    this.libInfoArray = options.libInfoArray || []
  }

  apply(compiler) {
    compiler.plugin('normal-module-factory', nmf => {
      nmf.plugin('factory', factory => (data, callback) => {
        const modulePath = data.dependencies[0].request
        const contextPath = data.context

        const isModulePath = moduleRegex.test(modulePath)
        if (!isModulePath) {
          return factory(data, callback)
        }

        const libInfo = this.libInfoArray.find(({ libName }) => libName === modulePath)
        if (!libInfo) {
          factory(data, callback)
        } else {
          callback(null, new ExternalModule(libInfo.globalVarName, 'var', modulePath))
        }
      })
    })
    compiler.hooks.compilation.tap('MyPlugin', compilation => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync(
        'MyPlugin', // <-- Set a meaningful name here for stacktraces
        (data, cb) => {
          generateCdnScripsObjects([{ name: 'react', version: '16.9.0' }, { name: 'react-dom', version: '16.9.0' }])
            .then(cdnScripsObjects => ({
              ...data,
              assetTags: {
                ...data.assetTags,
                scripts: [...cdnScripsObjects, ...data.assetTags.scripts],
              },
            }))
            .then(newData => cb(null, newData))
        },
      )
    })
  }

  /**
   * Returns the list of all modules in the bundle
   */
  static _getUsedModules(compilation) {
    const usedModules = {}

    compilation
      .getStats()
      .toJson()
      .chunks.forEach(c => {
        c.modules.forEach(m => {
          m.reasons.forEach(r => {
            if (!r.userRequest.startsWith('.')) usedModules[r.userRequest] = true
          })
        })
      })

    return usedModules
  }
}

module.exports = WebpackCdnPlugin
