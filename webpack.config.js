const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJS = require("uglify-es");

const BUILD_DIR = path.resolve(__dirname, 'dist/options');
const APP_DIR = path.resolve(__dirname, 'options.dev');

function minifyFilesBeforeCopy(content, $path) {
  const result = UglifyJS.minify(content.toString());
  if (result.error) {
    console.error($path, result.error);
    return content;
  }
  return result.code;
}

const config = {
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
      { from: 'inject.js', to: '..', transform: minifyFilesBeforeCopy },
      { from: 'utils.js', to: '..', transform: minifyFilesBeforeCopy },
      { from: 'contentscript.js', to: '..', transform: minifyFilesBeforeCopy },
      { from: 'background.js', to: '..', transform: minifyFilesBeforeCopy },
    ]),
  ],
};

module.exports = config;
