import type { NextConfig } from "next";

function normalizeApiBaseUrl(rawValue: string | undefined) {
  const value = String(rawValue || "").trim().replace(/\/$/, "");
  if (!value) return "";

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const lower = value.toLowerCase();
  if (lower.startsWith("localhost") || lower.startsWith("127.0.0.1")) {
    return `http://${value}`;
  }

  return `https://${value}`;
}

const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: process.cwd(),
  },
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
    if (!API_BASE_URL) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "NEXT_PUBLIC_API_URL is not set. API rewrites are disabled until it is defined.",
        );
      }

      return {
        beforeFiles: [],
        fallback: [],
      };
    }

    return {
      beforeFiles: [
        {
          source: '/api/auth/:path(register|login|role|profile|upload-avatar|upload-docs|forgot-password)',
          destination: `${API_BASE_URL}/api/auth/:path`,
        },
        {
          source: '/api/auth/profile/:path*',
          destination: `${API_BASE_URL}/api/auth/profile/:path*`,
        },
        {
          source: '/api/auth/forgot-password/:path*',
          destination: `${API_BASE_URL}/api/auth/forgot-password/:path*`,
        }
      ],
      fallback: [
        {
          source: '/api/:path*',
          destination: `${API_BASE_URL}/api/:path*`,
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
