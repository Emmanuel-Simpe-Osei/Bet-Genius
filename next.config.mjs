/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopack: {
      root: "./", // 👈 make sure Next knows to start in this folder
    },
  },
};

export default nextConfig;
