const Path = require('path');
const Webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    app: Path.resolve(__dirname, '../visual-tool/scripts/index.js')
  },
  output: {
    path: Path.join(__dirname, '../build'),
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].chunk.js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: false
    }
  },
  resolve: {
    alias: {
      '~': Path.resolve(__dirname, '../visual-tool')
    }
  },
  plugins: [
    new Webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: Path.resolve(__dirname, '../public'), to: 'public' }
      ]
    }),
    new HtmlWebpackPlugin({
      template: Path.resolve(__dirname, '../visual-tool/index.html')
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: Path.resolve(__dirname, '../visual-tool'),
        loader: 'babel-loader'
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(txt|abc)$/i,
        use: 'raw-loader'
      }
    ]
  }
};
