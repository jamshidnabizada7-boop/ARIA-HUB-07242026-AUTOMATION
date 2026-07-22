/**
 * Image download + optimization for imported opportunities.
 *
 * Downloads a remote image, optimizes it with sharp (resize + webp), and
 * stores it under public/uploads/imports/<sourceKey>/<slug>.webp.
 * Returns a web-root-relative path so it works exactly like the existing
 * image URL fields (e.g. Opportunity.image).
 *
 * On any failure, falls back to the original remote URL (hybrid mode).
 * On no image, returns a placeholder path.
 */

import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { slugify } from './utils';

const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'uploads', 'imports');
const WEB_PREFIX = '/uploads/imports';
const PLACEHOLDER = '/images/placeholder-opportunity.png';

/** Size presets (max width; height auto-scaled to preserve aspect ratio). */
const SIZES = {
  featured: 1600,
  logo: 400,
} as const;

export interface ImageResult {
  /** Web-root-relative path (/uploads/imports/...) or remote fallback URL. */
  path: string;
  /** True if the image was downloaded locally, false if remote fallback. */
  local: boolean;
}

/**
 * Download and optimize a featured image (max 1600px wide, webp).
 */
export async function downloadFeaturedImage(
  url: string | null | undefined,
  sourceKey: string,
  slug: string,
): Promise<ImageResult> {
  return downloadAndOptimize(url, sourceKey, slug, 'featured');
}

/**
 * Download and optimize a logo (max 400px wide, webp).
 */
export async function downloadLogo(
  url: string | null | undefined,
  sourceKey: string,
  slug: string,
): Promise<ImageResult> {
  return downloadAndOptimize(url, sourceKey, slug, 'logo');
}

/**
 * Core download + optimize logic. Idempotent: skips re-download if the file
 * already exists.
 */
async function downloadAndOptimize(
  url: string | null | undefined,
  sourceKey: string,
  slug: string,
  kind: keyof typeof SIZES | 'featured' | 'logo',
): Promise<ImageResult> {
  if (!url || !url.trim()) {
    return { path: kind === 'logo' ? '' : PLACEHOLDER, local: false };
  }

  const trimmedUrl = url.trim();
  const cleanSlug = slugify(slug) || 'image';
  const subdir = kind === 'logo' ? 'logos' : 'featured';
  const dir = path.join(UPLOADS_ROOT, sourceKey, subdir);
  const filename = `${cleanSlug}.webp`;
  const fullPath = path.join(dir, filename);
  const webPath = `${WEB_PREFIX}/${sourceKey}/${subdir}/${filename}`;

  // Idempotent: skip if already downloaded
  try {
    if (fs.existsSync(fullPath)) {
      return { path: webPath, local: true };
    }
  } catch {
    // ignore stat errors
  }

  try {
    // Download
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);
    const res = await fetch(trimmedUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'ARIAHubImportBot/1.0' },
      redirect: 'follow',
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 100) throw new Error('image too small (possibly an error page)');

    // Ensure directory exists
    fs.mkdirSync(dir, { recursive: true });

    // Optimize with sharp
    const maxWidth = SIZES[kind as 'featured' | 'logo'] || SIZES.featured;
    await sharp(buffer)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(fullPath);

    return { path: webPath, local: true };
  } catch (e) {
    console.error(`[images] download failed for ${trimmedUrl}:`, e);
    // Fallback to remote URL (hybrid mode)
    return { path: trimmedUrl, local: false };
  }
}
