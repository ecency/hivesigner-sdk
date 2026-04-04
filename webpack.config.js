const path = require('path');
const pkg = require('./package.json');
const libraryName = pkg.name;

module.exports = {
  entry: [
    path.resolve(__dirname, './src/index.ts')
  ],
  output: {
    path: path.resolve(__dirname, './lib'),
    filename: `${libraryName}.min.js`,
    library: libraryName,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            declaration: false,
            sourceMap: false,
          }
        },
      },
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  mode: 'production'
}
