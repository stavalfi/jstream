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
    '@babel/proposal-object-rest-spread',
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
    isTestMode && 'babel-plugin-rewire',
    '@babel/proposal-class-properties',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    isTestMode && 'dynamic-import-node',
    removeConsolePlugin(),
  ].filter(Boolean),
}

function removeConsolePlugin() {
  const noConsolePlugin = ['transform-remove-console', { exclude: ['error', 'warn'] }]

  if (isTestMode && isManualRun && !isCI) {
    return noConsolePlugin
  }

  return false
}
