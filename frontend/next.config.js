/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false, // It's better to fix lint errors before building
  },
  typescript: {
    ignoreBuildErrors: false, // It's better to fix type errors before building
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  async rewrites() {
    // Ensure consistency with the default API URL if NEXT_PUBLIC_API_URL is not set.
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const aiServiceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';

    return [
      // AI Service endpoints
      {
        source: '/api/v1/speech/:path*',
        destination: `${aiServiceUrl}/api/v1/speech/:path*`,
      },
      {
        source: '/api/v1/lessons/:path*',
        destination: `${aiServiceUrl}/api/v1/lessons/:path*`,
      },
      {
        source: '/api/v1/content/:path*',
        destination: `${aiServiceUrl}/api/v1/content/:path*`,
      },
      {
        source: '/api/v1/conversation/:path*',
        destination: `${aiServiceUrl}/api/v1/conversation/:path*`,
      },
      {
        source: '/health',
        destination: `${aiServiceUrl}/health`,
      },
      // Backend API endpoints
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
