/**
 * Unit Tests for Parametric Translations
 * Task 11.4: Write unit tests for parametric translations
 * 
 * **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6**
 * 
 * These unit tests verify that:
 * - Parametric translations work correctly with valid parameters
 * - Parametric translations handle missing parameters gracefully
 * - Parametric translations function consistently across all three languages (en, fa, ps)
 */

import { describe, it, expect } from 'vitest';
import { translate } from './i18n';

describe('Unit Tests: Parametric Translations - Task 11.4', () => {
  describe('Valid Parameters - Requirements 11.1, 11.4, 11.5', () => {
    describe('English translations with valid parameters', () => {
      it('should replace single parameter {count} in search.resultsCount', () => {
        const result = translate('en', 'search.resultsCount', { count: 15 });
        expect(result).toBe('15 results');
        expect(result).not.toContain('{count}');
      });

      it('should replace single parameter {query} in faqs.noMatch', () => {
        const result = translate('en', 'faqs.noMatch', { query: 'passport' });
        expect(result).toBe('No questions match "passport".');
        expect(result).not.toContain('{query}');
      });

      it('should replace single parameter {number} in process.step', () => {
        const result = translate('en', 'process.step', { number: 1 });
        expect(result).toBe('Step 1');
        expect(result).not.toContain('{number}');
      });

      it('should replace single parameter {count} in admin.badge.new', () => {
        const result = translate('en', 'admin.badge.new', { count: 5 });
        expect(result).toBe('5 new');
        expect(result).not.toContain('{count}');
      });

      it('should replace multiple parameters {count} and {total} in admin.table.showing', () => {
        const result = translate('en', 'admin.table.showing', { count: 10, total: 50 });
        expect(result).toBe('Showing 10 of 50');
        expect(result).not.toContain('{count}');
        expect(result).not.toContain('{total}');
      });
    });

    describe('Persian translations with valid parameters', () => {
      it('should replace single parameter {count} in search.resultsCount', () => {
        const result = translate('fa', 'search.resultsCount', { count: 25 });
        expect(result).toBe('25 نتیجه');
        expect(result).not.toContain('{count}');
      });

      it('should replace single parameter {query} in faqs.noMatch', () => {
        const result = translate('fa', 'faqs.noMatch', { query: 'ویزا' });
        expect(result).toBe('سوالی مطابق با «ویزا» یافت نشد.');
        expect(result).not.toContain('{query}');
      });

      it('should replace single parameter {number} in process.step', () => {
        const result = translate('fa', 'process.step', { number: 2 });
        expect(result).toBe('مرحله 2');
        expect(result).not.toContain('{number}');
      });

      it('should replace single parameter {count} in admin.badge.new', () => {
        const result = translate('fa', 'admin.badge.new', { count: 3 });
        expect(result).toBe('3 جدید');
        expect(result).not.toContain('{count}');
      });

      it('should replace multiple parameters {count} and {total} in admin.table.showing', () => {
        const result = translate('fa', 'admin.table.showing', { count: 8, total: 40 });
        expect(result).toBe('نمایش 8 از 40');
        expect(result).not.toContain('{count}');
        expect(result).not.toContain('{total}');
      });
    });

    describe('Pashto translations with valid parameters', () => {
      it('should replace single parameter {count} in search.resultsCount', () => {
        const result = translate('ps', 'search.resultsCount', { count: 12 });
        expect(result).toBe('12 پایلې');
        expect(result).not.toContain('{count}');
      });

      it('should replace single parameter {query} in faqs.noMatch', () => {
        const result = translate('ps', 'faqs.noMatch', { query: 'ویزه' });
        expect(result).toBe('د «ویزه» سره کومه پوښتنه ونه موندل شوه.');
        expect(result).not.toContain('{query}');
      });

      it('should replace single parameter {number} in process.step', () => {
        const result = translate('ps', 'process.step', { number: 3 });
        expect(result).toBe('ګام 3');
        expect(result).not.toContain('{number}');
      });

      it('should replace single parameter {count} in admin.badge.new', () => {
        const result = translate('ps', 'admin.badge.new', { count: 7 });
        expect(result).toBe('7 نوی');
        expect(result).not.toContain('{count}');
      });

      it('should replace multiple parameters {count} and {total} in admin.table.showing', () => {
        const result = translate('ps', 'admin.table.showing', { count: 15, total: 60 });
        expect(result).toBe('د 60 څخه 15 ښودل');
        expect(result).not.toContain('{count}');
        expect(result).not.toContain('{total}');
      });
    });

    describe('Numeric edge cases with valid parameters', () => {
      it('should handle zero values', () => {
        expect(translate('en', 'search.resultsCount', { count: 0 })).toBe('0 results');
        expect(translate('fa', 'search.resultsCount', { count: 0 })).toBe('0 نتیجه');
        expect(translate('ps', 'search.resultsCount', { count: 0 })).toBe('0 پایلې');
      });

      it('should handle large numbers', () => {
        expect(translate('en', 'search.resultsCount', { count: 9999 })).toBe('9999 results');
        expect(translate('fa', 'search.resultsCount', { count: 9999 })).toBe('9999 نتیجه');
        expect(translate('ps', 'search.resultsCount', { count: 9999 })).toBe('9999 پایلې');
      });

      it('should handle decimal numbers', () => {
        expect(translate('en', 'search.resultsCount', { count: 3.14 })).toBe('3.14 results');
        expect(translate('fa', 'search.resultsCount', { count: 3.14 })).toBe('3.14 نتیجه');
        expect(translate('ps', 'search.resultsCount', { count: 3.14 })).toBe('3.14 پایلې');
      });
    });

    describe('String edge cases with valid parameters', () => {
      it('should handle empty strings', () => {
        expect(translate('en', 'faqs.noMatch', { query: '' })).toBe('No questions match "".');
        expect(translate('fa', 'faqs.noMatch', { query: '' })).toBe('سوالی مطابق با «» یافت نشد.');
        expect(translate('ps', 'faqs.noMatch', { query: '' })).toBe('د «» سره کومه پوښتنه ونه موندل شوه.');
      });

      it('should handle strings with special characters', () => {
        const specialQuery = 'test & example';
        const result = translate('en', 'faqs.noMatch', { query: specialQuery });
        expect(result).toContain(specialQuery);
        expect(result).not.toContain('{query}');
      });

      it('should handle strings with Unicode characters in Persian', () => {
        const persianQuery = 'تست‌های ویژه';
        const result = translate('fa', 'faqs.noMatch', { query: persianQuery });
        expect(result).toContain(persianQuery);
        expect(result).not.toContain('{query}');
      });

      it('should handle strings with Unicode characters in Pashto', () => {
        const pashtoQuery = 'ځانګړي ازموینه';
        const result = translate('ps', 'faqs.noMatch', { query: pashtoQuery });
        expect(result).toContain(pashtoQuery);
        expect(result).not.toContain('{query}');
      });
    });
  });

  describe('Missing Parameters - Requirements 11.2, 11.3, 11.4', () => {
    describe('No parameters provided', () => {
      it('should leave placeholders intact in English when no params provided', () => {
        expect(translate('en', 'search.resultsCount')).toBe('{count} results');
        expect(translate('en', 'faqs.noMatch')).toBe('No questions match "{query}".');
        expect(translate('en', 'process.step')).toBe('Step {number}');
        expect(translate('en', 'admin.badge.new')).toBe('{count} new');
        expect(translate('en', 'admin.table.showing')).toBe('Showing {count} of {total}');
      });

      it('should leave placeholders intact in Persian when no params provided', () => {
        expect(translate('fa', 'search.resultsCount')).toBe('{count} نتیجه');
        expect(translate('fa', 'faqs.noMatch')).toBe('سوالی مطابق با «{query}» یافت نشد.');
        expect(translate('fa', 'process.step')).toBe('مرحله {number}');
        expect(translate('fa', 'admin.badge.new')).toBe('{count} جدید');
        expect(translate('fa', 'admin.table.showing')).toBe('نمایش {count} از {total}');
      });

      it('should leave placeholders intact in Pashto when no params provided', () => {
        expect(translate('ps', 'search.resultsCount')).toBe('{count} پایلې');
        expect(translate('ps', 'faqs.noMatch')).toBe('د «{query}» سره کومه پوښتنه ونه موندل شوه.');
        expect(translate('ps', 'process.step')).toBe('ګام {number}');
        expect(translate('ps', 'admin.badge.new')).toBe('{count} نوی');
        expect(translate('ps', 'admin.table.showing')).toBe('د {total} څخه {count} ښودل');
      });
    });

    describe('Empty params object provided', () => {
      it('should leave placeholders intact when empty object provided in English', () => {
        expect(translate('en', 'search.resultsCount', {})).toBe('{count} results');
        expect(translate('en', 'faqs.noMatch', {})).toBe('No questions match "{query}".');
        expect(translate('en', 'admin.table.showing', {})).toBe('Showing {count} of {total}');
      });

      it('should leave placeholders intact when empty object provided in Persian', () => {
        expect(translate('fa', 'search.resultsCount', {})).toBe('{count} نتیجه');
        expect(translate('fa', 'faqs.noMatch', {})).toBe('سوالی مطابق با «{query}» یافت نشد.');
        expect(translate('fa', 'admin.table.showing', {})).toBe('نمایش {count} از {total}');
      });

      it('should leave placeholders intact when empty object provided in Pashto', () => {
        expect(translate('ps', 'search.resultsCount', {})).toBe('{count} پایلې');
        expect(translate('ps', 'faqs.noMatch', {})).toBe('د «{query}» سره کومه پوښتنه ونه موندل شوه.');
        expect(translate('ps', 'admin.table.showing', {})).toBe('د {total} څخه {count} ښودل');
      });
    });

    describe('Partial parameters provided', () => {
      it('should replace provided params and leave missing ones intact in English', () => {
        const result = translate('en', 'admin.table.showing', { count: 5 });
        expect(result).toBe('Showing 5 of {total}');
        expect(result).toContain('5');
        expect(result).not.toContain('{count}');
        expect(result).toContain('{total}');
      });

      it('should replace provided params and leave missing ones intact in Persian', () => {
        const result = translate('fa', 'admin.table.showing', { total: 100 });
        expect(result).toBe('نمایش {count} از 100');
        expect(result).toContain('100');
        expect(result).toContain('{count}');
        expect(result).not.toContain('{total}');
      });

      it('should replace provided params and leave missing ones intact in Pashto', () => {
        const result = translate('ps', 'admin.table.showing', { count: 7 });
        expect(result).toBe('د {total} څخه 7 ښودل');
        expect(result).toContain('7');
        expect(result).not.toContain('{count}');
        expect(result).toContain('{total}');
      });
    });

    describe('Wrong parameter names', () => {
      it('should leave placeholders intact when wrong param names provided', () => {
        // Providing 'wrongParam' instead of 'count'
        expect(translate('en', 'search.resultsCount', { wrongParam: 10 } as any))
          .toBe('{count} results');
        
        expect(translate('fa', 'search.resultsCount', { wrongParam: 10 } as any))
          .toBe('{count} نتیجه');
        
        expect(translate('ps', 'search.resultsCount', { wrongParam: 10 } as any))
          .toBe('{count} پایلې');
      });

      it('should be case-sensitive for parameter names', () => {
        // Providing 'Count' instead of 'count'
        expect(translate('en', 'search.resultsCount', { Count: 10 } as any))
          .toBe('{count} results');
        
        expect(translate('fa', 'search.resultsCount', { Count: 10 } as any))
          .toBe('{count} نتیجه');
        
        expect(translate('ps', 'search.resultsCount', { Count: 10 } as any))
          .toBe('{count} پایلې');
      });
    });

    describe('Undefined and null values', () => {
      it('should convert undefined to string "undefined"', () => {
        expect(translate('en', 'search.resultsCount', { count: undefined as any }))
          .toBe('undefined results');
        expect(translate('fa', 'search.resultsCount', { count: undefined as any }))
          .toBe('undefined نتیجه');
        expect(translate('ps', 'search.resultsCount', { count: undefined as any }))
          .toBe('undefined پایلې');
      });

      it('should convert null to string "null"', () => {
        expect(translate('en', 'search.resultsCount', { count: null as any }))
          .toBe('null results');
        expect(translate('fa', 'search.resultsCount', { count: null as any }))
          .toBe('null نتیجه');
        expect(translate('ps', 'search.resultsCount', { count: null as any }))
          .toBe('null پایلې');
      });
    });
  });

  describe('Cross-Language Consistency - Requirements 11.5, 11.6', () => {
    it('should handle same key with same params consistently across all languages', () => {
      const key = 'search.resultsCount';
      const params = { count: 42 };

      const enResult = translate('en', key, params);
      const faResult = translate('fa', key, params);
      const psResult = translate('ps', key, params);

      // All should contain the value
      expect(enResult).toContain('42');
      expect(faResult).toContain('42');
      expect(psResult).toContain('42');

      // None should contain placeholders
      expect(enResult).not.toContain('{count}');
      expect(faResult).not.toContain('{count}');
      expect(psResult).not.toContain('{count}');

      // Should match expected translations
      expect(enResult).toBe('42 results');
      expect(faResult).toBe('42 نتیجه');
      expect(psResult).toBe('42 پایلې');
    });

    it('should handle multi-parameter key consistently across all languages', () => {
      const key = 'admin.table.showing';
      const params = { count: 10, total: 50 };

      const enResult = translate('en', key, params);
      const faResult = translate('fa', key, params);
      const psResult = translate('ps', key, params);

      // All should contain both values
      expect(enResult).toContain('10');
      expect(enResult).toContain('50');
      expect(faResult).toContain('10');
      expect(faResult).toContain('50');
      expect(psResult).toContain('10');
      expect(psResult).toContain('50');

      // None should contain placeholders
      expect(enResult).not.toContain('{count}');
      expect(enResult).not.toContain('{total}');
      expect(faResult).not.toContain('{count}');
      expect(faResult).not.toContain('{total}');
      expect(psResult).not.toContain('{count}');
      expect(psResult).not.toContain('{total}');

      // Should match expected translations
      expect(enResult).toBe('Showing 10 of 50');
      expect(faResult).toBe('نمایش 10 از 50');
      expect(psResult).toBe('د 50 څخه 10 ښودل');
    });

    it('should handle missing params consistently across all languages', () => {
      const key = 'admin.table.showing';
      const params = { count: 5 }; // missing 'total'

      const enResult = translate('en', key, params);
      const faResult = translate('fa', key, params);
      const psResult = translate('ps', key, params);

      // All should contain the provided value
      expect(enResult).toContain('5');
      expect(faResult).toContain('5');
      expect(psResult).toContain('5');

      // All should still have the missing placeholder
      expect(enResult).toContain('{total}');
      expect(faResult).toContain('{total}');
      expect(psResult).toContain('{total}');

      // Should match expected patterns
      expect(enResult).toBe('Showing 5 of {total}');
      expect(faResult).toBe('نمایش 5 از {total}');
      expect(psResult).toBe('د {total} څخه 5 ښودل');
    });
  });

  describe('Real-world Usage Scenarios - Requirements 11.4, 11.5, 11.6', () => {
    it('should work for admin table pagination display', () => {
      const filtered = 15;
      const total = 150;
      
      const enResult = translate('en', 'admin.table.showing', { count: filtered, total });
      const faResult = translate('fa', 'admin.table.showing', { count: filtered, total });
      const psResult = translate('ps', 'admin.table.showing', { count: filtered, total });

      expect(enResult).toBe('Showing 15 of 150');
      expect(faResult).toBe('نمایش 15 از 150');
      expect(psResult).toBe('د 150 څخه 15 ښودل');
    });

    it('should work for search results count display', () => {
      const count = 23;
      
      const enResult = translate('en', 'search.resultsCount', { count });
      const faResult = translate('fa', 'search.resultsCount', { count });
      const psResult = translate('ps', 'search.resultsCount', { count });

      expect(enResult).toBe('23 results');
      expect(faResult).toBe('23 نتیجه');
      expect(psResult).toBe('23 پایلې');
    });

    it('should work for FAQ search no-match messages', () => {
      const query = 'visa requirements';
      
      const enResult = translate('en', 'faqs.noMatch', { query });
      const faResult = translate('fa', 'faqs.noMatch', { query: 'الزامات ویزا' });
      const psResult = translate('ps', 'faqs.noMatch', { query: 'د ویزې اړتیاوې' });

      expect(enResult).toBe('No questions match "visa requirements".');
      expect(faResult).toBe('سوالی مطابق با «الزامات ویزا» یافت نشد.');
      expect(psResult).toBe('د «د ویزې اړتیاوې» سره کومه پوښتنه ونه موندل شوه.');
    });

    it('should work for process step labels', () => {
      const steps = [1, 2, 3, 4, 5];
      
      steps.forEach(step => {
        const enResult = translate('en', 'process.step', { number: step });
        const faResult = translate('fa', 'process.step', { number: step });
        const psResult = translate('ps', 'process.step', { number: step });

        expect(enResult).toBe(`Step ${step}`);
        expect(faResult).toBe(`مرحله ${step}`);
        expect(psResult).toBe(`ګام ${step}`);
      });
    });

    it('should work for badge new count display', () => {
      const newCount = 3;
      
      const enResult = translate('en', 'admin.badge.new', { count: newCount });
      const faResult = translate('fa', 'admin.badge.new', { count: newCount });
      const psResult = translate('ps', 'admin.badge.new', { count: newCount });

      expect(enResult).toBe('3 new');
      expect(faResult).toBe('3 جدید');
      expect(psResult).toBe('3 نوی');
    });

    it('should handle dynamic updates to parameters', () => {
      const key = 'search.resultsCount';
      
      // Simulate dynamic count updates
      const counts = [0, 5, 10, 25, 100];
      
      counts.forEach(count => {
        const result = translate('en', key, { count });
        expect(result).toBe(`${count} results`);
        expect(result).not.toContain('{count}');
      });
    });
  });

  describe('Non-parametric translations with params - Requirements 11.4', () => {
    it('should ignore params for translations without placeholders', () => {
      // These keys don't have placeholders, params should be ignored
      expect(translate('en', 'admin.nav.dashboard', { count: 5 }))
        .toBe('Dashboard');
      
      expect(translate('fa', 'admin.button.save', { total: 100 }))
        .toBe('ذخیره تغییرات');
      
      expect(translate('ps', 'common.close', { name: 'test' }))
        .toBe('بندول');
    });
  });
});
