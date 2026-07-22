import { describe, it, expect } from 'vitest';
import { computeHash, hasChanged } from './dedupe';
import type { RawListing } from './types';

function makeListing(overrides: Partial<RawListing> = {}): RawListing {
  return {
    title: 'Test Scholarship',
    sourceUrl: 'https://example.com/job/1',
    sourceName: 'Test',
    description: 'A great opportunity for students.',
    ...overrides,
  };
}

describe('dedupe', () => {
  describe('computeHash', () => {
    it('returns a deterministic sha256 hex string', async () => {
      const listing = makeListing();
      const h1 = await computeHash(listing);
      const h2 = await computeHash(listing);
      expect(h1).toBe(h2);
      expect(h1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('changes when title changes', async () => {
      const h1 = await computeHash(makeListing({ title: 'A' }));
      const h2 = await computeHash(makeListing({ title: 'B' }));
      expect(h1).not.toBe(h2);
    });

    it('changes when sourceUrl changes', async () => {
      const h1 = await computeHash(makeListing({ sourceUrl: 'https://a.com/1' }));
      const h2 = await computeHash(makeListing({ sourceUrl: 'https://b.com/1' }));
      expect(h1).not.toBe(h2);
    });

    it('changes when deadline changes', async () => {
      const h1 = await computeHash(makeListing({ deadline: '2026-01-01' }));
      const h2 = await computeHash(makeListing({ deadline: '2026-02-01' }));
      expect(h1).not.toBe(h2);
    });

    it('changes when description changes', async () => {
      const h1 = await computeHash(makeListing({ description: 'AAA' }));
      const h2 = await computeHash(makeListing({ description: 'BBB' }));
      expect(h1).not.toBe(h2);
    });

    it('is insensitive to description changes beyond the 500-char window', async () => {
      // Both descriptions share the same first 500 chars; the difference
      // is only in chars beyond position 500, which the hash ignores.
      const base = 'a'.repeat(500);
      const h1 = await computeHash(makeListing({ description: base }));
      const h2 = await computeHash(makeListing({ description: base + 'different tail' }));
      expect(h1).toBe(h2);
    });
  });

  describe('hasChanged', () => {
    it('returns true when hashes differ', () => {
      expect(hasChanged('aaa', 'bbb')).toBe(true);
    });

    it('returns false when hashes match', () => {
      expect(hasChanged('same', 'same')).toBe(false);
    });

    it('returns true when existing is null', () => {
      expect(hasChanged(null, 'bbb')).toBe(true);
    });
  });
});
