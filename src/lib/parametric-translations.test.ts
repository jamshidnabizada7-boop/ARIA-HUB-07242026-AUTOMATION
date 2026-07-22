/**
 * Parametric Translation Tests
 * Tests for task 11.2: Update components to use parametric translations
 * 
 * Validates Requirements: 11.4, 11.5
 */

import { describe, it, expect } from 'vitest';
import { translate } from './i18n';

describe('Parametric Translations - Task 11.2', () => {
  describe('admin.table.showing - Requirements 11.4, 11.5', () => {
    it('should replace {count} and {total} placeholders with provided values in English', () => {
      const result = translate('en', 'admin.table.showing', { count: 5, total: 20 });
      expect(result).toBe('Showing 5 of 20');
    });

    it('should replace {count} and {total} placeholders with provided values in Persian', () => {
      const result = translate('fa', 'admin.table.showing', { count: 5, total: 20 });
      expect(result).toBe('نمایش 5 از 20');
    });

    it('should replace {count} and {total} placeholders with provided values in Pashto', () => {
      const result = translate('ps', 'admin.table.showing', { count: 5, total: 20 });
      expect(result).toBe('د 20 څخه 5 ښودل');
    });

    it('should handle different numeric values correctly', () => {
      const result = translate('en', 'admin.table.showing', { count: 1, total: 100 });
      expect(result).toBe('Showing 1 of 100');
    });
  });

  describe('search.resultsCount - Requirements 11.4, 11.5', () => {
    it('should replace {count} placeholder in English', () => {
      const result = translate('en', 'search.resultsCount', { count: 42 });
      expect(result).toBe('42 results');
    });

    it('should replace {count} placeholder in Persian', () => {
      const result = translate('fa', 'search.resultsCount', { count: 42 });
      expect(result).toBe('42 نتیجه');
    });

    it('should replace {count} placeholder in Pashto', () => {
      const result = translate('ps', 'search.resultsCount', { count: 42 });
      expect(result).toBe('42 پایلې');
    });

    it('should handle zero results', () => {
      const result = translate('en', 'search.resultsCount', { count: 0 });
      expect(result).toBe('0 results');
    });
  });

  describe('admin.badge.new - Requirements 11.4, 11.5', () => {
    it('should replace {count} placeholder for new message badge in English', () => {
      const result = translate('en', 'admin.badge.new', { count: 3 });
      expect(result).toBe('3 new');
    });

    it('should replace {count} placeholder for new message badge in Persian', () => {
      const result = translate('fa', 'admin.badge.new', { count: 3 });
      expect(result).toBe('3 جدید');
    });

    it('should replace {count} placeholder for new message badge in Pashto', () => {
      const result = translate('ps', 'admin.badge.new', { count: 3 });
      expect(result).toBe('3 نوی');
    });
  });

  describe('faqs.noMatch - Requirements 11.4, 11.5', () => {
    it('should replace {query} placeholder in English', () => {
      const result = translate('en', 'faqs.noMatch', { query: 'visa' });
      expect(result).toBe('No questions match "visa".');
    });

    it('should replace {query} placeholder in Persian', () => {
      const result = translate('fa', 'faqs.noMatch', { query: 'ویزا' });
      expect(result).toBe('سوالی مطابق با «ویزا» یافت نشد.');
    });

    it('should replace {query} placeholder in Pashto', () => {
      const result = translate('ps', 'faqs.noMatch', { query: 'ویزه' });
      expect(result).toBe('د «ویزه» سره کومه پوښتنه ونه موندل شوه.');
    });
  });

  describe('process.step - Requirements 11.4, 11.5', () => {
    it('should replace {number} placeholder in English', () => {
      const result = translate('en', 'process.step', { number: 1 });
      expect(result).toBe('Step 1');
    });

    it('should replace {number} placeholder in Persian', () => {
      const result = translate('fa', 'process.step', { number: 2 });
      expect(result).toBe('مرحله 2');
    });

    it('should replace {number} placeholder in Pashto', () => {
      const result = translate('ps', 'process.step', { number: 3 });
      expect(result).toBe('ګام 3');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should leave placeholders intact when params are missing', () => {
      const result = translate('en', 'admin.table.showing');
      expect(result).toBe('Showing {count} of {total}');
    });

    it('should handle partial params correctly', () => {
      const result = translate('en', 'admin.table.showing', { count: 5 });
      expect(result).toBe('Showing 5 of {total}');
    });

    it('should work across all three languages consistently', () => {
      const params = { count: 10, total: 50 };
      
      const enResult = translate('en', 'admin.table.showing', params);
      const faResult = translate('fa', 'admin.table.showing', params);
      const psResult = translate('ps', 'admin.table.showing', params);
      
      expect(enResult).toContain('10');
      expect(enResult).toContain('50');
      expect(faResult).toContain('10');
      expect(faResult).toContain('50');
      expect(psResult).toContain('10');
      expect(psResult).toContain('50');
    });
  });
});
