const path = require('path')

module.exports = ({
  isDevelopmentMode,
  paths: { resolveModulesPathsArray, packagesPath },
  constants: { packagesProperties, mainProjectDirName, packageDirectoryName, isWebApp },
}) => {
  const baseAlias = isDevelopmentMode
    ? developmentAlias({ isWebApp, packagesPath, mainProjectDirName, packagesProperties, packageDirectoryName })
    : prodAlias({ isWebApp, mainProjectDirName, packagesPath, packagesProperties, packageDirectoryName })
  const otherAlias = packagesProperties
    .map(packageProperties => ({
      [`@${packageProperties.packageDirectoryName}-test`]: path.resolve(
        packagesPath,
        packageProperties.packageDirectoryName,
        'test',
      ),
    }))
    .reduce((acc, alias) => ({ ...acc, ...alias }), {})
  return {
    extensions: ['.js', '.sass', '.json', '.ts', '.tsx'],
    modules: resolveModulesPathsArray,
    alias: {
      ...baseAlias,
      ...otherAlias,
    },
  }
}

const developmentAlias = ({ mainProjectDirName, packagesPath, packagesProperties, packageDirectoryName }) =>
  packagesProperties
    .filter(packageProperties => packageProperties.packageDirectoryName !== packageDirectoryName)
    .map(packageProperties => ({
      [`@${mainProjectDirName}/${packageProperties.packageDirectoryName}`]: path.resolve(
        packagesPath,
        packageProperties.packageDirectoryName,
        'src',
        packageProperties.isWebApp ? 'index.tsx' : 'index.ts',
      ),
    }))
    .reduce((acc, alias) => ({ ...acc, ...alias }), {
      'react-dom': '@hot-loader/react-dom',
      ...prodAlias({ packagesPath, packagesProperties }),
    })

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
