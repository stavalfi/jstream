const { jestResolver } = require('../utils/paths-resolving-strategies')
const { paths, constants } = require('../utils')

const {
  resolveModulesPathsArray,
  mainTestsFolderPath,
  testPolyfillsFilePath,
  srcPath,
  linterTsconfigPath,
  babelRcPath,
} = paths

const { isManualRun, isCI } = constants

module.exports = {
  expand: true,
  projects: [
    // webstorm doesn't support running multiple projects when clicking on jest buttons in the IDE.
    ...(isManualRun
      ? [
          {
            displayName: 'lint',
            runner: 'jest-runner-eslint',
            testRegex: [`./*.spec.js$`, `./*.spec.ts$`],
            roots: [mainTestsFolderPath, srcPath],
          },
        ]
      : []),
    {
      displayName: 'test',
      preset: 'ts-jest/presets/js-with-ts',
      testEnvironment: 'node',
      modulePaths: resolveModulesPathsArray,
      moduleNameMapper: jestResolver,
      testRegex: [`./*.spec.js$`, `./*.spec.ts$`],
      roots: [mainTestsFolderPath, srcPath],
      testPathIgnorePatterns: ['node_modules'],
      setupFiles: [testPolyfillsFilePath],
      globals: {
        __DEV__: true,
        'ts-jest': {
          tsConfig: linterTsconfigPath,
          babelConfig: require(babelRcPath)({ isDevelopmentMode: true, isTestMode: true, isCI, isManualRun }),
        },
        window: {},
      },
    },
  ],
}
