import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["handlebars"],
  allowedDevOrigins: [
    "3000-19akshansh-zachmation-e6nar9x7fw.app.codeanywhere.com",
    "scarlett-semipictorial-liliana.ngrok-free.dev",
    "3000-cs-7452aacf-6504-4c6a-8e1c-96d00bb63f05.cs-asia-southeast1-ajrg.cloudshell.dev",
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
