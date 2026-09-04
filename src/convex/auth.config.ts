import type { AuthConfig } from "convex/server";

export default {
  providers: [
    // Convex Auth provider for WEBRIXO's own sign-in (email code / guest, see
    // src/convex/auth.ts). The deployment self-issues JWTs (iss = CONVEX_SITE_URL)
    // validated via OIDC discovery served by auth.addHttpRoutes() in convex/http.ts.
    // Keep this as a plain provider entry (not customJwt), or sign-in never confirms.
    {
      domain: process.env.CONVEX_SITE_URL!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
