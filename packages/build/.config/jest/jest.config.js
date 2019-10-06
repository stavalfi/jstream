const { jestAliases } = require('../utils/paths-resolving-strategies')
const { paths, constants } = require('../utils')

const { mainTestsFolderPath, testPolyfillsFilePath, srcPath, linterTsconfigPath, babelRcPath } = paths

const { isManualRun } = constants

module.exports = {
  expand: true,
  projects: [
    // webstorm doesn't support running multiple projects when clicking on jest buttons in the IDE.
    ...(isManualRun
      ? [
          {
            displayName: 'lint',
            // jest-runner-eslint.config.js must be at the same level of this file.
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
      moduleNameMapper: jestAliases,
      testRegex: [`./*.spec.js$`, `./*.spec.ts$`],
      roots: [mainTestsFolderPath, srcPath],
      testPathIgnorePatterns: ['node_modules'],
      setupFiles: [testPolyfillsFilePath],
      globals: {
        __DEV__: true,
        'ts-jest': {
          tsConfig: linterTsconfigPath,
          babelConfig: require(babelRcPath),
        },
        window: {},
      },
    },
  ],
}
