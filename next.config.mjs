/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    turbopack: {
      resolveAlias: {
        fs: 'empty-module',
        net: 'empty-module',
        tls: 'empty-module',
        dns: 'empty-module',
        'util/types': 'empty-module',
      },
    },
  },
}

export default nextConfig