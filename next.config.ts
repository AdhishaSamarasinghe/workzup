import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
    ]
  },
};

export default nextConfig;
