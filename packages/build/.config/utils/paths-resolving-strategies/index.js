const path = require('path')
const { paths, constants } = require('..')

const { srcPath, packagesPath } = paths

const { packagesProperties, mainProjectDirName, packageDirectoryName } = constants

const jestResolver = packagesProperties
  .map(packageProperties => ({
    [`@${packageProperties.packageDirectoryName}/(.+)`]: path.resolve(
      packagesPath,
      packageProperties.packageDirectoryName,
      'src',
      `$1`,
    ),
    ...(packageProperties.packageDirectoryName !== packageDirectoryName && {
      [`@${mainProjectDirName}/${packageProperties.packageDirectoryName}`]: path.resolve(
        packagesPath,
        packageProperties.packageDirectoryName,
        'src',
        packageProperties.isWebApp ? 'index.tsx' : 'index.ts',
      ),
    }),
    [`@${packageProperties.packageDirectoryName}-test/(.+)`]: path.resolve(
      packagesPath,
      packageProperties.packageDirectoryName,
      'test',
      `$1`,
    ),
  }))
  .reduce((acc, alias) => ({ ...acc, ...alias }), {})

const webpackOtherAlias = packagesProperties
  .map(packageProperties => ({
    [`@${packageProperties.packageDirectoryName}-test`]: path.resolve(
      packagesPath,
      packageProperties.packageDirectoryName,
      'test',
    ),
  }))
  .reduce((acc, alias) => ({ ...acc, ...alias }), {})

const webpackProdAlias = packagesProperties
  .map(packageProperties => ({
    [`@${packageProperties.packageDirectoryName}`]: path.resolve(
      packagesPath,
      packageProperties.packageDirectoryName,
      'src',
    ),
  }))
  .reduce((acc, alias) => ({ ...acc, ...alias }), {})

const webpackDevelopmentAlias = packagesProperties
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
    ...webpackProdAlias,
  })

const babelProdAlias = packagesProperties
  .map(packageProperties => {
    const packageSrcFolderPath = path.resolve(packagesPath, packageProperties.packageDirectoryName, 'src')
    return {
      [`^@${packageProperties.packageDirectoryName}/(.+)`]:
        srcPath === packageSrcFolderPath ? `./\\1` : path.resolve(packageSrcFolderPath, '\\1'),
      [`^@${packageProperties.packageDirectoryName}-test/(.+)`]:
        srcPath === packageSrcFolderPath
          ? `./\\1`
          : path.resolve(packagesPath, packageProperties.packageDirectoryName, 'test', '\\1'),
    }
  })
  .reduce((acc, alias) => ({ ...acc, ...alias }), {})

const babelDevelopmentAlias = packagesProperties
  .filter(packageProperties => packageProperties.packageDirectoryName !== packageDirectoryName)
  .map(packageProperties => ({
    [`^@${mainProjectDirName}/${packageProperties.packageDirectoryName}`]: path.resolve(
      packagesPath,
      packageProperties.packageDirectoryName,
      'src',
      packageProperties.isWebApp ? 'index.tsx' : 'index.ts',
    ),
  }))
  .reduce((acc, alias) => ({ ...acc, ...alias }), babelProdAlias)

module.exports = {
  babelDevelopmentAlias,
  babelProdAlias,
  webpackDevelopmentAlias,
  webpackProdAlias,
  webpackOtherAlias,
  jestResolver,
}
