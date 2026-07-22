import { describe, it, expect, beforeAll } from 'vitest';
import { db } from './db';

/**
 * Unit tests for database language configuration
 * 
 * These tests verify that the database seed data correctly configures:
 * - Persian (fa) as the default language
 * - Correct text direction values for all languages
 * 
 * **Validates: Requirements 1.1, 1.2**
 */

describe('Database Language Configuration', () => {
  describe('Persian Default Language', () => {
    it('should have Persian (fa) marked as the default language', async () => {
      // Query for the default language
      const defaultLanguage = await db.language.findFirst({
        where: { isDefault: true }
      });

      // Verify Persian is the default
      expect(defaultLanguage).toBeDefined();
      expect(defaultLanguage?.code).toBe('fa');
      expect(defaultLanguage?.isDefault).toBe(true);
    });

    it('should have only one language marked as default', async () => {
      // Query for all languages marked as default
      const defaultLanguages = await db.language.findMany({
        where: { isDefault: true }
      });

      // Verify only one default exists
      expect(defaultLanguages).toHaveLength(1);
      expect(defaultLanguages[0].code).toBe('fa');
    });

    it('should have English (en) not marked as default', async () => {
      const englishLanguage = await db.language.findFirst({
        where: { code: 'en' }
      });

      expect(englishLanguage).toBeDefined();
      expect(englishLanguage?.isDefault).toBe(false);
    });

    it('should have Pashto (ps) not marked as default', async () => {
      const pashtoLanguage = await db.language.findFirst({
        where: { code: 'ps' }
      });

      expect(pashtoLanguage).toBeDefined();
      expect(pashtoLanguage?.isDefault).toBe(false);
    });
  });

  describe('Language Direction Configuration', () => {
    it('should have Persian (fa) with RTL direction', async () => {
      const persianLanguage = await db.language.findFirst({
        where: { code: 'fa' }
      });

      expect(persianLanguage).toBeDefined();
      expect(persianLanguage?.direction).toBe('rtl');
    });

    it('should have English (en) with LTR direction', async () => {
      const englishLanguage = await db.language.findFirst({
        where: { code: 'en' }
      });

      expect(englishLanguage).toBeDefined();
      expect(englishLanguage?.direction).toBe('ltr');
    });

    it('should have Pashto (ps) with RTL direction', async () => {
      const pashtoLanguage = await db.language.findFirst({
        where: { code: 'ps' }
      });

      expect(pashtoLanguage).toBeDefined();
      expect(pashtoLanguage?.direction).toBe('rtl');
    });

    it('should have all three supported languages with correct directions', async () => {
      const languages = await db.language.findMany({
        where: {
          code: { in: ['en', 'fa', 'ps'] }
        },
        orderBy: { code: 'asc' }
      });

      expect(languages).toHaveLength(3);

      // Verify English
      const english = languages.find(l => l.code === 'en');
      expect(english).toBeDefined();
      expect(english?.direction).toBe('ltr');

      // Verify Persian
      const persian = languages.find(l => l.code === 'fa');
      expect(persian).toBeDefined();
      expect(persian?.direction).toBe('rtl');

      // Verify Pashto
      const pashto = languages.find(l => l.code === 'ps');
      expect(pashto).toBeDefined();
      expect(pashto?.direction).toBe('rtl');
    });
  });

  describe('Language Records Completeness', () => {
    it('should have all required language fields populated', async () => {
      const languages = await db.language.findMany({
        where: {
          code: { in: ['en', 'fa', 'ps'] }
        }
      });

      expect(languages).toHaveLength(3);

      // Verify each language has required fields
      languages.forEach(lang => {
        expect(lang.code).toBeDefined();
        expect(lang.name).toBeDefined();
        expect(lang.nativeName).toBeDefined();
        expect(lang.direction).toBeDefined();
        expect(lang.direction).toMatch(/^(ltr|rtl)$/);
        expect(typeof lang.enabled).toBe('boolean');
        expect(typeof lang.isDefault).toBe('boolean');
        expect(typeof lang.order).toBe('number');
      });
    });

    it('should have Persian with correct metadata', async () => {
      const persian = await db.language.findFirst({
        where: { code: 'fa' }
      });

      expect(persian).toBeDefined();
      expect(persian?.name).toBe('Dari');
      expect(persian?.nativeName).toBe('دری');
      expect(persian?.direction).toBe('rtl');
      expect(persian?.enabled).toBe(true);
      expect(persian?.isDefault).toBe(true);
    });

    it('should have English with correct metadata', async () => {
      const english = await db.language.findFirst({
        where: { code: 'en' }
      });

      expect(english).toBeDefined();
      expect(english?.name).toBe('English');
      expect(english?.nativeName).toBe('English');
      expect(english?.direction).toBe('ltr');
      expect(english?.enabled).toBe(true);
      expect(english?.isDefault).toBe(false);
    });

    it('should have Pashto with correct metadata', async () => {
      const pashto = await db.language.findFirst({
        where: { code: 'ps' }
      });

      expect(pashto).toBeDefined();
      expect(pashto?.name).toBe('Pashto');
      expect(pashto?.nativeName).toBe('پښتو');
      expect(pashto?.direction).toBe('rtl');
      expect(pashto?.enabled).toBe(true);
      expect(pashto?.isDefault).toBe(false);
    });
  });

  describe('Language Ordering', () => {
    it('should have Persian (default) with the lowest order', async () => {
      const persian = await db.language.findFirst({
        where: { code: 'fa' }
      });

      const allLanguages = await db.language.findMany();

      expect(persian).toBeDefined();
      
      // Persian should have order 0 or be the minimum order
      const minOrder = Math.min(...allLanguages.map(l => l.order));
      expect(persian?.order).toBe(minOrder);
    });

    it('should have languages ordered by their order field', async () => {
      const languages = await db.language.findMany({
        where: {
          code: { in: ['en', 'fa', 'ps'] }
        },
        orderBy: { order: 'asc' }
      });

      expect(languages).toHaveLength(3);
      
      // Verify Persian comes first (order 0)
      expect(languages[0].code).toBe('fa');
      expect(languages[0].order).toBe(0);
    });
  });
});
