import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // ── PROXY: Tránh CORS khi gọi API Gateway từ browser ──
  // Mọi request /api/gateway/* sẽ được forward server-side đến backend,
  // browser chỉ thấy localhost:3000 (cùng origin) → không có CORS.
  async rewrites() {
    const apiGateway = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9082';
    return [
      {
        source: '/api/gateway/:path*',
        destination: `${apiGateway}/:path*`,
      },
    ];
  },
};

export default nextConfig;