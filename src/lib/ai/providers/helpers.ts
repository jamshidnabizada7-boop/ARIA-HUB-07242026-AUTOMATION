/**
 * Shared helpers for AI provider adapters.
 */

/**
 * Best-effort parse of a JSON object from an LLM response. Models sometimes
 * wrap JSON in markdown fences or add prose; we extract the first {...} block.
 */
export function parseJSON(raw: string): Record<string, any> | null {
  if (!raw) return null;
  // Strip markdown code fences
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  // Try direct parse first
  try { return JSON.parse(s); } catch { /* continue */ }
  // Extract first {...} block
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start >= 0 && end > start) {
    const slice = s.slice(start, end + 1);
    try { return JSON.parse(slice); } catch { /* continue */ }
  }
  return null;
}

/**
 * Retry a promise-returning function up to `max` times with exponential backoff.
 * Rethrows the last error if all attempts fail.
 */
export async function retry<T>(fn: () => Promise<T>, max = 3, baseMs = 1000): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < max; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < max - 1) await sleep(baseMs * Math.pow(2, i));
    }
  }
  throw lastErr;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
