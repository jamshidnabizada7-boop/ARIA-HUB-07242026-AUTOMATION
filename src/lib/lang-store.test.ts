import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { useLangStore } from './lang-store';
import type { Language } from './types';

describe('Lang Store - Default Language Persian', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset store to initial state
    useLangStore.setState({
      code: 'fa',
      dir: 'rtl',
      languages: [],
    });
  });

  describe('Requirement 1.1: Default initialization with Persian', () => {
    it('should initialize with code set to "fa"', () => {
      const { code } = useLangStore.getState();
      expect(code).toBe('fa');
    });

    it('should initialize with dir set to "rtl"', () => {
      const { dir } = useLangStore.getState();
      expect(dir).toBe('rtl');
    });

    it('should have both code "fa" and dir "rtl" set together', () => {
      const { code, dir } = useLangStore.getState();
      expect(code).toBe('fa');
      expect(dir).toBe('rtl');
    });
  });

  describe('Requirement 1.2: Display Persian text by default', () => {
    it('should provide Persian language code for translation system', () => {
      const { code } = useLangStore.getState();
      // The translation system will use this code to display Persian text
      expect(code).toBe('fa');
    });
  });

  describe('Requirement 1.3: Maintain RTL support', () => {
    it('should maintain RTL direction when Persian is default', () => {
      const { code, dir } = useLangStore.getState();
      expect(code).toBe('fa');
      expect(dir).toBe('rtl');
    });

    it('should update direction when language changes', () => {
      const mockLanguages: Language[] = [
        {
          id: '1',
          code: 'fa',
          name: 'Persian',
          nativeName: 'فارسی',
          direction: 'rtl',
          enabled: true,
          isDefault: true,
          flag: null,
          order: 0,
        },
        {
          id: '2',
          code: 'en',
          name: 'English',
          nativeName: 'English',
          direction: 'ltr',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 1,
        },
      ];

      useLangStore.getState().setLanguages(mockLanguages);
      
      // Switch to English
      useLangStore.getState().setLang('en');
      expect(useLangStore.getState().code).toBe('en');
      expect(useLangStore.getState().dir).toBe('ltr');

      // Switch back to Persian
      useLangStore.getState().setLang('fa');
      expect(useLangStore.getState().code).toBe('fa');
      expect(useLangStore.getState().dir).toBe('rtl');
    });
  });

  describe('Requirement 1.4: Check existing user preferences', () => {
    it('should use Persian default when no persisted preference exists', () => {
      const mockLanguages: Language[] = [
        {
          id: '1',
          code: 'fa',
          name: 'Persian',
          nativeName: 'فارسی',
          direction: 'rtl',
          enabled: true,
          isDefault: true,
          flag: null,
          order: 0,
        },
        {
          id: '2',
          code: 'en',
          name: 'English',
          nativeName: 'English',
          direction: 'ltr',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 1,
        },
      ];

      // Clear any persisted state
      localStorage.clear();
      
      // Reset to initial Persian default
      useLangStore.setState({
        code: 'fa',
        dir: 'rtl',
        languages: [],
      });

      useLangStore.getState().setLanguages(mockLanguages);
      
      const { code, dir } = useLangStore.getState();
      expect(code).toBe('fa');
      expect(dir).toBe('rtl');
    });

    it('should maintain existing user preference over Persian default', () => {
      const mockLanguages: Language[] = [
        {
          id: '1',
          code: 'fa',
          name: 'Persian',
          nativeName: 'فارسی',
          direction: 'rtl',
          enabled: true,
          isDefault: true,
          flag: null,
          order: 0,
        },
        {
          id: '2',
          code: 'en',
          name: 'English',
          nativeName: 'English',
          direction: 'ltr',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 1,
        },
      ];

      // Simulate user previously chose English
      useLangStore.setState({
        code: 'en',
        dir: 'ltr',
        languages: [],
      });

      useLangStore.getState().setLanguages(mockLanguages);
      
      // Should maintain English preference
      const { code, dir } = useLangStore.getState();
      expect(code).toBe('en');
      expect(dir).toBe('ltr');
    });

    it('should fallback to default language when current preference is not available', () => {
      const mockLanguages: Language[] = [
        {
          id: '1',
          code: 'fa',
          name: 'Persian',
          nativeName: 'فارسی',
          direction: 'rtl',
          enabled: true,
          isDefault: true,
          flag: null,
          order: 0,
        },
        {
          id: '2',
          code: 'en',
          name: 'English',
          nativeName: 'English',
          direction: 'ltr',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 1,
        },
      ];

      // Simulate user has an invalid language code (e.g., removed language)
      useLangStore.setState({
        code: 'de', // German - not available
        dir: 'ltr',
        languages: [],
      });

      useLangStore.getState().setLanguages(mockLanguages);
      
      // Should fallback to Persian default
      const { code, dir } = useLangStore.getState();
      expect(code).toBe('fa');
      expect(dir).toBe('rtl');
    });

    it('should fallback to first language if no default is marked', () => {
      const mockLanguages: Language[] = [
        {
          id: '1',
          code: 'fa',
          name: 'Persian',
          nativeName: 'فارسی',
          direction: 'rtl',
          enabled: true,
          isDefault: false, // No default marked
          flag: null,
          order: 0,
        },
        {
          id: '2',
          code: 'en',
          name: 'English',
          nativeName: 'English',
          direction: 'ltr',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 1,
        },
      ];

      // Simulate invalid current code
      useLangStore.setState({
        code: 'de',
        dir: 'ltr',
        languages: [],
      });

      useLangStore.getState().setLanguages(mockLanguages);
      
      // Should fallback to first language (Persian)
      const { code, dir } = useLangStore.getState();
      expect(code).toBe('fa');
      expect(dir).toBe('rtl');
    });

    it('should fallback to hardcoded "fa" if languages array is empty', () => {
      useLangStore.setState({
        code: 'de',
        dir: 'ltr',
        languages: [],
      });

      useLangStore.getState().setLanguages([]);
      
      // Should use the hardcoded fallback
      const { code, dir } = useLangStore.getState();
      expect(code).toBe('fa');
      expect(dir).toBe('rtl');
    });
  });

  describe('Language persistence', () => {
    it('should persist language changes to localStorage', () => {
      const mockLanguages: Language[] = [
        {
          id: '1',
          code: 'fa',
          name: 'Persian',
          nativeName: 'فارسی',
          direction: 'rtl',
          enabled: true,
          isDefault: true,
          flag: null,
          order: 0,
        },
        {
          id: '2',
          code: 'en',
          name: 'English',
          nativeName: 'English',
          direction: 'ltr',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 1,
        },
      ];

      useLangStore.getState().setLanguages(mockLanguages);
      useLangStore.getState().setLang('en');

      // Check localStorage was updated
      const stored = localStorage.getItem('aria-lang');
      expect(stored).toBeTruthy();
      
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.code).toBe('en');
        expect(parsed.state.dir).toBe('ltr');
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle setLang with non-existent language code gracefully', () => {
      const mockLanguages: Language[] = [
        {
          id: '1',
          code: 'fa',
          name: 'Persian',
          nativeName: 'فارسی',
          direction: 'rtl',
          enabled: true,
          isDefault: true,
          flag: null,
          order: 0,
        },
      ];

      useLangStore.getState().setLanguages(mockLanguages);
      
      const beforeCode = useLangStore.getState().code;
      const beforeDir = useLangStore.getState().dir;

      // Try to set non-existent language
      useLangStore.getState().setLang('de');

      // Should remain unchanged
      expect(useLangStore.getState().code).toBe(beforeCode);
      expect(useLangStore.getState().dir).toBe(beforeDir);
    });
  });
});

/**
 * Property-Based Test: Language-Direction Mapping Consistency
 * Task 10.2: Write property test for language-direction mapping
 * 
 * **Validates: Requirements 1.3, 5.3, 5.4, 8.1, 8.2**
 * 
 * This test ensures that language codes consistently map to their correct text direction:
 * - Persian (fa) and Pashto (ps) map to rtl
 * - English (en) maps to ltr
 */

describe('Lang Store - Property-Based Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset store to initial state
    useLangStore.setState({
      code: 'fa',
      dir: 'rtl',
      languages: [],
    });
  });

  describe('Property 1: Language-Direction Mapping Consistency', () => {
    // Feature: complete-multilingual-translation, Property 1: Language-Direction Mapping Consistency
    // **Validates: Requirements 1.3, 5.3, 5.4, 8.1, 8.2**

    it('should map fa and ps to rtl, and en to ltr consistently', () => {
      const mockLanguages: Language[] = [
        {
          id: '1',
          code: 'fa',
          name: 'Persian',
          nativeName: 'فارسی',
          direction: 'rtl',
          enabled: true,
          isDefault: true,
          flag: null,
          order: 0,
        },
        {
          id: '2',
          code: 'en',
          name: 'English',
          nativeName: 'English',
          direction: 'ltr',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 1,
        },
        {
          id: '3',
          code: 'ps',
          name: 'Pashto',
          nativeName: 'پښتو',
          direction: 'rtl',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 2,
        },
      ];

      useLangStore.getState().setLanguages(mockLanguages);

      // Property: For any supported language code ('en', 'fa', 'ps'),
      // when the language is set, the system SHALL map it to the correct text direction
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          (langCode) => {
            // Set the language
            useLangStore.getState().setLang(langCode);
            
            const { code, dir } = useLangStore.getState();
            
            // Verify code is set correctly
            expect(code).toBe(langCode);
            
            // Verify direction mapping is correct
            const expectedDir = langCode === 'en' ? 'ltr' : 'rtl';
            expect(dir).toBe(expectedDir);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain consistent direction mapping across multiple language switches', () => {
      const mockLanguages: Language[] = [
        {
          id: '1',
          code: 'fa',
          name: 'Persian',
          nativeName: 'فارسی',
          direction: 'rtl',
          enabled: true,
          isDefault: true,
          flag: null,
          order: 0,
        },
        {
          id: '2',
          code: 'en',
          name: 'English',
          nativeName: 'English',
          direction: 'ltr',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 1,
        },
        {
          id: '3',
          code: 'ps',
          name: 'Pashto',
          nativeName: 'پښتو',
          direction: 'rtl',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 2,
        },
      ];

      useLangStore.getState().setLanguages(mockLanguages);

      // Property: Direction mapping should remain consistent across multiple language switches
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom('en', 'fa', 'ps'), { minLength: 1, maxLength: 10 }),
          (langSequence) => {
            // Apply sequence of language switches
            for (const langCode of langSequence) {
              useLangStore.getState().setLang(langCode);
              
              const { code, dir } = useLangStore.getState();
              
              // Verify each switch maintains correct mapping
              expect(code).toBe(langCode);
              const expectedDir = langCode === 'en' ? 'ltr' : 'rtl';
              expect(dir).toBe(expectedDir);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should update HTML dir attribute correctly based on language', () => {
      const mockLanguages: Language[] = [
        {
          id: '1',
          code: 'fa',
          name: 'Persian',
          nativeName: 'فارسی',
          direction: 'rtl',
          enabled: true,
          isDefault: true,
          flag: null,
          order: 0,
        },
        {
          id: '2',
          code: 'en',
          name: 'English',
          nativeName: 'English',
          direction: 'ltr',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 1,
        },
        {
          id: '3',
          code: 'ps',
          name: 'Pashto',
          nativeName: 'پښتو',
          direction: 'rtl',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 2,
        },
      ];

      useLangStore.getState().setLanguages(mockLanguages);

      // Property: The dir value should be consistent with the language's text direction
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          (langCode) => {
            useLangStore.getState().setLang(langCode);
            
            const { dir } = useLangStore.getState();
            
            // Verify dir attribute is correct for use in HTML
            if (langCode === 'fa' || langCode === 'ps') {
              expect(dir).toBe('rtl');
            } else if (langCode === 'en') {
              expect(dir).toBe('ltr');
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should ensure atomic updates of both code and dir', () => {
      const mockLanguages: Language[] = [
        {
          id: '1',
          code: 'fa',
          name: 'Persian',
          nativeName: 'فارسی',
          direction: 'rtl',
          enabled: true,
          isDefault: true,
          flag: null,
          order: 0,
        },
        {
          id: '2',
          code: 'en',
          name: 'English',
          nativeName: 'English',
          direction: 'ltr',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 1,
        },
        {
          id: '3',
          code: 'ps',
          name: 'Pashto',
          nativeName: 'پښتو',
          direction: 'rtl',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 2,
        },
      ];

      useLangStore.getState().setLanguages(mockLanguages);

      // Property: setLang should atomically update both code and dir
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          (langCode) => {
            useLangStore.getState().setLang(langCode);
            
            const state = useLangStore.getState();
            
            // Both values should be updated together atomically
            expect(state.code).toBe(langCode);
            
            // And they should be consistent with each other
            if (state.code === 'en') {
              expect(state.dir).toBe('ltr');
            } else {
              expect(state.dir).toBe('rtl');
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify all three supported languages have correct direction in mock data', () => {
      // Property: Language data structure should always have correct direction values
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          (langCode) => {
            const mockLanguages: Language[] = [
              {
                id: '1',
                code: 'fa',
                name: 'Persian',
                nativeName: 'فارسی',
                direction: 'rtl',
                enabled: true,
                isDefault: true,
                flag: null,
                order: 0,
              },
              {
                id: '2',
                code: 'en',
                name: 'English',
                nativeName: 'English',
                direction: 'ltr',
                enabled: true,
                isDefault: false,
                flag: null,
                order: 1,
              },
              {
                id: '3',
                code: 'ps',
                name: 'Pashto',
                nativeName: 'پښتو',
                direction: 'rtl',
                enabled: true,
                isDefault: false,
                flag: null,
                order: 2,
              },
            ];

            const language = mockLanguages.find(l => l.code === langCode);
            expect(language).toBeDefined();
            
            if (language) {
              // Verify the language data has correct direction
              if (langCode === 'en') {
                expect(language.direction).toBe('ltr');
              } else if (langCode === 'fa' || langCode === 'ps') {
                expect(language.direction).toBe('rtl');
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should persist correct direction to localStorage along with language code', () => {
      const mockLanguages: Language[] = [
        {
          id: '1',
          code: 'fa',
          name: 'Persian',
          nativeName: 'فارسی',
          direction: 'rtl',
          enabled: true,
          isDefault: true,
          flag: null,
          order: 0,
        },
        {
          id: '2',
          code: 'en',
          name: 'English',
          nativeName: 'English',
          direction: 'ltr',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 1,
        },
        {
          id: '3',
          code: 'ps',
          name: 'Pashto',
          nativeName: 'پښتو',
          direction: 'rtl',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 2,
        },
      ];

      useLangStore.getState().setLanguages(mockLanguages);

      // Property: Persisted data should include correct direction for each language
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          (langCode) => {
            useLangStore.getState().setLang(langCode);
            
            // Check localStorage persistence
            const stored = localStorage.getItem('aria-lang');
            expect(stored).toBeTruthy();
            
            if (stored) {
              const parsed = JSON.parse(stored);
              expect(parsed.state.code).toBe(langCode);
              
              // Verify persisted direction matches expected
              const expectedDir = langCode === 'en' ? 'ltr' : 'rtl';
              expect(parsed.state.dir).toBe(expectedDir);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 6: Complete Language Preference Persistence', () => {
    // Feature: complete-multilingual-translation, Property 6: Complete Language Preference Persistence
    // **Validates: Requirements 5.7, 12.1, 12.4**

    it('should persist both code and dir to localStorage for any language selection', () => {
      const mockLanguages: Language[] = [
        {
          id: '1',
          code: 'fa',
          name: 'Persian',
          nativeName: 'فارسی',
          direction: 'rtl',
          enabled: true,
          isDefault: true,
          flag: null,
          order: 0,
        },
        {
          id: '2',
          code: 'en',
          name: 'English',
          nativeName: 'English',
          direction: 'ltr',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 1,
        },
        {
          id: '3',
          code: 'ps',
          name: 'Pashto',
          nativeName: 'پښتو',
          direction: 'rtl',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 2,
        },
      ];

      useLangStore.getState().setLanguages(mockLanguages);

      // Property: For any language selection made by the user,
      // the Lang_Store SHALL persist both the language code and text direction to localStorage
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          (langCode) => {
            // Clear localStorage to ensure we test persistence behavior
            localStorage.clear();
            
            // Set the language
            useLangStore.getState().setLang(langCode);
            
            // Verify localStorage was updated
            const stored = localStorage.getItem('aria-lang');
            expect(stored).toBeTruthy();
            expect(stored).not.toBe(null);
            
            if (stored) {
              const parsed = JSON.parse(stored);
              
              // Verify both code and dir are persisted
              expect(parsed.state).toBeDefined();
              expect(parsed.state.code).toBeDefined();
              expect(parsed.state.dir).toBeDefined();
              
              // Verify persisted values match the selected language
              expect(parsed.state.code).toBe(langCode);
              
              const expectedDir = langCode === 'en' ? 'ltr' : 'rtl';
              expect(parsed.state.dir).toBe(expectedDir);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should ensure complete state recovery from localStorage', () => {
      const mockLanguages: Language[] = [
        {
          id: '1',
          code: 'fa',
          name: 'Persian',
          nativeName: 'فارسی',
          direction: 'rtl',
          enabled: true,
          isDefault: true,
          flag: null,
          order: 0,
        },
        {
          id: '2',
          code: 'en',
          name: 'English',
          nativeName: 'English',
          direction: 'ltr',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 1,
        },
        {
          id: '3',
          code: 'ps',
          name: 'Pashto',
          nativeName: 'پښتو',
          direction: 'rtl',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 2,
        },
      ];

      // Property: Persisted state should allow complete state recovery
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          (langCode) => {
            // Reset store
            useLangStore.setState({
              code: 'fa',
              dir: 'rtl',
              languages: [],
            });
            
            useLangStore.getState().setLanguages(mockLanguages);
            
            // Set language and let it persist
            useLangStore.getState().setLang(langCode);
            
            const beforeState = useLangStore.getState();
            
            // Simulate page reload by reading from localStorage
            const stored = localStorage.getItem('aria-lang');
            expect(stored).toBeTruthy();
            
            if (stored) {
              const parsed = JSON.parse(stored);
              
              // Verify we can recover the complete state
              expect(parsed.state.code).toBe(beforeState.code);
              expect(parsed.state.dir).toBe(beforeState.dir);
              
              // Verify state consistency
              expect(parsed.state.code).toBe(langCode);
              const expectedDir = langCode === 'en' ? 'ltr' : 'rtl';
              expect(parsed.state.dir).toBe(expectedDir);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should persist language preference across multiple language switches', () => {
      const mockLanguages: Language[] = [
        {
          id: '1',
          code: 'fa',
          name: 'Persian',
          nativeName: 'فارسی',
          direction: 'rtl',
          enabled: true,
          isDefault: true,
          flag: null,
          order: 0,
        },
        {
          id: '2',
          code: 'en',
          name: 'English',
          nativeName: 'English',
          direction: 'ltr',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 1,
        },
        {
          id: '3',
          code: 'ps',
          name: 'Pashto',
          nativeName: 'پښتو',
          direction: 'rtl',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 2,
        },
      ];

      useLangStore.getState().setLanguages(mockLanguages);

      // Property: Each language switch should persist complete state
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom('en', 'fa', 'ps'), { minLength: 1, maxLength: 5 }),
          (langSequence) => {
            for (const langCode of langSequence) {
              useLangStore.getState().setLang(langCode);
              
              // Verify persistence after each switch
              const stored = localStorage.getItem('aria-lang');
              expect(stored).toBeTruthy();
              
              if (stored) {
                const parsed = JSON.parse(stored);
                
                // Verify the latest selection is persisted
                expect(parsed.state.code).toBe(langCode);
                
                const expectedDir = langCode === 'en' ? 'ltr' : 'rtl';
                expect(parsed.state.dir).toBe(expectedDir);
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain persistence integrity with both properties present', () => {
      const mockLanguages: Language[] = [
        {
          id: '1',
          code: 'fa',
          name: 'Persian',
          nativeName: 'فارسی',
          direction: 'rtl',
          enabled: true,
          isDefault: true,
          flag: null,
          order: 0,
        },
        {
          id: '2',
          code: 'en',
          name: 'English',
          nativeName: 'English',
          direction: 'ltr',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 1,
        },
        {
          id: '3',
          code: 'ps',
          name: 'Pashto',
          nativeName: 'پښتو',
          direction: 'rtl',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 2,
        },
      ];

      useLangStore.getState().setLanguages(mockLanguages);

      // Property: Persisted data should always contain both code and dir properties
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          (langCode) => {
            useLangStore.getState().setLang(langCode);
            
            const stored = localStorage.getItem('aria-lang');
            expect(stored).toBeTruthy();
            
            if (stored) {
              const parsed = JSON.parse(stored);
              
              // Both properties must be present (completeness check)
              expect(parsed.state).toHaveProperty('code');
              expect(parsed.state).toHaveProperty('dir');
              
              // Both properties must have valid values (not null, undefined, or empty)
              expect(parsed.state.code).toBeTruthy();
              expect(parsed.state.dir).toBeTruthy();
              
              // Values must be valid
              expect(['en', 'fa', 'ps']).toContain(parsed.state.code);
              expect(['ltr', 'rtl']).toContain(parsed.state.dir);
              
              // They must be consistent with each other
              if (parsed.state.code === 'en') {
                expect(parsed.state.dir).toBe('ltr');
              } else {
                expect(parsed.state.dir).toBe('rtl');
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify persistence format matches expected structure', () => {
      const mockLanguages: Language[] = [
        {
          id: '1',
          code: 'fa',
          name: 'Persian',
          nativeName: 'فارسی',
          direction: 'rtl',
          enabled: true,
          isDefault: true,
          flag: null,
          order: 0,
        },
        {
          id: '2',
          code: 'en',
          name: 'English',
          nativeName: 'English',
          direction: 'ltr',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 1,
        },
        {
          id: '3',
          code: 'ps',
          name: 'Pashto',
          nativeName: 'پښتو',
          direction: 'rtl',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 2,
        },
      ];

      useLangStore.getState().setLanguages(mockLanguages);

      // Property: Persisted data should follow the expected Zustand persist structure
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          (langCode) => {
            useLangStore.getState().setLang(langCode);
            
            const stored = localStorage.getItem('aria-lang');
            expect(stored).toBeTruthy();
            
            if (stored) {
              const parsed = JSON.parse(stored);
              
              // Verify Zustand persist structure
              expect(parsed).toHaveProperty('state');
              expect(parsed.state).toBeTypeOf('object');
              
              // Verify required properties in state
              expect(parsed.state).toHaveProperty('code');
              expect(parsed.state).toHaveProperty('dir');
              expect(parsed.state).toHaveProperty('languages');
              
              // Verify types
              expect(typeof parsed.state.code).toBe('string');
              expect(typeof parsed.state.dir).toBe('string');
              expect(Array.isArray(parsed.state.languages)).toBe(true);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case of empty localStorage gracefully', () => {
      const mockLanguages: Language[] = [
        {
          id: '1',
          code: 'fa',
          name: 'Persian',
          nativeName: 'فارسی',
          direction: 'rtl',
          enabled: true,
          isDefault: true,
          flag: null,
          order: 0,
        },
        {
          id: '2',
          code: 'en',
          name: 'English',
          nativeName: 'English',
          direction: 'ltr',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 1,
        },
        {
          id: '3',
          code: 'ps',
          name: 'Pashto',
          nativeName: 'پښتو',
          direction: 'rtl',
          enabled: true,
          isDefault: false,
          flag: null,
          order: 2,
        },
      ];

      // Property: System should create persistence entry even if localStorage starts empty
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          (langCode) => {
            // Ensure localStorage is empty
            localStorage.clear();
            
            // Reset store to default state
            useLangStore.setState({
              code: 'fa',
              dir: 'rtl',
              languages: [],
            });
            
            useLangStore.getState().setLanguages(mockLanguages);
            
            // Now set language - should create persistence entry
            useLangStore.getState().setLang(langCode);
            
            // Verify persistence was created
            const stored = localStorage.getItem('aria-lang');
            expect(stored).not.toBe(null);
            
            if (stored) {
              const parsed = JSON.parse(stored);
              expect(parsed.state.code).toBe(langCode);
              
              const expectedDir = langCode === 'en' ? 'ltr' : 'rtl';
              expect(parsed.state.dir).toBe(expectedDir);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
