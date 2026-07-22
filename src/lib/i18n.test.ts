import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { translations } from './i18n';

describe('Translation System - Property-Based Tests', () => {
  describe('Property 2: Translation Key Completeness Across Languages', () => {
    // Feature: complete-multilingual-translation, Property 2: Translation Key Completeness Across Languages
    // **Validates: Requirements 2.13, 6.1, 6.2, 6.3**

    it('should have all admin.nav.* keys present in en, fa, and ps with non-empty values', () => {
      // Get all admin.nav.* keys from the English translation
      const enKeys = Object.keys(translations.en).filter(key => key.startsWith('admin.nav.'));

      // Property: For every admin.nav.* key in 'en', it must exist in 'fa' and 'ps' with non-empty values
      fc.assert(
        fc.property(
          fc.constantFrom(...enKeys),
          (key) => {
            // Check that the key exists in fa
            expect(translations.fa).toHaveProperty(key);
            // Check that the key exists in ps
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

    it('should verify all expected admin navigation keys are present', () => {
      // Expected admin navigation keys based on requirements
      const expectedAdminNavKeys = [
        'admin.nav.dashboard',
        'admin.nav.services',
        'admin.nav.visas',
        'admin.nav.opportunities',
        'admin.nav.news',
        'admin.nav.testimonials',
        'admin.nav.partners',
        'admin.nav.counters',
        'admin.nav.faqs',
        'admin.nav.gallery',
        'admin.nav.payments',
        'admin.nav.socialLinks',
        'admin.nav.footerLinks',
        'admin.nav.departments',
        'admin.nav.branches',
        'admin.nav.processSteps',
        'admin.nav.pricing',
        'admin.nav.team',
        'admin.nav.comparison',
        'admin.nav.ctaBanners',
        'admin.nav.menuItems',
        'admin.nav.sections',
        'admin.nav.languages',
        'admin.nav.serviceCategories',
        'admin.nav.opportunityCategories',
        'admin.nav.newsCategories',
        'admin.nav.siteSettings',
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...expectedAdminNavKeys),
          (key) => {
            // Verify each expected key exists in all three languages
            expect(translations.en).toHaveProperty(key);
            expect(translations.fa).toHaveProperty(key);
            expect(translations.ps).toHaveProperty(key);

            // Verify all translations are non-empty strings
            expect(translations.en[key]).toBeTruthy();
            expect(translations.fa[key]).toBeTruthy();
            expect(translations.ps[key]).toBeTruthy();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should ensure no admin.nav.* key has placeholder or missing values', () => {
      const enKeys = Object.keys(translations.en).filter(key => key.startsWith('admin.nav.'));

      fc.assert(
        fc.property(
          fc.constantFrom(...enKeys),
          (key) => {
            const enValue = translations.en[key];
            const faValue = translations.fa[key];
            const psValue = translations.ps[key];

            // Ensure values are not placeholder patterns
            expect(enValue).not.toMatch(/^\{.*\}$/);
            expect(faValue).not.toMatch(/^\{.*\}$/);
            expect(psValue).not.toMatch(/^\{.*\}$/);

            // Ensure values are not TODOs or placeholders
            expect(enValue.toLowerCase()).not.toContain('todo');
            expect(enValue.toLowerCase()).not.toContain('placeholder');
            expect(enValue.toLowerCase()).not.toContain('fixme');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify symmetry: same number of admin.nav.* keys across all languages', () => {
      const enAdminNavKeys = Object.keys(translations.en).filter(key => key.startsWith('admin.nav.'));
      const faAdminNavKeys = Object.keys(translations.fa).filter(key => key.startsWith('admin.nav.'));
      const psAdminNavKeys = Object.keys(translations.ps).filter(key => key.startsWith('admin.nav.'));

      // All three languages should have the exact same number of admin.nav.* keys
      expect(faAdminNavKeys.length).toBe(enAdminNavKeys.length);
      expect(psAdminNavKeys.length).toBe(enAdminNavKeys.length);

      // Property: For every key in en's admin.nav.*, it exists in fa and ps
      fc.assert(
        fc.property(
          fc.constantFrom(...enAdminNavKeys),
          (key) => {
            expect(faAdminNavKeys).toContain(key);
            expect(psAdminNavKeys).toContain(key);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
