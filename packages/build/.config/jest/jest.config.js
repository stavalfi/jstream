const { paths, constants } = require('../utils')

const {
  resolveModulesPathsArray,
  mainTestsFolderPath,
  testPolyfillsFilePath,
  srcPath,
  linterTsconfigPath,
  babelRcPath,
} = paths

const { isCI } = constants

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
