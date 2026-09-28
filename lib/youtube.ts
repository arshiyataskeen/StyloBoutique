/**
 * The owner types whatever they have to hand — "@stylo_ladies", a channel link
 * copied from the app, or one with tracking parameters on the end. All of it
 * resolves to a URL that opens the channel.
 *
 * Anything that is not a channel returns null, and every place that shows the
 * link checks for that, so an empty or unusable field leaves no YouTube mark on
 * the site at all. That is stricter than it looks like it needs to be, on
 * purpose: a pill in the footer pointing at a video, at YouTube's front page or
 * at a channel that does not exist is worse than no pill, and the owner gets
 * told what to type instead of quietly publishing a dead link.
 *
 * It stays looser than the Instagram parser in one way — YouTube has several
 * shapes of channel address (@handle, /channel/UC…, /c/name, the old
 * /user/name), and rewriting them all to one form risks turning a working link
 * into a broken one, so a channel URL is kept as the owner copied it.
 */
export type YoutubeChannel = {
  /** A URL that opens the channel. */
  url: string;
  /** What to show as the link text — the handle, or the channel name. */
  label: string;
};

/** YouTube handles: letters, digits, underscore, hyphen and period, 3–30. */
const HANDLE = /^[A-Za-z0-9._-]{3,30}$/;

/** The hosts a channel link can arrive on. Anything else is another site. */
const HOST = /^(?:www\.|m\.)?(?:youtube\.com|youtu\.be)$/i;

/** Channel ids are "UC" plus 22 characters. */
const CHANNEL_ID = /^UC[A-Za-z0-9_-]{20,}$/;

/**
 * What an owner types in the box to mean "we don't have one". These are all
 * valid handle shapes, so without this they would publish a pill pointing at
 * youtube.com/@none. Clearing the field is the right way to hide the link, but
 * this catches the common ways of saying the same thing.
 */
const PLACEHOLDERS = new Set(["no", "none", "na", "nil", "nope", "nothing", "tbd", "null"]);

/**
 * First path segments that belong to YouTube itself rather than to a channel,
 * so "youtube.com/watch" is not mistaken for a legacy custom URL.
 */
const RESERVED = new Set([
  "watch",
  "shorts",
  "playlist",
  "results",
  "feed",
  "embed",
  "live",
  "hashtag",
  "gaming",
  "premium",
  "account",
  "about",
  "t",
]);

export function parseYoutube(input?: string | null): YoutubeChannel | null {
  const raw = input?.trim();
  if (!raw) return null;

  const withoutScheme = raw.replace(/^https?:\/\//i, "");
  const host = withoutScheme.split(/[/?#]/)[0] ?? "";

  // A bare word is a handle. Anything carrying a scheme, a path or a domain
  // suffix is an address, and has to be a YouTube one to count.
  const isAddress =
    /^https?:\/\//i.test(raw) || withoutScheme.includes("/") || /\.[a-z]{2,}$/i.test(host);

  if (!isAddress) {
    const handle = raw.replace(/^@/, "");
    if (!HANDLE.test(handle) || PLACEHOLDERS.has(handle.toLowerCase())) return null;
    return { url: `https://youtube.com/@${handle}`, label: `@${handle}` };
  }

  if (!HOST.test(host)) return null;

  // youtu.be only ever shortens a single video, never a channel.
  if (/^(?:www\.)?youtu\.be$/i.test(host)) return null;

  // Drop the query string, which is usually tracking, and read what is left.
  const segments = withoutScheme
    .split(/[?#]/)[0]
    .split("/")
    .slice(1)
    .filter(Boolean);

  const [first, second] = segments;
  if (!first) return null; // youtube.com on its own is not a channel.

  const keep = `https://youtube.com/${segments.join("/")}`;

  if (first.startsWith("@")) {
    const handle = first.slice(1);
    if (!HANDLE.test(handle)) return null;
    return { url: `https://youtube.com/@${handle}`, label: `@${handle}` };
  }

  if (first === "channel") {
    if (!second || !CHANNEL_ID.test(second)) return null;
    // A channel id is not readable, so the link needs words instead.
    return { url: `https://youtube.com/channel/${second}`, label: "YouTube channel" };
  }

  if (first === "c" || first === "user") {
    if (!second || !HANDLE.test(second)) return null;
    return { url: `https://youtube.com/${first}/${second}`, label: second };
  }

  // A legacy custom URL — youtube.com/stylo — but only when it is a single
  // segment that could be a name. /watch and friends are YouTube's own pages.
  if (segments.length === 1 && !RESERVED.has(first.toLowerCase()) && HANDLE.test(first)) {
    return { url: keep, label: first };
  }

  return null;
}
