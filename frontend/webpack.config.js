const path = require('path');

module.exports = {
  // Entry point of your application
  entry: './src/index.js',

  // Output configuration
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  // Other webpack configurations...
};
