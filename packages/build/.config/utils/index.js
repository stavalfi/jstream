const paths = require('./paths')
const constants = require('./constants')
const pathsResolvingStrategies = require('./paths-resolving-strategies')
module.exports = {
  paths,
  constants,
  pathsResolvingStrategies,
}

printedUtilsLog = false
if (!printedUtilsLog && constants.isBuildInfoMode) {
  printedUtilsLog = true
  console.log('constants: ', constants)
  console.log('paths: ', paths)
  console.log('pathsResolvingStrategies: ', pathsResolvingStrategies)
}
