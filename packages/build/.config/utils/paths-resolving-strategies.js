const path = require('path')

const { paths, constants } = require('./index')

const { packagesPath, getEntryFilePath } = paths

const { packagesProperties, mainProjectDirName, packageDirectoryName } = constants

const buildAliasesToPackage = ({ fromRegex = '', toRegex = '', isToArray }) =>
  packagesProperties
    .map(packageProperties => ({
      ...(packageProperties.packageDirectoryName === packageDirectoryName && {
        [`@${packageProperties.packageDirectoryName}-test${fromRegex ? `/${fromRegex}` : ''}`]: path.resolve(
          packagesPath,
          packageProperties.packageDirectoryName,
          'test',
          toRegex,
        ),
      }),
      [`@${packageProperties.packageDirectoryName}${fromRegex ? `/${fromRegex}` : ''}`]: path.resolve(
        packagesPath,
        packageProperties.packageDirectoryName,
        'src',
        toRegex,
      ),
      ...(packageProperties.packageDirectoryName !== packageDirectoryName && {
        [`@${mainProjectDirName}/${packageProperties.packageDirectoryName}`]: getEntryFilePath(
          path.resolve(packagesPath, packageProperties.packageDirectoryName, 'src'),
        ),
      }),
    }))
    .map(aliases =>
      Object.entries(aliases)
        .map(([key, value]) => ({
          [key]: isToArray ? [value] : value,
        }))
        .reduce((acc, aliases) => ({ ...acc, ...aliases }), {}),
    )
    .reduce((acc, aliases) => ({ ...acc, ...aliases }), {})

const jestAliases = buildAliasesToPackage({ fromRegex: '(.+)', toRegex: '$1' })

const webpackAliases = buildAliasesToPackage({ fromRegex: '', toRegex: '' })

const babelAliases = buildAliasesToPackage({ fromRegex: '(.+)', toRegex: '\\1' })

const ForkTsPluginAliases = {
  baseUrl: packagesPath,
  paths: buildAliasesToPackage({ fromRegex: '*', toRegex: '*', isToArray: true }),
}

module.exports = {
  babelAliases,
  webpackAliases,
  jestAliases,
  ForkTsPluginAliases,
}
