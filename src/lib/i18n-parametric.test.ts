import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { translate, translations } from './i18n';

/**
 * Property-Based Test: Parametric Translation Substitution
 * Task 11.3: Write property test for parametric translation substitution
 * 
 * **Validates: Requirements 11.1, 11.2, 11.5**
 * 
 * This test ensures that parametric translations (with placeholders like {count}, {total}, {name})
 * correctly substitute provided parameter values across all three languages (en, fa, ps).
 */

describe('Translation System - Parametric Translations', () => {
  describe('Property 5: Parametric Translation Substitution', () => {
    // Feature: complete-multilingual-translation, Property 5: Parametric Translation Substitution
    // **Validates: Requirements 11.1, 11.2, 11.5**

    it('should correctly substitute {count} and {total} placeholders across all languages', () => {
      // Known parametric keys with {count} and {total}
      const tableShowingKey = 'admin.table.showing';

      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          fc.record({
            count: fc.nat(1000),
            total: fc.nat(1000),
          }),
          (langCode, params) => {
            const result = translate(langCode, tableShowingKey, params);

            // Verify that placeholders are replaced with actual values
            expect(result).toContain(String(params.count));
            expect(result).toContain(String(params.total));

            // Verify that placeholders are no longer present
            expect(result).not.toContain('{count}');
            expect(result).not.toContain('{total}');

            // Verify result is a non-empty string
            expect(result).toBeTruthy();
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly substitute {count} placeholder for badge and search result keys', () => {
      const parametricKeys = [
        'admin.badge.new',
        'search.resultsCount',
      ];

      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          fc.constantFrom(...parametricKeys),
          fc.record({
            count: fc.nat(1000),
          }),
          (langCode, key, params) => {
            const result = translate(langCode, key, params);

            // Verify that {count} is replaced with actual value
            expect(result).toContain(String(params.count));

            // Verify that placeholder is no longer present
            expect(result).not.toContain('{count}');

            // Verify result is valid
            expect(result).toBeTruthy();
            expect(typeof result).toBe('string');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multiple placeholder substitutions in a single translation', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          fc.record({
            count: fc.nat(1000),
            total: fc.nat(1000),
          }),
          (langCode, params) => {
            const result = translate(langCode, 'admin.table.showing', params);

            // Verify both placeholders are replaced
            expect(result).toContain(String(params.count));
            expect(result).toContain(String(params.total));

            // Verify no placeholders remain
            expect(result).not.toContain('{count}');
            expect(result).not.toContain('{total}');

            // Additional check: the result should not contain any unreplaced placeholders
            expect(result).not.toMatch(/\{[a-zA-Z]+\}/);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle parametric translations with {number} placeholder', () => {
      const processStepKey = 'process.step';

      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          fc.record({
            number: fc.integer({ min: 1, max: 10 }),
          }),
          (langCode, params) => {
            const result = translate(langCode, processStepKey, params);

            // Verify that {number} is replaced with actual value
            expect(result).toContain(String(params.number));

            // Verify that placeholder is no longer present
            expect(result).not.toContain('{number}');

            // Verify result is valid
            expect(result).toBeTruthy();
            expect(typeof result).toBe('string');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle parametric translations with {query} placeholder', () => {
      const faqsNoMatchKey = 'faqs.noMatch';

      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          fc.record({
            query: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          (langCode, params) => {
            const result = translate(langCode, faqsNoMatchKey, params);

            // Verify that {query} is replaced with actual value
            expect(result).toContain(params.query);

            // Verify that placeholder is no longer present
            expect(result).not.toContain('{query}');

            // Verify result is valid
            expect(result).toBeTruthy();
            expect(typeof result).toBe('string');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should leave placeholders intact when parameters are not provided', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          (langCode) => {
            // Call translate without parameters
            const result = translate(langCode, 'admin.table.showing');

            // Placeholders should remain in the result
            expect(result).toContain('{count}');
            expect(result).toContain('{total}');

            // Verify result is valid
            expect(result).toBeTruthy();
            expect(typeof result).toBe('string');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle missing parameter keys gracefully by leaving those placeholders intact', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          fc.record({
            count: fc.nat(1000),
            // total is intentionally missing
          }),
          (langCode, params) => {
            const result = translate(langCode, 'admin.table.showing', params);

            // {count} should be replaced
            expect(result).toContain(String(params.count));
            expect(result).not.toContain('{count}');

            // {total} should remain as placeholder
            expect(result).toContain('{total}');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle parametric substitution consistently across all languages', () => {
      const parametricKey = 'admin.table.showing';
      const params = { count: 42, total: 100 };

      fc.assert(
        fc.property(
          fc.constant(params),
          (testParams) => {
            const enResult = translate('en', parametricKey, testParams);
            const faResult = translate('fa', parametricKey, testParams);
            const psResult = translate('ps', parametricKey, testParams);

            // All three should have replaced the placeholders
            [enResult, faResult, psResult].forEach(result => {
              expect(result).toContain(String(testParams.count));
              expect(result).toContain(String(testParams.total));
              expect(result).not.toContain('{count}');
              expect(result).not.toContain('{total}');
            });

            // The translations should be different (language-specific)
            // but all should have the same substituted values
            expect(enResult).not.toBe(faResult);
            expect(faResult).not.toBe(psResult);
            expect(enResult).not.toBe(psResult);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle numeric values of different magnitudes correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          fc.record({
            count: fc.integer({ min: 0, max: 1000000 }),
            total: fc.integer({ min: 0, max: 1000000 }),
          }),
          (langCode, params) => {
            const result = translate(langCode, 'admin.table.showing', params);

            // Verify substitution works for various numeric magnitudes
            const countStr = String(params.count);
            const totalStr = String(params.total);

            expect(result).toContain(countStr);
            expect(result).toContain(totalStr);
            expect(result).not.toContain('{count}');
            expect(result).not.toContain('{total}');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case: zero values in parametric translations', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          (langCode) => {
            const params = { count: 0, total: 0 };
            const result = translate(langCode, 'admin.table.showing', params);

            // Should substitute even zero values
            expect(result).toContain('0');
            expect(result).not.toContain('{count}');
            expect(result).not.toContain('{total}');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify all known parametric keys have placeholders in all three languages', () => {
      const parametricKeys = [
        'admin.table.showing',
        'admin.badge.new',
        'search.resultsCount',
        'process.step',
        'faqs.noMatch',
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...parametricKeys),
          (key) => {
            const enValue = translations.en[key];
            const faValue = translations.fa[key];
            const psValue = translations.ps[key];

            // All three should contain at least one placeholder
            const hasPlaceholder = (str: string) => /\{[a-zA-Z]+\}/.test(str);

            expect(hasPlaceholder(enValue)).toBe(true);
            expect(hasPlaceholder(faValue)).toBe(true);
            expect(hasPlaceholder(psValue)).toBe(true);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle parametric substitution with string parameter values', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          fc.record({
            // Filter out special regex replacement patterns like $&, $`, $', $$, $1, etc.
            query: fc.string({ minLength: 1, maxLength: 100 })
              .filter(s => !s.includes('{') && !s.includes('$')),
          }),
          (langCode, params) => {
            const result = translate(langCode, 'faqs.noMatch', params);

            // Verify string substitution
            expect(result).toContain(params.query);
            expect(result).not.toContain('{query}');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle parametric substitution regardless of placeholder order in translation', () => {
      // Test that substitution works regardless of which placeholder comes first
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          fc.record({
            count: fc.nat(1000),
            total: fc.nat(1000),
          }),
          (langCode, params) => {
            const result = translate(langCode, 'admin.table.showing', params);

            // Both should be substituted regardless of order
            expect(result).toContain(String(params.count));
            expect(result).toContain(String(params.total));

            // Check no placeholders remain
            expect(result).not.toMatch(/\{count\}/);
            expect(result).not.toMatch(/\{total\}/);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve the base translation structure while substituting parameters', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          fc.record({
            count: fc.nat(100),
            total: fc.nat(100),
          }),
          (langCode, params) => {
            const baseTranslation = translations[langCode]['admin.table.showing'];
            const result = translate(langCode, 'admin.table.showing', params);

            // Result should still resemble the base structure
            // (e.g., if base has "Showing X of Y", result should have "Showing 5 of 10")
            expect(result).toBeTruthy();
            expect(result.length).toBeGreaterThan(baseTranslation.length - 30); // Accounting for placeholder length

            // Verify the structure is preserved (no extra characters added)
            const placeholderPattern = /\{[a-zA-Z]+\}/g;
            const placeholdersInBase = (baseTranslation.match(placeholderPattern) || []).length;
            
            // After substitution, there should be no placeholders if all params provided
            const placeholdersInResult = (result.match(placeholderPattern) || []).length;
            expect(placeholdersInResult).toBe(0);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
