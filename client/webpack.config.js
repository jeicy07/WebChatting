var path = require('path');
var node_modules_dir = path.resolve(__dirname, 'node_modules');
var webpack = require('webpack');
var ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
// var deps = [
//   'angular/angular.min.js'
// ];
var config = {
  entry: './app/app.jsx',
  devtool: 'source-map',
  output: {
    path: './dist',
    filename: 'base.bundle.js',
    publicPath: '/',
  },
  module: {
    noParse: [],
    loaders: [{
      test: /\.css$/,
      loader: "style-loader!css-loader"
    }, {
      test: /\.less$/,
      loader: 'style!css!autoprefixer!less'
    }, {
      test: /\.js|jsx$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
          presets: ['es2015', 'react']
        }
    }, {
      test: /\.jpg$/,
      loader: 'url-loader?limit=10000&name=images/[name].[ext]'
    }]
  },
  plugins: [
    new ngAnnotatePlugin({
      add: true
    })
  ],
  // postcss: function() {
  //   return [require('autoprefixer'), require('precss')];
  // },
  resolve: {
    alias: {},
    modulesDirectories: [
      'src',
      'node_modules'
    ],
    extensions: ['', '.json', '.js', 'jsx']
  }
}

// deps.forEach(function (dep) {
//   var depPath = path.resolve(node_modules_dir, dep);
//   config.resolve.alias[dep.split(path.sep)[0]] = depPath;
//   config.module.noParse.push(depPath);
// });

module.exports = config;
