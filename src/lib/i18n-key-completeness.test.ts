import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { translations } from './i18n';

describe('Translation System - Translation Key Completeness', () => {
  describe('Property 2: Translation Key Completeness Across Languages', () => {
    // Feature: complete-multilingual-translation, Property 2: Translation Key Completeness Across Languages
    // **Validates: Requirements 2.13, 6.1, 6.2, 6.3**

    it('should have every English translation key present in Persian (fa) with non-empty values', () => {
      const enKeys = Object.keys(translations.en);

      fc.assert(
        fc.property(
          fc.constantFrom(...enKeys),
          (key) => {
            // Check that the key exists in fa
            expect(translations.fa).toHaveProperty(key);
            
            // Check that fa translation is non-empty
            const faValue = translations.fa[key];
            expect(faValue).toBeTruthy();
            expect(typeof faValue).toBe('string');
            expect(faValue.trim().length).toBeGreaterThan(0);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have every English translation key present in Pashto (ps) with non-empty values', () => {
      const enKeys = Object.keys(translations.en);

      fc.assert(
        fc.property(
          fc.constantFrom(...enKeys),
          (key) => {
            // Check that the key exists in ps
            expect(translations.ps).toHaveProperty(key);
            
            // Check that ps translation is non-empty
            const psValue = translations.ps[key];
            expect(psValue).toBeTruthy();
            expect(typeof psValue).toBe('string');
            expect(psValue.trim().length).toBeGreaterThan(0);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have every English translation key present in both fa and ps with non-empty values', () => {
      const enKeys = Object.keys(translations.en);

      fc.assert(
        fc.property(
          fc.constantFrom(...enKeys),
          (key) => {
            // Check that the key exists in both fa and ps
            expect(translations.fa).toHaveProperty(key);
            expect(translations.ps).toHaveProperty(key);
            
            // Check that fa translation is non-empty
            const faValue = translations.fa[key];
            expect(faValue).toBeTruthy();
            expect(typeof faValue).toBe('string');
            expect(faValue.trim().length).toBeGreaterThan(0);
            
            // Check that ps translation is non-empty
            const psValue = translations.ps[key];
            expect(psValue).toBeTruthy();
            expect(typeof psValue).toBe('string');
            expect(psValue.trim().length).toBeGreaterThan(0);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify all three languages have the same number of translation keys', () => {
      const enKeys = Object.keys(translations.en);
      const faKeys = Object.keys(translations.fa);
      const psKeys = Object.keys(translations.ps);

      // All three languages should have the exact same number of keys
      expect(faKeys.length).toBe(enKeys.length);
      expect(psKeys.length).toBe(enKeys.length);
    });

    it('should ensure no translation key has placeholder or empty values across all languages', () => {
      const enKeys = Object.keys(translations.en);

      fc.assert(
        fc.property(
          fc.constantFrom(...enKeys),
          (key) => {
            const enValue = translations.en[key];
            const faValue = translations.fa[key];
            const psValue = translations.ps[key];

            // Ensure values are not just whitespace
            expect(enValue.trim()).not.toBe('');
            expect(faValue.trim()).not.toBe('');
            expect(psValue.trim()).not.toBe('');

            // Ensure values are not placeholder patterns like {PLACEHOLDER}
            expect(enValue).not.toMatch(/^\{[A-Z_]+\}$/);
            expect(faValue).not.toMatch(/^\{[A-Z_]+\}$/);
            expect(psValue).not.toMatch(/^\{[A-Z_]+\}$/);

            // Ensure values are not TODOs or common placeholder text
            expect(enValue.toLowerCase()).not.toMatch(/^(todo|fixme|tbd|placeholder)$/);
            expect(faValue.toLowerCase()).not.toMatch(/^(todo|fixme|tbd|placeholder)$/);
            expect(psValue.toLowerCase()).not.toMatch(/^(todo|fixme|tbd|placeholder)$/);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify key symmetry: every key in en must exist in fa and ps', () => {
      const enKeys = Object.keys(translations.en);
      const faKeys = Object.keys(translations.fa);
      const psKeys = Object.keys(translations.ps);

      // Convert to sets for efficient lookup
      const faKeySet = new Set(faKeys);
      const psKeySet = new Set(psKeys);

      fc.assert(
        fc.property(
          fc.constantFrom(...enKeys),
          (key) => {
            // Every key in en must exist in fa and ps
            expect(faKeySet.has(key)).toBe(true);
            expect(psKeySet.has(key)).toBe(true);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify no extra keys exist in fa or ps that are not in en', () => {
      const enKeys = Object.keys(translations.en);
      const faKeys = Object.keys(translations.fa);
      const psKeys = Object.keys(translations.ps);

      const enKeySet = new Set(enKeys);

      // Check fa does not have extra keys
      const extraFaKeys = faKeys.filter(key => !enKeySet.has(key));
      expect(extraFaKeys).toEqual([]);

      // Check ps does not have extra keys
      const extraPsKeys = psKeys.filter(key => !enKeySet.has(key));
      expect(extraPsKeys).toEqual([]);
    });

    it('should verify translation values are semantically different from the key itself', () => {
      const enKeys = Object.keys(translations.en);

      fc.assert(
        fc.property(
          fc.constantFrom(...enKeys),
          (key) => {
            const enValue = translations.en[key];
            const faValue = translations.fa[key];
            const psValue = translations.ps[key];

            // Translation values should not be the same as the key (except for dynamic params)
            // This ensures translations are actually translated, not just placeholders
            if (!key.includes('{') && !enValue.includes('{')) {
              expect(enValue).not.toBe(key);
            }
            if (!key.includes('{') && !faValue.includes('{')) {
              expect(faValue).not.toBe(key);
            }
            if (!key.includes('{') && !psValue.includes('{')) {
              expect(psValue).not.toBe(key);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
