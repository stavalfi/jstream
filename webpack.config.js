const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const isDevelopmentMode = process.env.NODE_ENV === 'development';

module.exports = {
  devtool: 'source-map',
  mode: isDevelopmentMode ? 'development' : 'production',
  entry: [
    '@babel/polyfill',
    path.join(__dirname, 'examples', 'example1', 'src', 'index.js'),
    path.join(__dirname, 'node_modules', 'core-js', 'fn', 'array', 'flat-map'),
  ],
  output: {
    filename: isDevelopmentMode ? '[hash].bundle.js' : '[contenthash].bundle.js',
    path: path.join(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: true,
          },
        },
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader',
      },
      {
        test: /\.(jpg|jpeg)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 500000,
          },
        },
      },
      {
        test: /\.(png)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[path][name].[hash].[ext]',
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'workflow.js',
      template: path.join(__dirname, 'output-index-tamplate.html'),
    }),
    new CleanWebpackPlugin(),
  ],
  devServer: {
    host: 'localhost',
    port: '8080',
    progress: true,
  },
};
