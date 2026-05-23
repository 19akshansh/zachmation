import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["handlebars"],
  allowedDevOrigins: [
    "3000-19akshansh-zachmation-e6nar9x7fw.app.codeanywhere.com",
    "scarlett-semipictorial-liliana.ngrok-free.dev",
  ],

  async redirects() {
    return [
      {
        source: "/",
        destination: "/workflows",
        permanent: false,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: "akshansh-1g",
  project: "zachmation",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
});