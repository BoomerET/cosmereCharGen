/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow additional origins to request dev assets (/_next/*) during development
  allowedDevOrigins: ['pi5-16.local'],
  output: 'export',
  basePath: '/cosmere',
  assetPrefix: '/cosmere',
};


/* const nextConfig = {}; */

export default nextConfig;

//module.exports = nextConfig;

