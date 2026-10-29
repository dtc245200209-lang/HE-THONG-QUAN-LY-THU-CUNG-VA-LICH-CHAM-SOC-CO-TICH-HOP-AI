import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '192.168.1.241',
    '192.168.1.241:3000',
    '192.168.*.*',
    'localhost',
    'localhost:3000',
    '127.0.0.1',
    '127.0.0.1:3000',
    '**.ngrok-free.app',
    '**.ngrok.io',
    '**.ngrok.app',
    '**.ngrok.dev',
    '**.loca.lt',
    '**.localhost.run',
    'bore.pub',
    'bore.pub:*',
    '**.bore.pub',
    'petcareai.local'
  ],
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://127.0.0.1:8001/api/v1/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://127.0.0.1:8001/uploads/:path*',
      },
    ]
  }
};

export default nextConfig;
