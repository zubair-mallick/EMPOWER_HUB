/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
      ignoreBuildErrors: true, // Disables type checking on build
    },
    eslint: {
      ignoreDuringBuilds: true, // Disables ESLint checks on build
    },
  };

export default nextConfig;
