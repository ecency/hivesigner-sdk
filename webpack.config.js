const path = require('path');
const pkg = require('./package.json');
const libraryName = pkg.name;

module.exports = {
  entry: path.resolve(__dirname, './src/index.ts'),
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: `${libraryName}.min.js`,
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: 'babel-loader',
      },
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  mode: 'production'
}
