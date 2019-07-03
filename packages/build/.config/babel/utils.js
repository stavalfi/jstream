export const developmentAlias = ({ mainProjectDirName, packagesPath, packagesProperties, mainTestsFolderPath }) =>
  packagesProperties
    .map(packageProperties => ({
      [`^@${mainProjectDirName}/${packageProperties.packageDirectoryName}`]: path.resolve(
        packagesPath,
        packageProperties.packageDirectoryName,
        'src',
        packageProperties.isWebApp ? 'index.tsx' : 'index.ts',
      ),
    }))
    .reduce((acc, alias) => {
      return { ...acc, ...alias }
    }, prodAlias({ packagesProperties }))

export const prodAlias = ({ packagesProperties, mainTestsFolderPath }) =>
  packagesProperties
    .map(packageProperties => ({
      [`^@${packageProperties.packageDirectoryName}/(.+)`]: `./\\1`,
      [`@test/(.+)`]: path.resolve(mainTestsFolderPath, `\\1`),
    }))
    .reduce((acc, alias) => {
      return { ...acc, ...alias }
    }, {})
