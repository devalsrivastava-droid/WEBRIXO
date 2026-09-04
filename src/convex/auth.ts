// Convex Auth configuration. Only edit to add or remove an auth provider.

import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { Password } from "@convex-dev/auth/providers/Password";

/**
 * Two ways in, both self-contained:
 *   - Password: email and password, stored and hashed by Convex Auth. No email
 *     service to configure, so it works the moment the deployment is up.
 *   - Anonymous: the "continue as a guest" button.
 *
 * Email one-time codes were removed: they need a mail provider (and a verified
 * sending domain) before anyone can sign in at all, which is a lot of setup to
 * stand between a visitor and an account.
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password(), Anonymous],
});
