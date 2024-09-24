/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
    // plugins: ['@antfu/eslint-config'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

// module.exports = nextConfig
export default nextConfig
