/**
 * The owner types whatever they have to hand — "@stylo_ladies", "stylo_ladies",
 * "instagram.com/stylo_ladies" or the full profile URL. All of it resolves to
 * the same canonical URL plus the bare handle, so the site can show "@handle"
 * as text instead of a generic "follow us" label.
 */
export type InstagramAccount = {
  /** Canonical profile URL, safe to put in href. */
  url: string;
  /** Bare handle with no leading "@". */
  handle: string;
};

/** Instagram usernames: letters, digits, underscore and period, up to 30 chars. */
const HANDLE = /^[A-Za-z0-9._]{1,30}$/;

export function parseInstagram(input?: string | null): InstagramAccount | null {
  const raw = input?.trim();
  if (!raw) return null;

  // Strip the protocol, host and any query string / trailing slash, leaving the
  // first path segment — which is the username for a profile URL.
  const withoutScheme = raw.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  const path = withoutScheme.replace(/^instagram\.com\/?/i, "");
  const first = path.split(/[/?#]/)[0] ?? "";
  const handle = first.replace(/^@/, "");

  if (!HANDLE.test(handle)) return null;

  return { url: `https://instagram.com/${handle}`, handle };
}
