const path = require('path')
const { webpackAliases } = require('../utils/paths-resolving-strategies')
const MonoResolverPlugin = require('./mono-resolver-plugin')

module.exports = ({
  constants: { isDevServer, isWebApp, packagesProperties, mainProjectDirName },
  paths: { appEntryFilePath, packagesPath },
}) => ({
  extensions: ['.js', '.sass', '.json', '.ts', '.tsx'],
  alias: {
    ...webpackAliases,
    ...(isDevServer && {
      'react-dom': '@hot-loader/react-dom',
    }),
    ...(isWebApp && {
      'webapp-main-component-path': appEntryFilePath,
    }),
  },
  plugins: [
    new MonoResolverPlugin({
      packagesProps: packagesProperties.map(packageProps => ({
        name: packageProps.packageDirectoryName,
        path: path.resolve(packagesPath, packageProps.packageDirectoryName),
      })),
      ignoreModules: packagesProperties.map(
        packageProps => `@${mainProjectDirName}/${packageProps.packageDirectoryName}`,
      ),
      ignoreAliases: Object.keys(webpackAliases).map(alias => `${alias}/?.*`),
    }),
  ],
})
