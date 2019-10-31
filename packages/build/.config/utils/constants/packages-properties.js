const path = require('path')
const execSync = require('child_process').execSync

// it must be sync because jest.config.js need it and it only accept sync configuraiton object.
const output = execSync('yarn lerna ls --parseable')
  .toString()
  .split('\n')
const packagesAbsPaths = output.filter(maybePath => maybePath.startsWith('/'))

const packagesProperties = packagesAbsPaths.map(packagePath => ({
  name: path.basename(packagePath),
  path: packagePath,
}))

module.exports = packagesProperties
