/**
 * Webpack config for development electron main process
 */

import path from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import checkNodeEnv from '../scripts/check-node-env';
import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';
import { devMainCopyPlugins } from './copy-plugin'
import { GenerateApiPropsPlugin } from './webpack.custom-plugins'
import { getAnalyzerPlugins } from './getAnalyzerPlugins'
import WatchExternalFilesPlugin from './webpack-watch-files-plugin'

function getWatchingPlugins() {
  const IS_WATCH_MODE = process.argv?.includes('--watch');
  return IS_WATCH_MODE ? [
    // @ts-ignore
    new WatchExternalFilesPlugin({
      verbose: false,
      files: [
        './inputs/**/*.js',
      ], 
    }) as any,
  ] : []
}
// When an ESLint server is running, we can't set the NODE_ENV so we'll check if it's
// at the dev webpack config is not accidentally run in a production environment
if (process.env.NODE_ENV === 'production') {
  checkNodeEnv('development');
}
const generateApiProps = process.env.GENERATE_APP_PROPS === 'true';
const configuration: webpack.Configuration = {
  devtool: 'inline-source-map',

  mode: 'development',

  target: 'electron-main',

  entry: {
    main: path.join(webpackPaths.srcMainPath, 'main.ts'),
    preload: path.join(webpackPaths.srcMainPath, 'preload.ts'),
  },

  output: {
    path: webpackPaths.dllPath,
    filename: '[name].bundle.dev.js',
    library: {
      type: 'umd',
    },
  },

  plugins: [
    ...devMainCopyPlugins,
    ...(generateApiProps ? [new GenerateApiPropsPlugin()] : []),
    ...getWatchingPlugins(),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ...getAnalyzerPlugins(),

    new webpack.DefinePlugin({
      'process.type': '"browser"',
    }),
  ],

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false,
  },
};

export default merge(baseConfig, configuration);
