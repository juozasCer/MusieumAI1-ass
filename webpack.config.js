const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production', // Set to production for optimizations
  entry: './src/index.ts', // Main entry point
  devtool: false, // Disable source maps in production
  module: {
    rules: [
      {
        test: /\.tsx?$/, // Match TypeScript files
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|glb|gltf)$/, // Match images and 3D models
        type: 'asset/resource', // Copy to dist folder
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/, // Match font files
        type: 'asset/resource', // Copy to dist folder
      },
      {
        test: /\.(mp3|mp4|wav|ogg)$/, // Match media files (audio/video)
        type: 'asset/resource', // Copy to dist folder
      },
      {
        test: /\.css$/, // Match CSS files
        use: ['style-loader', 'css-loader'], // Inject styles into DOM
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'], // Resolve these extensions
  },
  output: {
    filename: '[name].[contenthash].js', // Cache-busting filenames
    path: path.resolve(__dirname, 'dist'), // Output to dist folder
    clean: true, // Clean the output directory before building
  },
  plugins: [
    new CleanWebpackPlugin(), // Clean dist folder
    new HtmlWebpackPlugin({
      template: './src/index.html', // Use src/index.html as a template
      inject: 'body', // Inject scripts at the bottom of the body tag
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/fonts', to: 'fonts' }, // Copy fonts folder
        { from: 'src/images', to: 'images' }, // Copy images folder
        { from: 'src/media', to: 'media' }, // Copy media folder
        { from: 'src/models', to: 'models' }, // Copy models folder
        { from: 'src/textures', to: 'textures' },
        { from: 'src/styles.css', to: 'styles.css' }, // Copy textures folder
      ],
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all', // Split vendor and app code
    },
    minimize: true, // Minify the code
  },
};
