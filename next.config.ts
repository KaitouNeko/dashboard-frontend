import type { NextConfig } from "next";
import dotenv from "dotenv";
import { config } from "./src/lib/config";

dotenv.config(); // Load environment variables from .env file

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_DOMAIN: config.NEXT_PUBLIC_DOMAIN,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
