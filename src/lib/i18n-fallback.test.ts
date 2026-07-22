import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { translate, translations } from './i18n';

/**
 * Property-Based Test: Fallback to English for Missing Translations
 * Task 4.2: Write property test for fallback to English
 * 
 * **Validates: Requirements 4.7, 6.4**
 * 
 * This test ensures that when a translation key is missing from Persian (fa) or Pashto (ps),
 * the translation system falls back to the English translation gracefully.
 */

describe('Translation System - Fallback Behavior', () => {
  describe('Property 3: Fallback to English for Missing Translations', () => {
    // Feature: complete-multilingual-translation, Property 3: Fallback to English for Missing Translations
    // **Validates: Requirements 4.7, 6.4**

    it('should fall back to English translation when key is missing in Persian (fa)', () => {
      // Get all keys from English translations
      const enKeys = Object.keys(translations.en);

      fc.assert(
        fc.property(
          fc.constantFrom(...enKeys),
          (key) => {
            // Get the English translation (our expected fallback)
            const englishTranslation = translations.en[key];

            // Test fallback behavior for Persian
            const faTranslation = translate('fa', key);

            // If the key exists in Persian, use it; otherwise, should fall back to English
            if (translations.fa[key]) {
              // Key exists in Persian - should return Persian translation
              expect(faTranslation).toBe(translations.fa[key]);
            } else {
              // Key missing in Persian - should fall back to English
              expect(faTranslation).toBe(englishTranslation);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should fall back to English translation when key is missing in Pashto (ps)', () => {
      // Get all keys from English translations
      const enKeys = Object.keys(translations.en);

      fc.assert(
        fc.property(
          fc.constantFrom(...enKeys),
          (key) => {
            // Get the English translation (our expected fallback)
            const englishTranslation = translations.en[key];

            // Test fallback behavior for Pashto
            const psTranslation = translate('ps', key);

            // If the key exists in Pashto, use it; otherwise, should fall back to English
            if (translations.ps[key]) {
              // Key exists in Pashto - should return Pashto translation
              expect(psTranslation).toBe(translations.ps[key]);
            } else {
              // Key missing in Pashto - should fall back to English
              expect(psTranslation).toBe(englishTranslation);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return English translation for completely missing keys in fa and ps', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }).filter(s => !translations.en[s]),
          (randomKey) => {
            // For a key that doesn't exist anywhere, it should:
            // 1. Try to get from 'fa' (undefined)
            // 2. Fall back to 'en' (undefined)
            // 3. Return the key itself as last resort
            
            const faResult = translate('fa', randomKey);
            const psResult = translate('ps', randomKey);

            // Since the key doesn't exist in any language, should return the key itself
            expect(faResult).toBe(randomKey);
            expect(psResult).toBe(randomKey);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always return a non-null, non-undefined value from translate function', () => {
      const enKeys = Object.keys(translations.en);
      
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          fc.constantFrom(...enKeys),
          (langCode, key) => {
            const result = translate(langCode, key);

            // Should never return null or undefined
            expect(result).toBeDefined();
            expect(result).not.toBeNull();
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle parametric translations with missing keys in fa/ps by falling back to English', () => {
      // Test with parametric translation keys that exist in English
      const parametricKeys = Object.keys(translations.en).filter(key => 
        translations.en[key].includes('{') && translations.en[key].includes('}')
      );

      if (parametricKeys.length > 0) {
        fc.assert(
          fc.property(
            fc.constantFrom(...parametricKeys),
            fc.record({
              count: fc.nat(1000),
              total: fc.nat(1000),
              name: fc.string({ minLength: 1, maxLength: 20 }),
              query: fc.string({ minLength: 1, maxLength: 30 })
            }),
            (key, params) => {
              const faResult = translate('fa', key, params);
              const psResult = translate('ps', key, params);

              // Results should be defined
              expect(faResult).toBeDefined();
              expect(psResult).toBeDefined();

              // If key missing in fa, should fall back to English parametric translation
              if (!translations.fa[key]) {
                const enResult = translate('en', key, params);
                expect(faResult).toBe(enResult);
              }

              // If key missing in ps, should fall back to English parametric translation
              if (!translations.ps[key]) {
                const enResult = translate('en', key, params);
                expect(psResult).toBe(enResult);
              }

              return true;
            }
          ),
          { numRuns: 50 } // Fewer runs due to more complex setup
        );
      }
    });

    it('should maintain fallback chain: requested language -> English -> key itself', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('fa', 'ps'),
          fc.string({ minLength: 5, maxLength: 50 }),
          (langCode, testKey) => {
            const result = translate(langCode, testKey);

            // The result should follow the fallback chain
            if (langCode === 'fa' && translations.fa[testKey]) {
              expect(result).toBe(translations.fa[testKey]);
            } else if (langCode === 'ps' && translations.ps[testKey]) {
              expect(result).toBe(translations.ps[testKey]);
            } else if (translations.en[testKey]) {
              expect(result).toBe(translations.en[testKey]);
            } else {
              expect(result).toBe(testKey);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
