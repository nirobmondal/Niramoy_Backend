import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { userRole } from "../constant/role";


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),
    trustedOrigins: [process.env.FRONTEND_URL!],
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: userRole.CUSTOMER,
                required: false
            },
            phone: {
                type: "string",
                required: false
            }
        }
    },
    emailAndPassword: { 
        enabled: true, 
        autoSignIn: false
    },
    baseURL: process.env.BETTER_AUTH_URL, 
    socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
            accessType: "offline", 
            prompt: "select_account consent",
        }, 
    },
});