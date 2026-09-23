import type { NextConfig } from 'next';
const apiUrl = process.env.API_URL || 'http://127.0.0.1:4000';
const config: NextConfig = {
  poweredByHeader: false,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }] },
  async rewrites() { return [{ source: '/api/v1/:path*', destination: `${apiUrl}/api/v1/:path*` }]; },
  async headers() { return [{ source: '/:path*', headers: [{ key: 'X-Content-Type-Options', value: 'nosniff' }, { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }, { key: 'X-Frame-Options', value: 'DENY' }] }]; }
};
export default config;
