/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["sharp", "onnxruntime-node"],
  },
};

module.exports = nextConfig;
