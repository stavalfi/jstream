const {
  paths: { appEntryFilePath, webappReactHmrEntryFile },
  constants: { isWebApp, disableHmr },
} = require('../utils')

module.exports = () => ({
  index: isWebApp ? webappReactHmrEntryFile : appEntryFilePath,
})
