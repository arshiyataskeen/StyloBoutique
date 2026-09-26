import { revalidatePath } from "next/cache";

/**
 * Public pages are cached (ISR) for speed. Call this after any admin write
 * that could change what a visitor sees, so the change appears immediately
 * instead of waiting for the cache to expire.
 */
export function revalidateSite() {
  revalidatePath("/", "layout");
}
