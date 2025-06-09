// lib/config.ts
import dotenv from "dotenv";

dotenv.config(); // 確保在非 Next.js context 也能載入環境變數

function getEnvVar(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback;
  if (typeof val === "undefined") {
    throw new Error(`❌ Missing environment variable: ${key}`);
  }
  return val;
}

export const config = {
  NEXT_PUBLIC_DOMAIN: getEnvVar(
    "NEXT_PUBLIC_API_BASE_URL",
    "http://localhost:2469"
  ),
};
