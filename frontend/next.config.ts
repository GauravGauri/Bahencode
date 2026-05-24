import type { NextConfig } from "next";

const remotePatterns: Array<{
  protocol: 'http' | 'https';
  hostname: string;
}> = [
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
];

if (process.env.NEXT_PUBLIC_API_URL) {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_API_URL);
    remotePatterns.push({
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
    });
  } catch (e) {
    console.error('Invalid NEXT_PUBLIC_API_URL for Next.js image configuration:', e);
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
