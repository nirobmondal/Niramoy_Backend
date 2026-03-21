import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { userRole } from "../constant/role";
import { config } from "../config";

const isHttpsDeployment = config.betterAuthUrl.startsWith("https://");

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: config.frontendOrigins,
  advanced: {
    useSecureCookies: isHttpsDeployment,
    defaultCookieAttributes: {
      sameSite: isHttpsDeployment ? "none" : "lax",
      secure: isHttpsDeployment,
      httpOnly: true,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: userRole.CUSTOMER,
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      address: {
        type: "string",
        required: false,
      },
      isBanned: {
        type: "boolean",
        defaultValue: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  baseURL: config.betterAuthUrl,
  socialProviders: {
    google: {
      clientId: config.google.clientId,
      clientSecret: config.google.clientSecret,
      accessType: "offline",
      prompt: "select_account consent",
    },
  },
});
