import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { backendConfigured } from "@/lib/backend";
import { usePreviewAuth } from "@/lib/preview";

function useConvexBackedAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const { signIn, signOut } = useAuthActions();

  // Derive isLoading directly from the dependencies instead of managing separate state
  const isLoading = isAuthLoading || user === undefined;

  return { isLoading, isAuthenticated, user, signIn, signOut };
}

/**
 * Chosen once at module load, never per render, so hook order stays stable.
 * With a real deployment configured this is the Convex implementation and the
 * preview one is never reached.
 */
export const useAuth = backendConfigured ? useConvexBackedAuth : usePreviewAuth;
