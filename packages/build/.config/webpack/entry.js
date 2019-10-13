const {
  paths: { appEntryFilePath, webappReactHmrEntryFile },
  constants: { isWebApp },
} = require('../utils')

module.exports = () => ({
  index: isWebApp ? webappReactHmrEntryFile : appEntryFilePath,
})
