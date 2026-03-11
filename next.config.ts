import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {},
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/.next/**', '**/node_modules/**'],
      };
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: '/recruiter/register',
        destination: '/auth/register/recruiter',
        permanent: true,
      },
      {
        source: '/job-seeker/register',
        destination: '/auth/register/job-seeker',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5000/api/:path*',
        },
      ],
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
      },
    ],
  },
};

export default nextConfig;
