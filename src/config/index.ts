import "dotenv/config";

function normalizeOrigin(origin: string) {
  return origin.trim().replace(/\/+$/, "");
}

function getFrontendOrigins() {
  const primary = process.env.FRONTEND_URL ?? "http://localhost:3000";
  const extra = process.env.FRONTEND_URLS ?? "";

  const merged = [primary, ...extra.split(",")]
    .map((value) => value.trim())
    .filter(Boolean)
    .map(normalizeOrigin);

  return Array.from(new Set(merged));
}

export const config = {
  port: process.env.PORT || 5000,
  databaseUrl: process.env.DATABASE_URL!,
  frontendUrl: normalizeOrigin(
    process.env.FRONTEND_URL || "http://localhost:3000",
  ),
  frontendOrigins: getFrontendOrigins(),
  betterAuthUrl: process.env.BETTER_AUTH_URL!,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
};
