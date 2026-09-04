/**
 * Is there a real Convex deployment behind this build?
 *
 * The downloadable preview and any build made before `npx convex dev` has run
 * carry a placeholder URL, so sign-in, the account page and the contact form
 * have nothing to talk to. Rather than letting those buttons spin forever, we
 * detect it once and say so plainly.
 */
const RAW = (import.meta.env.VITE_CONVEX_URL as string | undefined) ?? "";

const PLACEHOLDERS = [
  "example.convex.cloud",
  "happy-otter-123",
  "your-deployment",
  "localhost:0",
];

export const CONVEX_URL = RAW;

export const backendConfigured =
  Boolean(RAW) &&
  /^https?:\/\//.test(RAW) &&
  !PLACEHOLDERS.some(p => RAW.includes(p));

/** Opened straight from disk, so there is no server and no backend at all. */
export const isFilePreview =
  typeof window !== "undefined" && window.location.protocol === "file:";

export const backendMessage = isFilePreview
  ? "This is the offline preview file, so there's no server behind it. Sign-in, the account page and the contact form need the real site."
  : "The site isn't connected to its backend yet. Run `npx convex dev` and set VITE_CONVEX_URL, then reload.";
