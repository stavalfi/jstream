module.exports = ({ isDevelopmentMode, isTestMode, isCI, isManualRun, keepConsole }) => {
  const productionPresets = [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ]
  const productionPlugins = [
    ,
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
  ]
  return {
    presets: [
      ...(isDevelopmentMode && !isTestMode ? [] : productionPresets),
      [
        '@babel/preset-react',
        {
          modules: false,
        },
      ],
      '@babel/typescript',
    ],
    plugins: [
      removeConsolePlguin({ isDevelopmentMode, isTestMode, isCI, isManualRun, keepConsole }),
      ...(isDevelopmentMode && !isTestMode ? [] : productionPlugins),
      '@babel/proposal-class-properties',
    ].filter(Boolean),
  }
}

function removeConsolePlguin({ isDevelopmentMode, isTestMode, isCI, isManualRun, keepConsole }) {
  if (keepConsole) {
    return false
  }

  if (isCI || isManualRun) {
    return ['transform-remove-console', { exclude: ['error', 'warn'] }]
  }

  return false
}
