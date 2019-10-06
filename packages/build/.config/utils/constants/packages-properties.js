const path = require('path')
const execSync = require('child_process').execSync

// it must be sync because jest.config.js need it and it only accept sync configuraiton object.
const output = execSync('yarn lerna ls --parseable')
  .toString()
  .split('\n')
const packagesAbsPaths = output.slice(2, output.length - 2)

const packagesProps = packagesAbsPaths
  .map(packagePath => ({
    name: path.basename(packagePath),
    path: packagePath,
  }))
  // need to remove this packages because it will cause bugs in other files.
  .filter(packageProps => !['build', 'docs', 'website'].includes(packageProps.name))

module.exports = packagesProps
