const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const jsonImporter = require('node-sass-json-importer')

module.exports = ({
  isDevelopmentMode,
  isTestMode,
  constants: { isWebApp },
  publicPath = '.',
  paths: { srcPath, eslintRcPath, libTsconfigFilePath, babelRcPath, packageJsonFolderPath },
}) => ({
  rules: [
    {
      test: /\.(ts|js)x?$/,
      exclude: /(node_module|dist|my-symphony.font.js)/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            ...require(babelRcPath),
          },
        },
        ...(isWebApp || isTestMode
          ? []
          : [
              {
                loader: 'ts-loader',
                options: {
                  context: packageJsonFolderPath,
                  configFile: libTsconfigFilePath,
                  experimentalFileCaching: true,
                },
              },
              {
                loader: '@stavalfi/babel-plugin-module-resolver-loader',
                options: {
                  root: [srcPath],
                  extensions: ['.js', '.jsx', '.d.ts', '.ts', '.tsx'],
                },
              },
            ]),
        {
          loader: 'eslint-loader',
          options: {
            failOnError: true,
            failOnWarning: isDevelopmentMode || isTestMode,
            configFile: eslintRcPath,
            fix: false,
            // eslint import will remmember sometimes failures from last run and won't re-check imports.
            cache: false,
            formatter: require('eslint-formatter-friendly'),
          },
        },
      ],
    },
    {
      test: /\.css$/,
      loaders: [isDevelopmentMode ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader'],
    },
    {
      test: /\.(jpe?g|png|gif)$/i,
      loaders: [
        {
          loader: 'file-loader',
          options: {
            query: {
              name: 'assets/[hash].[name].[ext]',
            },
          },
        },
        {
          loader: 'image-webpack-loader',
          options: {
            query: {
              mozjpeg: {
                progressive: true,
              },
              gifsicle: {
                interlaced: true,
              },
              optipng: {
                optimizationLevel: 7,
              },
            },
          },
        },
      ],
    },
    {
      test: /\.font\.js$/,
      loaders: [
        'style-loader',
        'css-loader',
        {
          loader: 'webfonts-loader',
          options: {
            types: 'ttf',
            publicPath,
            baseSelector: '.sf',
          },
        },
      ],
    },
    {
      test: /\.svg(\?.*)?$/,
      loaders: ['url-loader?limit=10000&mimetype=image/svg+xml'],
    },
    {
      test: /\.ttf(\?.*)?$/,
      loader: 'url-loader?limit=10000&mimetype=application/octet-stream',
    },
    {
      test: /\.(woff|woff2)(\?.*)?$/,
      loader: 'url-loader?limit=10000&mimetype=application/font-woff',
    },
    {
      test: /\.eot(\?.*)?$/,
      loader: 'url-loader?limit=10000&mimetype=application/vnd.ms-fontobject',
    },
    {
      test: /\.(scss|sass)$/,
      exclude: /(node_modules)/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'sass-loader',
          options: {
            indentedSyntax: true,
            importer: jsonImporter,
          },
        },
      ],
    },
  ],
})
