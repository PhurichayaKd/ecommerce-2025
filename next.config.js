/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tse3.mm.bing.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.electrolux.co.th",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "thf.bing.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media-cdn.bnn.in.th",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["recharts"],
  },
};

module.exports = nextConfig;
