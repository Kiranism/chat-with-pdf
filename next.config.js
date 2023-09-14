/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, os: false };
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["sharp", "onnxruntime-node"],
  },
};

module.exports = nextConfig;
