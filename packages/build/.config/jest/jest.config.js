const path = require('path')
const { paths, constants } = require('../utils')

const {
  resolveModulesPathsArray,
  mainTestsFolderPath,
  testPolyfillsFilePath,
  srcPath,
  linterTsconfigPath,
  babelRcPath,
  packagesPath,
} = paths

const { isCI, packagesProperties } = constants

const prodAlias = ({ packagesPath, packagesProperties, test }) =>
  packagesProperties
    .map(packageProperties => ({
      [`@${packageProperties.packageDirectoryName}/(.+)`]: path.resolve(
        packagesPath,
        packageProperties.packageDirectoryName,
        'src',
        `$1`,
      ),
      [`@${packageProperties.packageDirectoryName}-test/(.+)`]: path.resolve(
        packagesPath,
        packageProperties.packageDirectoryName,
        'test',
        `$1`,
      ),
    }))
    .reduce((acc, alias) => ({ ...acc, ...alias }), {})

module.exports = {
  ...(isCI && { maxConcurrency: 1 }),
  projects: [
    {
      displayName: 'lint',
      runner: 'jest-runner-eslint',
      testRegex: [`./*.spec.js$`, `./*.spec.ts$`],
      roots: [mainTestsFolderPath, srcPath],
    },
    {
      displayName: 'test',
      preset: 'ts-jest/presets/js-with-ts',
      testEnvironment: 'node',
      modulePaths: resolveModulesPathsArray,
      moduleNameMapper: prodAlias({ packagesPath, packagesProperties }),
      testRegex: [`./*.spec.js$`, `./*.spec.ts$`],
      roots: [mainTestsFolderPath, srcPath],
      testPathIgnorePatterns: ['node_modules'],
      setupFiles: [testPolyfillsFilePath],
      globals: {
        'ts-jest': {
          tsConfig: linterTsconfigPath,
          babelConfig: require(babelRcPath),
        },
      },
    },
  ],
}
