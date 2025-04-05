const path = require('path');

module.exports = {
  entry: {
    main: './src/main/main.ts',
    preload: './src/preload/preload.ts',
  },
  target: 'electron-main',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: (pathData) => {
      return pathData.chunk.name === 'preload' ? 'preload/preload.js' : 'main/[name].js';
    },
    path: path.resolve(__dirname, 'dist'),
  },
  node: {
    __dirname: false,
    __filename: false,
  },
}; 