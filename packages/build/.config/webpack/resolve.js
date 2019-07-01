const path = require('path')

module.exports = ({
  isDevelopmentMode,
  paths: { resolveModulesPathsArray, packagesPath },
  constants: { packagesProperties, mainProjectDirName, packageDirectoryName, isWebApp },
}) => ({
  extensions: ['.js', '.sass', '.json', '.ts', '.tsx'],
  modules: resolveModulesPathsArray,
  alias: isDevelopmentMode
    ? developmentAlias({ isWebApp, packagesPath, mainProjectDirName, packagesProperties, packageDirectoryName })
    : prodAlias({ isWebApp, mainProjectDirName, packagesPath, packagesProperties, packageDirectoryName }),
})

const developmentAlias = ({ mainProjectDirName, packagesPath, packagesProperties }) =>
  packagesProperties
    .map(packageProperties => ({
      [`@${mainProjectDirName}/${packageProperties.packageDirectoryName}`]: path.resolve(
        packagesPath,
        packageProperties.packageDirectoryName,
        'src',
        packageProperties.isWebApp ? 'index.tsx' : 'index.ts',
      ),
    }))
    .reduce((acc, alias) => ({ ...acc, ...alias }), prodAlias({ packagesPath, packagesProperties }))

const prodAlias = ({ packagesPath, packagesProperties }) =>
  packagesProperties
    .map(packageProperties => ({
      [`@${packageProperties.packageDirectoryName}`]: path.resolve(
        packagesPath,
        packageProperties.packageDirectoryName,
        'src',
      ),
    }))
    .reduce((acc, alias) => ({ ...acc, ...alias }), {})
