/**
 * Pluggable AI provider abstraction.
 *
 * Reads AI_PROVIDER env var ('zai' | 'openai' | 'gemini') and lazy-loads the
 * corresponding adapter. If no provider/key is configured, returns null so the
 * orchestrator can run in "no-AI" degraded mode.
 */

import type { RawListing } from '../import/types';

// ── Public interface ──────────────────────────────────────────────────────────

export interface RewriteResult {
  /** Rewritten content in markdown (professional, SEO-friendly). */
  text: string;
  /** Concise summary (2-4 sentences). */
  summary: string;
}

export interface SEOResult {
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  slug: string;
  ogTitle: string;
  ogDescription: string;
}

export interface AIProvider {
  /** Professionally rewrite content and generate a concise summary. */
  rewrite(content: string, opts: { type?: string }): Promise<RewriteResult>;

  /** Translate a single string to the target language. */
  translate(text: string, fromLang: string, toLang: string, opts?: { context?: string }): Promise<string>;

  /** Translate an array of strings (e.g. keywords, tags). */
  translateArray(items: string[], fromLang: string, toLang: string): Promise<string[]>;

  /** Generate SEO metadata for content in a given language. */
  generateSEO(content: string, lang: string, opts?: { title?: string }): Promise<SEOResult>;

  /** Suggest category slugs from a known set. */
  categorize(text: string, knownSlugs: string[]): Promise<string[]>;
}

// ── Factory ───────────────────────────────────────────────────────────────────

let cachedProvider: AIProvider | null | undefined; // undefined = not checked yet

export async function getAIProvider(): Promise<AIProvider | null> {
  if (cachedProvider !== undefined) return cachedProvider;

  const provider = (process.env.AI_PROVIDER || 'zai').toLowerCase();

  try {
    switch (provider) {
      case 'zai': {
        if (!process.env.ZAI_API_KEY) {
          console.warn('[ai] ZAI_API_KEY not set — running in no-AI mode.');
          cachedProvider = null;
          return null;
        }
        const { ZAIProvider } = await import('./providers/zai');
        cachedProvider = new ZAIProvider();
        break;
      }
      case 'openai': {
        if (!process.env.OPENAI_API_KEY) {
          console.warn('[ai] OPENAI_API_KEY not set — running in no-AI mode.');
          cachedProvider = null;
          return null;
        }
        const { OpenAIProvider } = await import('./providers/openai');
        cachedProvider = new OpenAIProvider();
        break;
      }
      case 'gemini': {
        if (!process.env.GEMINI_API_KEY) {
          console.warn('[ai] GEMINI_API_KEY not set — running in no-AI mode.');
          cachedProvider = null;
          return null;
        }
        const { GeminiProvider } = await import('./providers/gemini');
        cachedProvider = new GeminiProvider();
        break;
      }
      default:
        console.warn(`[ai] Unknown AI_PROVIDER "${provider}" — running in no-AI mode.`);
        cachedProvider = null;
    }
  } catch (e) {
    console.error('[ai] Failed to initialize AI provider:', e);
    cachedProvider = null;
  }

  return cachedProvider;
}

/** Reset the cached provider (useful in tests). */
export function resetAIProvider(): void {
  cachedProvider = undefined;
}
