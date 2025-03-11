/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_USER_ID: process.env.USER_ID,
    NEXT_PUBLIC_USER_NAME: process.env.USER_NAME,
    NEXT_PUBLIC_SIXDIGIT_PASSWORD: process.env.SIXDIGIT_PASSWORD,
  },
};

module.exports = nextConfig; 