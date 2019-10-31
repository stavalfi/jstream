const path = require('path')

const paths = require('./paths')
const constants = require('./constants')

const { packagesPath, getEntryFilePath } = paths

const { packagesProperties, mainProjectDirName, packageDirectoryName } = constants

const buildAliasesToPackage = ({ fromRegex = '', toRegex = '', isToArray, configToIde }) =>
  packagesProperties
    .filter(packageProps => !['build', 'docs', 'website'].includes(packageProps.name))
    .map(packageProperties => ({
      ...((configToIde || packageProperties.name === packageDirectoryName) && {
        [`@${packageProperties.name}-test${fromRegex ? `/${fromRegex}` : ''}`]: path.resolve(
          packageProperties.path,
          'test',
          toRegex,
        ),
      }),
      [`@${packageProperties.name}${fromRegex ? `/${fromRegex}` : ''}`]: path.resolve(
        packageProperties.path,
        'src',
        toRegex,
      ),
      ...((configToIde || packageProperties.name !== packageDirectoryName) && {
        [`@${mainProjectDirName}/${packageProperties.name}`]: getEntryFilePath(
          path.resolve(packageProperties.path, 'src'),
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

const webpackAliasesIde = buildAliasesToPackage({ fromRegex: '', toRegex: '', configToIde: true })

const babelAliases = buildAliasesToPackage({ fromRegex: '(.+)', toRegex: '\\1' })

const ForkTsPluginAliases = {
  baseUrl: packagesPath,
  paths: buildAliasesToPackage({ fromRegex: '*', toRegex: '*', isToArray: true }),
}

module.exports = {
  babelAliases,
  webpackAliases,
  webpackAliasesIde,
  jestAliases,
  ForkTsPluginAliases,
}
