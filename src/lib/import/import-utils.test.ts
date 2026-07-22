import { describe, it, expect } from 'vitest';
import {
  slugify,
  stripHtml,
  htmlToExcerpt,
  resolveUrl,
  parseDate,
  normalizeForCompare,
  sanitizeError,
} from './utils';

describe('import utils', () => {
  describe('slugify', () => {
    it('lowercases and dash-separates words', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('strips punctuation', () => {
      expect(slugify("Scholarship 2026: Apply Now!")).toBe('scholarship-2026-apply-now');
    });

    it('handles accented characters', () => {
      expect(slugify('Café Résumé')).toBe('cafe-resume');
    });

    it('returns a default for empty input', () => {
      expect(slugify('')).toBe('opportunity');
      expect(slugify('   ')).toBe('opportunity');
    });

    it('respects max length', () => {
      const long = 'a'.repeat(200);
      expect(slugify(long, 50).length).toBeLessThanOrEqual(50);
    });
  });

  describe('stripHtml', () => {
    it('removes tags', () => {
      expect(stripHtml('<p>Hello <strong>World</strong></p>')).toBe('Hello World');
    });

    it('converts block elements to newlines', () => {
      const html = '<p>First</p><p>Second</p>';
      const out = stripHtml(html);
      expect(out).toContain('First');
      expect(out).toContain('Second');
    });

    it('decodes entities', () => {
      expect(stripHtml('Tom &amp; Jerry')).toBe('Tom & Jerry');
      expect(stripHtml('&nbsp;hi')).toBe('hi');
    });

    it('removes script and style blocks', () => {
      expect(stripHtml('<script>alert(1)</script>text')).toBe('text');
      expect(stripHtml('<style>.x{}</style>text')).toBe('text');
    });

    it('handles empty input', () => {
      expect(stripHtml('')).toBe('');
    });
  });

  describe('htmlToExcerpt', () => {
    it('strips html and collapses whitespace', () => {
      expect(htmlToExcerpt('<p>Hello\n  World</p>')).toBe('Hello World');
    });

    it('truncates with ellipsis', () => {
      const long = '<p>' + 'a'.repeat(600) + '</p>';
      const out = htmlToExcerpt(long, 10);
      expect(out.endsWith('…')).toBe(true);
      expect(out.length).toBeLessThanOrEqual(11);
    });
  });

  describe('resolveUrl', () => {
    it('resolves relative URLs', () => {
      expect(resolveUrl('/jobs/123', 'https://example.com/jobs')).toBe('https://example.com/jobs/123');
    });

    it('passes through absolute URLs', () => {
      expect(resolveUrl('https://other.com/x', 'https://example.com')).toBe('https://other.com/x');
    });

    it('returns null for empty input', () => {
      expect(resolveUrl('', 'https://example.com')).toBeNull();
      expect(resolveUrl(null, 'https://example.com')).toBeNull();
    });

    it('returns null for empty/whitespace input', () => {
      expect(resolveUrl('   ', 'https://example.com')).toBeNull();
    });
  });

  describe('parseDate', () => {
    it('passes through ISO dates', () => {
      expect(parseDate('2026-07-14')).toBe('2026-07-14');
      expect(parseDate('2026-07-14T10:30:00')).toBe('2026-07-14');
    });

    it('parses human-readable dates', () => {
      expect(parseDate('August 15, 2026')).toBe('2026-08-15');
      expect(parseDate('Jan 1, 2025')).toBe('2025-01-01');
    });

    it('returns null for empty input', () => {
      expect(parseDate('')).toBeNull();
      expect(parseDate(null)).toBeNull();
    });
  });

  describe('normalizeForCompare', () => {
    it('lowercases and strips punctuation', () => {
      expect(normalizeForCompare('Hello, WORLD!')).toBe('hello world');
    });

    it('strips diacritics', () => {
      expect(normalizeForCompare('café')).toBe('cafe');
    });

    it('handles empty input', () => {
      expect(normalizeForCompare('')).toBe('');
      expect(normalizeForCompare(null)).toBe('');
    });
  });

  describe('sanitizeError', () => {
    it('redacts api keys', () => {
      const msg = 'Error: api_key=sk-12345 not valid';
      expect(sanitizeError(msg)).toContain('api_key=***');
      expect(sanitizeError(msg)).not.toContain('sk-12345');
    });

    it('redacts tokens', () => {
      const msg = 'token=abc123 failed';
      expect(sanitizeError(msg)).toContain('token=***');
    });

    it('redacts file paths', () => {
      const msg = 'Error reading file:///C:/secret/path';
      expect(sanitizeError(msg)).toBe('Error reading file:///...');
    });

    it('truncates long messages', () => {
      const long = 'x'.repeat(2000);
      expect(sanitizeError(long).length).toBeLessThanOrEqual(1000);
    });

    it('handles non-Error inputs', () => {
      expect(sanitizeError('plain string')).toBe('plain string');
      expect(sanitizeError(42)).toBe('42');
    });
  });
});
