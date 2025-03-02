/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  serverExternalPackages: ["argon2", "prisma", "@prisma/client"],
  images: {
    domains: ["avatars.githubusercontent.com", "lh3.googleusercontent.com", "vercel.com"],
  },
  httpAgentOptions: {
    keepAlive: true,
    maxHeaderSize: 64 * 1024,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'x-powered-by',
            value: 'Next.js',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ]
  },
}

export default nextConfig 