import fs from 'fs'
import path from 'path';
import webpackPaths from './webpack.paths';
import CopyWebpackPlugin from 'copy-webpack-plugin'

const rendererCopyPattern = [{ from: path.resolve(webpackPaths.rootPath,  'public'), to: webpackPaths.distRendererPath }]

export const rendererCopyPlugins = [
  new CopyWebpackPlugin({
    patterns:rendererCopyPattern,
  })
]

const mainCopyPattern = [
  { from: path.resolve(webpackPaths.rootPath,  'README.md'), to: webpackPaths.distMainPath },
  { from: path.resolve(webpackPaths.rootPath,  'inputs'), to: path.resolve(webpackPaths.distMainPath,  'inputs') },
]

export const devMainCopyPlugins = [
  new CopyWebpackPlugin({
    patterns: [...mainCopyPattern],
  })
]


const headerGeneratorFiles = path.resolve(webpackPaths.rootPath, 'node_modules', 'header-generator', 'data_files')
export const prodMainCopyPlugins = [
  new CopyWebpackPlugin({
    patterns: [...mainCopyPattern,
     ...( fs.existsSync(headerGeneratorFiles) ? [{ from: headerGeneratorFiles, to: path.resolve(webpackPaths.distMainPath,) }] : []),
    ],
  })
]


export const moduleRules = {
  rules: [
    {
      test: /\.svg$/,
      use: 'null-loader'
    },
    {
      test: /\.html$/,
      use: 'null-loader'
    },
    {
      test: /\.css$/,
      use: 'null-loader'
    },
    {
      test: /\.ttf$/,
      use: 'null-loader'
    },
    {
      test: /\.png$/,
      use: 'null-loader'
    },
  ],
}