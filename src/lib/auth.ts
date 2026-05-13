import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/db";
import { polar, checkout, portal } from "@polar-sh/better-auth";
import { polarClient } from "./polar";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,

  trustedOrigins: [
    "http://localhost:3000",
    "https://bug-free-robot-w457rvjqvx7fr4q-3000.app.github.dev",
  ],

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,

      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },

    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,

      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  plugins: [
    polar({
      client: polarClient,

      createCustomerOnSignUp: true,

      use: [
        checkout({
          products: [
            {
              productId: process.env.POLAR_PRO_PRODUCT_SLUG!,

              slug: "pro",
            },
          ],

          successUrl: process.env.POLAR_SUCCESS_URL,

          authenticatedUsersOnly: true,
        }),

        portal(),
      ],
    }),
  ],
});
