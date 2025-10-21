import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    //
  },
  // This is the new line that fixes the cross-origin issue.
  allowedDevOrigins: ["*.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev"],
};

export default nextConfig;
