var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var BUILD_DIR = path.resolve(__dirname, 'dist/options');
var APP_DIR = path.resolve(__dirname, 'options.dev');

var config = {
  entry: {
    options: APP_DIR + '/app.jsx',
    vendor: ['react', 'react-dom', 'react-tag-autocomplete', 'react-toggle-button'],
  },
  output: {
    path: BUILD_DIR,
    filename: '[name].js'
  },
  module: {
    loaders: [{
      test: /\.jsx$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015', 'react']
      }
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new HtmlWebpackPlugin({ template: path.join(APP_DIR, 'index.html') }),
    new ExtractTextPlugin('[name].css'),
    new webpack.optimize.CommonsChunkPlugin({ name: 'vendor', filename: 'vendor.bundle.js' }),
    new CopyWebpackPlugin([
      { from: 'manifest.json', to: '..' },
      { from: 'inject.js', to: '..' },
      { from: 'utils.js', to: '..' },
      { from: 'contentscript.js', to: '..' },
      { from: 'background.js', to: '..' },
    ]),
  ],
};

module.exports = config;
