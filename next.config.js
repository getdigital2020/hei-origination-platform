/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  modularizeImports: {
    // Only keep Lucide optimization
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/\\1"
    }
  }
};

module.exports = nextConfig;
