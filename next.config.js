/** @type {import('next').NextConfig} */
module.exports = {
  rewrites: async () => {
    return [
      {
        source: '/api/ai/:path*',
        destination: `${process.env.AI_REST_API_URL}/:path*`,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**'
      }
    ]
  }
}
