import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'

export function getAnalyzerPlugins() {
  return process.env.ANALYZE === 'true' ? [new BundleAnalyzerPlugin({
    analyzerMode: 'server',
    analyzerPort: 8888,
  })] : []
}
