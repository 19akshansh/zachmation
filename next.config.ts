import { envSchem } from "@/config/envSchema";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["handlebars"],
  allowedDevOrigins: [
    envSchem.NEXT_PUBLIC_APP_URL,
    "scarlett-semipictorial-liliana.ngrok-free.dev",
    "3000-cs-767356314566-default.cs-asia-southeast1-cash.cloudshell.dev",
  ],
};

export default withSentryConfig(nextConfig, {
  org: "akshansh-1g",
  project: "zachmation",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
});
