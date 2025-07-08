/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 启用静态导出，符合 EdgeOne Pages 要求
  images: {
    unoptimized: true // 静态导出时需要禁用图片优化
  },
  trailingSlash: true, // 添加尾部斜杠，提高兼容性
  basePath: '', // 基础路径，部署时可根据需要调整
  assetPrefix: '', // 资源前缀，部署时可根据需要调整
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
  },
  env: {
    CUSTOM_KEY: 'my-value',
  },
}

module.exports = nextConfig