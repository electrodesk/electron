import path from "path";
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import baseConfig from './webpack.default.config';
import webpackPaths from './webpack.paths';

const configuration: webpack.Configuration = {

  target: 'electron-main',

  mode: 'production', // set to development

  entry: {
    app: path.join(webpackPaths.srcPath, 'App.ts'),
    preload: path.join(webpackPaths.srcPath, 'preload.ts'),
  },

  output: {
    path: webpackPaths.releasePath,
    filename: '[name].js',
    library: {
      type: 'umd',
    },
    devtoolModuleFilenameTemplate: '[absolute-resource-path]'
  },
};

export default merge(baseConfig, configuration);