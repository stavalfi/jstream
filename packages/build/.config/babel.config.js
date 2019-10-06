const { constants } = require('./utils')

const { isCI, isManualRun, isWebApp, isTestMode } = constants

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    [
      '@babel/preset-react',
      {
        modules: false,
      },
    ],
    '@babel/typescript',
  ].filter(Boolean),
  plugins: [
    isWebApp && 'react-hot-loader/babel',
    removeConsolePlugin(),
    '@babel/proposal-class-properties',
    '@babel/proposal-object-rest-spread',
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
    '@babel/plugin-proposal-do-expressions',
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-function-bind',
    '@babel/plugin-proposal-function-sent',
    '@babel/plugin-proposal-json-strings',
    '@babel/plugin-proposal-logical-assignment-operators',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-optional-chaining',
    [
      '@babel/plugin-proposal-pipeline-operator',
      {
        proposal: 'minimal',
      },
    ],
    '@babel/plugin-proposal-throw-expressions',
    '@babel/plugin-syntax-dynamic-import',
  ].filter(Boolean),
}

function removeConsolePlugin() {
  const noConsolePlugin = ['transform-remove-console', { exclude: ['error', 'warn'] }]

  if (isTestMode && isManualRun && !isCI) {
    return noConsolePlugin
  }

  return false
}
