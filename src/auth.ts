import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db"; // Adjust path to your db instance

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
    }),
    emailAndPassword: {
        enabled: true
    },
    baseURL: process.env.BETTER_AUTH_URL || "https://uhudbuilders.com",
    trustedOrigins: [
        "http://localhost:5173",
        "http://localhost:3001",
        "https://uhudbuilders.com",
        "http://uhudbuilders.com",
        "https://www.uhudbuilders.com",
        "https://api.uhudbuilders.com"
    ],
    advanced: {
        crossSubDomainCookies: {
            enabled: true
        }
    }
});
