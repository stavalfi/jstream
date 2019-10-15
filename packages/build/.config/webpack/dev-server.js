const {
  constants: { devServerHost, devServerPort, isBuildInfoMode },
} = require('../utils')

module.exports = () => ({
  host: devServerHost,
  port: devServerPort,
  quiet: !isBuildInfoMode,
})
