const distDir = process.env.NEXT_DIST_DIR ?? '.next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir,
};

export default nextConfig;
