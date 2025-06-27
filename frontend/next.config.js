/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [new URL("https://asfqwaeqkgivhubprdvf.supabase.co/**")],
  },
};

module.exports = nextConfig;
