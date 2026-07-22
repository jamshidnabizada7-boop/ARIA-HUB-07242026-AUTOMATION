/**
 * Small helpers shared by scrapers and the orchestrator.
 * Pure functions, no I/O — easy to unit test.
 */

import { URL } from 'url';

/** Realistic browser User-Agent so source sites respond with full markup. */
export const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 ARIAHubImportBot/1.0';

/**
 * Strip HTML to clean, readable text. Collapses whitespace, decodes common
 * entities, and converts block elements to line breaks for readability.
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  let s = html;
  // Convert <br>, </p>, </li>, </h*>, </div> to newlines
  s = s.replace(/<(br|\/p|\/li|\/h[1-6]|\/div|\/tr)\s*>/gi, '\n');
  // Drop script/style entirely
  s = s.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '');
  // Remove all remaining tags
  s = s.replace(/<[^>]+>/g, '');
  // Decode common HTML entities
  s = s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&hellip;/g, '…')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');
  // Collapse whitespace per line, trim, and collapse 3+ newlines to 2
  s = s
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return s;
}

/**
 * Collapse HTML to a single-spaced plain-text summary (no line breaks),
 * useful for short excerpts and hashing.
 */
export function htmlToExcerpt(html: string, max = 500): string {
  const text = stripHtml(html).replace(/\s+/g, ' ').trim();
  return text.length > max ? text.slice(0, max) + '…' : text;
}

/**
 * Resolve a possibly-relative URL against a base. Returns null on failure.
 */
export function resolveUrl(maybeRelative: string | null | undefined, base: string): string | null {
  if (!maybeRelative) return null;
  const v = maybeRelative.trim();
  if (!v) return null;
  try {
    return new URL(v, base).toString();
  } catch {
    return null;
  }
}

/**
 * Try to parse a date string into ISO `YYYY-MM-DD`. Returns null if unknown.
 * Handles common formats from Afghan job/scholarship sites.
 */
export function parseDate(input?: string | null): string | null {
  if (!input) return null;
  const s = String(input).trim();
  if (!s) return null;
  // Already ISO-ish?
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  // Try Date.parse for a broad range of formats
  const t = Date.parse(s);
  if (!Number.isNaN(t)) {
    const d = new Date(t);
    if (d.getFullYear() > 1990 && d.getFullYear() < 2200) {
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${d.getFullYear()}-${mm}-${dd}`;
    }
  }
  return null;
}

/**
 * Generate a URL-safe slug from arbitrary text. Handles Latin, Cyrillic, and
 * strips/ transliterates other scripts to keep slugs ASCII-safe.
 */
export function slugify(input: string, maxLen = 70): string {
  const s = (input || '')
    .toString()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')     // non-alphanumeric → dash
    .replace(/^-+|-+$/g, '')          // trim leading/trailing dashes
    .replace(/-{2,}/g, '-')           // collapse dashes
    .slice(0, maxLen)
    .replace(/-+$/, '');
  return s || 'opportunity';
}

/** sha256 hex of a string, using the Web Crypto API (available in Node 18+). */
export async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Promise-based sleep. */
export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Best-effort string normalization for fuzzy comparison of titles/orgs.
 * Lowercases, strips punctuation and diacritics, collapses whitespace.
 */
export function normalizeForCompare(s?: string | null): string {
  if (!s) return '';
  return s
    .toString()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Remove secrets / internal paths / overly long stack traces from an error
 * message before persisting it in logs shown in the admin panel.
 */
export function sanitizeError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  return raw
    .replace(/(api[_-]?key|token|password|secret|authorization)\s*[:=]\s*\S+/gi, '$1=***')
    .replace(/file:\/\/\/[^\s"]+/g, 'file:///...')
    .slice(0, 1000);
}
