function randomCode(prefix: string) {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${digits}`;
}

/**
 * Generates a short reference code (e.g. STY-2461) and retries on the rare
 * collision instead of relying on a database sequence.
 */
export async function generateUniqueRefCode(
  exists: (refCode: string) => Promise<boolean>,
  prefix: string,
  maxAttempts = 5
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = randomCode(prefix);
    if (!(await exists(code))) return code;
  }
  throw new Error("Could not generate a unique reference code, please retry");
}
