/**
 * ZAI AI Provider adapter (default).
 *
 * Uses the existing `z-ai-web-dev-sdk` dependency. This is the same SDK used
 * by the offline image-generation script — adapted here for chat completions.
 */

import ZAI from 'z-ai-web-dev-sdk';
import type { AIProvider, RewriteResult, SEOResult } from '../provider';
import { REWRITE_SYSTEM, translateSystem, seoSystem, categorizeSystem } from '../prompts';
import { parseJSON, retry } from './helpers';

export class ZAIProvider implements AIProvider {
  private client: ZAI | null = null;

  private async getClient(): Promise<ZAI> {
    if (!this.client) this.client = await ZAI.create();
    return this.client;
  }

  async rewrite(content: string, opts: { type?: string } = {}): Promise<RewriteResult> {
    const user = `Opportunity type: ${opts.type || 'general'}\n\nContent to rewrite:\n${content}`;
    const raw = await retry(() => this.chat(REWRITE_SYSTEM, user));
    const parsed = parseJSON(raw);
    return {
      text: parsed?.text || raw,
      summary: parsed?.summary || '',
    };
  }

  async translate(text: string, fromLang: string, toLang: string, opts?: { context?: string }): Promise<string> {
    const user = `${opts?.context ? `Context: ${opts.context}\n\n` : ''}Translate to ${toLang}:\n${text}`;
    const raw = await retry(() => this.chat(translateSystem(toLang), user));
    const parsed = parseJSON(raw);
    return parsed?.text || raw;
  }

  async translateArray(items: string[], fromLang: string, toLang: string): Promise<string[]> {
    if (!items.length) return [];
    const user = `Translate each item to ${toLang}. Respond as JSON: {"items": ["...", "..."]}\n\nItems:\n${JSON.stringify(items)}`;
    const raw = await retry(() => this.chat(translateSystem(toLang), user));
    const parsed = parseJSON(raw);
    return parsed?.items || (parsed ? [parsed.text].filter(Boolean) : [raw]);
  }

  async generateSEO(content: string, lang: string, opts?: { title?: string }): Promise<SEOResult> {
    const user = `${opts?.title ? `Title hint: ${opts.title}\n\n` : ''}Content:\n${content.slice(0, 2000)}`;
    const raw = await retry(() => this.chat(seoSystem(lang), user));
    const parsed = parseJSON(raw);
    return {
      seoTitle: parsed?.seoTitle || opts?.title || 'Opportunity',
      metaDescription: parsed?.metaDescription || '',
      keywords: Array.isArray(parsed?.keywords) ? parsed.keywords : [],
      slug: parsed?.slug || 'opportunity',
      ogTitle: parsed?.ogTitle || parsed?.seoTitle || opts?.title || 'Opportunity',
      ogDescription: parsed?.ogDescription || parsed?.metaDescription || '',
    };
  }

  async categorize(text: string, knownSlugs: string[]): Promise<string[]> {
    const user = `Known categories: ${knownSlugs.join(', ')}\n\nOpportunity text:\n${text.slice(0, 1500)}`;
    const raw = await retry(() => this.chat(categorizeSystem(knownSlugs), user));
    const parsed = parseJSON(raw);
    return Array.isArray(parsed?.categories) ? parsed.categories : [];
  }

  /** Core chat call to the ZAI SDK. */
  private async chat(system: string, user: string): Promise<string> {
    const client = await this.getClient();
    const res = await client.chat.completions.create({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });
    // SDK shape mirrors OpenAI: choices[0].message.content
    return (res as any).choices?.[0]?.message?.content || '';
  }
}
