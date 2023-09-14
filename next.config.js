/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["sharp", "onnxruntime-node"],
  },
};

module.exports = nextConfig;
