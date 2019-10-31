const {
  pathsResolvingStrategies: { jestAliases },
} = require('../utils')
const { paths, constants } = require('../utils')

const {
  mainTestsFolderPath,
  testPolyfillsFilePath,
  srcPath,
  mainTsconfigPath,
  babelRcPath,
  isExperimentalReactMode,
} = paths

const { notIdeMode } = constants

module.exports = {
  expand: true,
  projects: [
    // webstorm doesn't support running multiple projects when clicking on jest buttons in the IDE.
    ...(notIdeMode
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
      moduleNameMapper: {
        ...(isExperimentalReactMode && {
          react: 'react-experimental',
          'react-dom': 'react-dom-experimental',
        }),
        ...jestAliases,
      },
      testRegex: [`./*.spec.js$`, `./*.spec.ts$`],
      roots: [mainTestsFolderPath, srcPath],
      testPathIgnorePatterns: ['node_modules'],
      setupFiles: [testPolyfillsFilePath],
      globals: {
        __DEV__: true,
        __DEV_SERVER__: false,
        __HMR__: false,
        __REACT_EXPERIMENTAL__: isExperimentalReactMode,
        'ts-jest': {
          tsConfig: mainTsconfigPath,
          babelConfig: require(babelRcPath),
        },
        window: {},
      },
    },
  ],
}
