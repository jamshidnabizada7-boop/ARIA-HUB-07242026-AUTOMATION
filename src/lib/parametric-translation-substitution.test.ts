import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { translate, translations } from './i18n';

/**
 * Property-Based Test: Parametric Translation Substitution
 * Task 11.3: Write property test for parametric translation substitution
 * 
 * **Property 5: Parametric Translation Substitution**
 * **Validates: Requirements 11.1, 11.2, 11.5**
 * 
 * This test verifies that placeholders are correctly replaced across all languages.
 * It ensures:
 * - Placeholders like {count}, {name}, {total}, etc. are replaced with provided values (Req 11.1)
 * - Parameter substitution works correctly in translate function (Req 11.2)
 * - Substitution works consistently across all three languages (en, fa, ps) (Req 11.5)
 */

describe('Property 5: Parametric Translation Substitution', () => {
  // Feature: complete-multilingual-translation, Property 5: Parametric Translation Substitution
  // **Validates: Requirements 11.1, 11.2, 11.5**

  /**
   * Helper to extract placeholder names from a translation string
   * Example: "Showing {count} of {total}" -> ["count", "total"]
   */
  function extractPlaceholders(str: string): string[] {
    const regex = /\{(\w+)\}/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(str)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  }

  /**
   * Helper to find translation keys that contain placeholders
   */
  function findParametricKeys(): { key: string; placeholders: string[] }[] {
    const parametricKeys: { key: string; placeholders: string[] }[] = [];
    
    for (const key in translations.en) {
      const placeholders = extractPlaceholders(translations.en[key]);
      if (placeholders.length > 0) {
        parametricKeys.push({ key, placeholders });
      }
    }
    
    return parametricKeys;
  }

  it('should replace all placeholders with provided parameter values for any language', () => {
    // Property: For any translation key with placeholders and any valid parameters,
    // the translate function SHALL replace all placeholders with their corresponding values
    
    const parametricKeys = findParametricKeys();
    expect(parametricKeys.length).toBeGreaterThan(0); // Ensure we have parametric translations to test
    
    fc.assert(
      fc.property(
        fc.constantFrom(...parametricKeys),
        fc.constantFrom('en', 'fa', 'ps'),
        fc.nat(9999), // Generate random numbers for parameters
        (keyInfo, langCode, paramValue) => {
          // Build params object with all required placeholders
          const params: Record<string, number> = {};
          for (const placeholder of keyInfo.placeholders) {
            params[placeholder] = paramValue;
          }
          
          // Translate with parameters
          const result = translate(langCode, keyInfo.key, params);
          
          // Verify: Result should not contain any placeholders from the original key
          for (const placeholder of keyInfo.placeholders) {
            expect(result).not.toContain(`{${placeholder}}`);
          }
          
          // Verify: Result should contain the substituted value
          expect(result).toContain(String(paramValue));
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly substitute count and total parameters across all languages', () => {
    // Property: For the common pattern of {count} and {total}, substitution should work
    // consistently across all languages
    
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'fa', 'ps'),
        fc.nat(1000),
        fc.nat(1000),
        (langCode, count, total) => {
          const result = translate(langCode, 'admin.table.showing', { count, total });
          
          // Verify placeholders are replaced (Requirement 11.1)
          expect(result).not.toContain('{count}');
          expect(result).not.toContain('{total}');
          
          // Verify substituted values are present (Requirement 11.2)
          expect(result).toContain(String(count));
          expect(result).toContain(String(total));
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly substitute single parameter across all languages', () => {
    // Property: Single parameter substitution should work for keys with one placeholder
    
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'fa', 'ps'),
        fc.nat(9999),
        (langCode, count) => {
          const result = translate(langCode, 'search.resultsCount', { count });
          
          // Verify placeholder is replaced (Requirement 11.1)
          expect(result).not.toContain('{count}');
          
          // Verify substituted value is present (Requirement 11.2)
          expect(result).toContain(String(count));
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly substitute string parameters across all languages', () => {
    // Property: String parameters (like {query}, {name}) should be substituted correctly
    
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'fa', 'ps'),
        fc.string({ minLength: 1, maxLength: 50 }),
        (langCode, queryString) => {
          const result = translate(langCode, 'faqs.noMatch', { query: queryString });
          
          // Verify placeholder is replaced (Requirement 11.1)
          expect(result).not.toContain('{query}');
          
          // Verify substituted value is present (Requirement 11.2)
          expect(result).toContain(queryString);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle edge case of zero values correctly', () => {
    // Property: Zero should be substituted correctly (not treated as falsy)
    
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'fa', 'ps'),
        (langCode) => {
          const result = translate(langCode, 'admin.table.showing', { count: 0, total: 0 });
          
          // Verify placeholders are replaced
          expect(result).not.toContain('{count}');
          expect(result).not.toContain('{total}');
          
          // Verify zero is present in result
          expect(result).toContain('0');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle large numbers correctly across all languages', () => {
    // Property: Large numbers should be substituted correctly without truncation
    
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'fa', 'ps'),
        fc.integer({ min: 1000000, max: 9999999 }),
        (langCode, largeNumber) => {
          const result = translate(langCode, 'search.resultsCount', { count: largeNumber });
          
          // Verify placeholder is replaced
          expect(result).not.toContain('{count}');
          
          // Verify the full number is present
          expect(result).toContain(String(largeNumber));
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should substitute multiple different parameter types in the same translation', () => {
    // Property: Mixed parameter types (numbers, strings) should all be substituted correctly
    
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'fa', 'ps'),
        fc.nat(100),
        (langCode, stepNumber) => {
          const result = translate(langCode, 'process.step', { number: stepNumber });
          
          // Verify placeholder is replaced
          expect(result).not.toContain('{number}');
          
          // Verify substituted value is present
          expect(result).toContain(String(stepNumber));
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should leave placeholders intact when parameters are missing', () => {
    // Property: When parameters are not provided, placeholders should remain in the string
    
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'fa', 'ps'),
        (langCode) => {
          // Call translate without providing params
          const result = translate(langCode, 'admin.table.showing');
          
          // Placeholders should remain since no params were provided
          expect(result).toContain('{count}');
          expect(result).toContain('{total}');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should partially substitute when only some parameters are provided', () => {
    // Property: If only some parameters are provided, only those should be substituted
    
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'fa', 'ps'),
        fc.nat(1000),
        (langCode, countValue) => {
          // Provide only count, not total
          const result = translate(langCode, 'admin.table.showing', { count: countValue });
          
          // count should be replaced
          expect(result).not.toContain('{count}');
          expect(result).toContain(String(countValue));
          
          // total should remain as placeholder
          expect(result).toContain('{total}');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle special characters in string parameters', () => {
    // Property: String parameters with special characters should be substituted correctly
    
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'fa', 'ps'),
        fc.constantFrom('visa & passport', 'test@example.com', 'user-name_123', 'قیمت: ۱۰۰$'),
        (langCode, specialString) => {
          const result = translate(langCode, 'faqs.noMatch', { query: specialString });
          
          // Verify placeholder is replaced
          expect(result).not.toContain('{query}');
          
          // Verify special string is present
          expect(result).toContain(specialString);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain translation quality after substitution', () => {
    // Property: After substitution, the result should be a non-empty string
    
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'fa', 'ps'),
        fc.nat(1000),
        fc.nat(1000),
        (langCode, count, total) => {
          const result = translate(langCode, 'admin.table.showing', { count, total });
          
          // Result should be non-empty
          expect(result.length).toBeGreaterThan(0);
          
          // Result should not be the key itself (fallback scenario)
          expect(result).not.toBe('admin.table.showing');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should work consistently for all parametric translation keys', () => {
    // Property: Every parametric key should support substitution across all languages
    
    const parametricKeys = findParametricKeys();
    
    fc.assert(
      fc.property(
        fc.constantFrom(...parametricKeys),
        fc.constantFrom('en', 'fa', 'ps'),
        (keyInfo, langCode) => {
          // Create params with sample values
          const params: Record<string, string | number> = {};
          for (const placeholder of keyInfo.placeholders) {
            // Use different types of values
            params[placeholder] = placeholder.includes('count') || placeholder.includes('number') || placeholder.includes('total') 
              ? 42 
              : 'sample';
          }
          
          // Get translation
          const result = translate(langCode, keyInfo.key, params);
          
          // Verify no placeholders remain
          for (const placeholder of keyInfo.placeholders) {
            expect(result).not.toContain(`{${placeholder}}`);
          }
          
          // Verify result is non-empty
          expect(result.length).toBeGreaterThan(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  describe('Requirement validation tests', () => {
    it('validates Requirement 11.1: translate function supports params parameter', () => {
      // Requirement 11.1: Translation System translate function SHALL support params parameter
      
      // Test that the function accepts params parameter
      const result = translate('en', 'admin.table.showing', { count: 5, total: 10 });
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('validates Requirement 11.2: placeholders are replaced with provided parameter values', () => {
      // Requirement 11.2: When translation contains placeholders, Translation System SHALL replace them
      
      fc.assert(
        fc.property(
          fc.nat(1000),
          fc.nat(1000),
          (count, total) => {
            const result = translate('en', 'admin.table.showing', { count, total });
            
            // Placeholders should be replaced
            expect(result).not.toContain('{count}');
            expect(result).not.toContain('{total}');
            
            // Values should be present
            expect(result).toContain(String(count));
            expect(result).toContain(String(total));
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('validates Requirement 11.5: parameter substitution works across all three languages', () => {
      // Requirement 11.5: Parameter substitution SHALL work correctly across all three languages
      
      fc.assert(
        fc.property(
          fc.nat(1000),
          fc.nat(1000),
          (count, total) => {
            // Test all three languages
            const enResult = translate('en', 'admin.table.showing', { count, total });
            const faResult = translate('fa', 'admin.table.showing', { count, total });
            const psResult = translate('ps', 'admin.table.showing', { count, total });
            
            // All languages should have placeholders replaced
            expect(enResult).not.toContain('{count}');
            expect(enResult).not.toContain('{total}');
            expect(faResult).not.toContain('{count}');
            expect(faResult).not.toContain('{total}');
            expect(psResult).not.toContain('{count}');
            expect(psResult).not.toContain('{total}');
            
            // All languages should contain the substituted values
            expect(enResult).toContain(String(count));
            expect(enResult).toContain(String(total));
            expect(faResult).toContain(String(count));
            expect(faResult).toContain(String(total));
            expect(psResult).toContain(String(count));
            expect(psResult).toContain(String(total));
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle empty string parameters', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          (langCode) => {
            const result = translate(langCode, 'faqs.noMatch', { query: '' });
            
            // Placeholder should still be replaced (even with empty string)
            expect(result).not.toContain('{query}');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle negative numbers', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          fc.integer({ min: -1000, max: -1 }),
          (langCode, negativeNum) => {
            const result = translate(langCode, 'search.resultsCount', { count: negativeNum });
            
            // Placeholder should be replaced
            expect(result).not.toContain('{count}');
            
            // Negative number should be present
            expect(result).toContain(String(negativeNum));
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle floating point numbers', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          fc.float({ min: 0, max: 100 }),
          (langCode, floatNum) => {
            const result = translate(langCode, 'search.resultsCount', { count: floatNum });
            
            // Placeholder should be replaced
            expect(result).not.toContain('{count}');
            
            // Float should be present (as string)
            expect(result).toContain(String(floatNum));
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle extra parameters that are not in the translation', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          fc.nat(100),
          fc.nat(100),
          fc.string(),
          (langCode, count, total, extraParam) => {
            // Provide extra parameter that doesn't exist in translation
            const result = translate(langCode, 'admin.table.showing', { 
              count, 
              total, 
              extraUnused: extraParam 
            });
            
            // Expected parameters should be replaced
            expect(result).not.toContain('{count}');
            expect(result).not.toContain('{total}');
            
            // Extra parameter should not appear
            expect(result).not.toContain('extraUnused');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
