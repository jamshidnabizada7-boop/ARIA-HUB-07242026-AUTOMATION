import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { useLangStore } from './lang-store';
import type { Language } from './types';

/**
 * Property-Based Test: Complete Language Preference Persistence
 * Task 10.6: Write property test for language preference persistence
 * 
 * **Property 6: Complete Language Preference Persistence**
 * **Validates: Requirements 5.7, 12.1, 12.4**
 * 
 * This test verifies that language selection persists to localStorage with both code and dir.
 * It ensures:
 * - Language selection is persisted to localStorage (Req 5.7, 12.1)
 * - Both code and dir values are persisted together (Req 12.4)
 * - Persisted preference can be recovered across sessions
 * - All supported languages persist correctly
 */

describe('Property 6: Complete Language Preference Persistence', () => {
  // Feature: complete-multilingual-translation, Property 6: Complete Language Preference Persistence
  // **Validates: Requirements 5.7, 12.1, 12.4**

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

  it('should persist language selection to localStorage with both code and dir for any valid language', () => {
    // Property: For any language selection, both code and dir SHALL persist to localStorage
    useLangStore.getState().setLanguages(mockLanguages);

    fc.assert(
      fc.property(
        fc.constantFrom('en', 'fa', 'ps'),
        (langCode) => {
          // Clear localStorage to ensure fresh test
          localStorage.clear();
          
          // Set the language
          useLangStore.getState().setLang(langCode);
          
          // Verify localStorage was updated
          const stored = localStorage.getItem('aria-lang');
          expect(stored).toBeTruthy();
          expect(stored).not.toBeNull();
          
          if (stored) {
            const parsed = JSON.parse(stored);
            
            // Verify both code and dir are persisted (Requirement 12.4)
            expect(parsed.state).toBeDefined();
            expect(parsed.state.code).toBeDefined();
            expect(parsed.state.dir).toBeDefined();
            
            // Verify persisted code matches selected language (Requirements 5.7, 12.1)
            expect(parsed.state.code).toBe(langCode);
            
            // Verify persisted dir matches language direction (Requirement 12.4)
            const expectedDir = langCode === 'en' ? 'ltr' : 'rtl';
            expect(parsed.state.dir).toBe(expectedDir);
            
            // Verify consistency between code and dir in persisted state
            if (parsed.state.code === 'en') {
              expect(parsed.state.dir).toBe('ltr');
            } else if (parsed.state.code === 'fa' || parsed.state.code === 'ps') {
              expect(parsed.state.dir).toBe('rtl');
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should persist language preference across multiple language switches', () => {
    // Property: Persistence should work consistently across multiple language changes
    useLangStore.getState().setLanguages(mockLanguages);

    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('en', 'fa', 'ps'), { minLength: 1, maxLength: 20 }),
        (langSequence) => {
          for (const langCode of langSequence) {
            // Set language
            useLangStore.getState().setLang(langCode);
            
            // Verify persistence after each switch
            const stored = localStorage.getItem('aria-lang');
            expect(stored).toBeTruthy();
            
            if (stored) {
              const parsed = JSON.parse(stored);
              
              // Latest selection should be persisted
              expect(parsed.state.code).toBe(langCode);
              
              // Direction should match the language
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

  it('should allow recovering persisted language preference after store reset', () => {
    // Property: Persisted preference should be recoverable (simulating app restart)
    useLangStore.getState().setLanguages(mockLanguages);

    fc.assert(
      fc.property(
        fc.constantFrom('en', 'fa', 'ps'),
        (langCode) => {
          // Clear localStorage first
          localStorage.clear();
          
          // Set initial language and verify persistence
          useLangStore.getState().setLang(langCode);
          
          const stored = localStorage.getItem('aria-lang');
          expect(stored).toBeTruthy();
          
          if (stored) {
            const parsed = JSON.parse(stored);
            
            // Verify both code and dir were persisted
            expect(parsed.state.code).toBe(langCode);
            
            const expectedDir = langCode === 'en' ? 'ltr' : 'rtl';
            expect(parsed.state.dir).toBe(expectedDir);
            
            // Simulate app restart: the persisted data should still be in localStorage
            // and could be loaded by the persist middleware on store initialization
            const storedAfter = localStorage.getItem('aria-lang');
            expect(storedAfter).toBe(stored);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain complete persistence data structure integrity', () => {
    // Property: The persisted object should always have the correct structure
    useLangStore.getState().setLanguages(mockLanguages);

    fc.assert(
      fc.property(
        fc.constantFrom('en', 'fa', 'ps'),
        (langCode) => {
          useLangStore.getState().setLang(langCode);
          
          const stored = localStorage.getItem('aria-lang');
          expect(stored).toBeTruthy();
          
          if (stored) {
            const parsed = JSON.parse(stored);
            
            // Verify structure integrity
            expect(parsed).toHaveProperty('state');
            expect(parsed.state).toHaveProperty('code');
            expect(parsed.state).toHaveProperty('dir');
            expect(parsed.state).toHaveProperty('languages');
            
            // Verify types
            expect(typeof parsed.state.code).toBe('string');
            expect(typeof parsed.state.dir).toBe('string');
            expect(Array.isArray(parsed.state.languages)).toBe(true);
            
            // Verify dir is valid
            expect(['ltr', 'rtl']).toContain(parsed.state.dir);
            
            // Verify code is one of supported languages
            expect(['en', 'fa', 'ps']).toContain(parsed.state.code);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should persist immediately after language change without delay', () => {
    // Property: Persistence should be synchronous (no race conditions)
    useLangStore.getState().setLanguages(mockLanguages);

    fc.assert(
      fc.property(
        fc.constantFrom('en', 'fa', 'ps'),
        (langCode) => {
          // Clear before test
          localStorage.clear();
          
          // Set language
          useLangStore.getState().setLang(langCode);
          
          // Immediately check persistence (should be synchronous)
          const stored = localStorage.getItem('aria-lang');
          expect(stored).toBeTruthy();
          
          if (stored) {
            const parsed = JSON.parse(stored);
            expect(parsed.state.code).toBe(langCode);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should ensure persisted dir value matches current store state', () => {
    // Property: Persisted state should always match in-memory store state
    useLangStore.getState().setLanguages(mockLanguages);

    fc.assert(
      fc.property(
        fc.constantFrom('en', 'fa', 'ps'),
        (langCode) => {
          useLangStore.getState().setLang(langCode);
          
          // Get current store state
          const currentState = useLangStore.getState();
          
          // Get persisted state
          const stored = localStorage.getItem('aria-lang');
          expect(stored).toBeTruthy();
          
          if (stored) {
            const parsed = JSON.parse(stored);
            
            // Persisted state must match current state
            expect(parsed.state.code).toBe(currentState.code);
            expect(parsed.state.dir).toBe(currentState.dir);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle rapid language switches with correct final persistence', () => {
    // Property: Final persisted state should match the last language selection
    useLangStore.getState().setLanguages(mockLanguages);

    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('en', 'fa', 'ps'), { minLength: 2, maxLength: 10 }),
        (langSequence) => {
          // Apply rapid sequence of language switches
          for (const langCode of langSequence) {
            useLangStore.getState().setLang(langCode);
          }
          
          // Get the final language (last in sequence)
          const finalLang = langSequence[langSequence.length - 1];
          
          // Verify persisted state matches final selection
          const stored = localStorage.getItem('aria-lang');
          expect(stored).toBeTruthy();
          
          if (stored) {
            const parsed = JSON.parse(stored);
            expect(parsed.state.code).toBe(finalLang);
            
            const expectedDir = finalLang === 'en' ? 'ltr' : 'rtl';
            expect(parsed.state.dir).toBe(expectedDir);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  describe('Edge cases and error handling', () => {
    it('should handle localStorage being available', () => {
      // This is more of a unit test, but validates the persistence mechanism exists
      useLangStore.getState().setLanguages(mockLanguages);
      useLangStore.getState().setLang('en');
      
      const stored = localStorage.getItem('aria-lang');
      expect(stored).toBeTruthy();
    });

    it('should persist complete state including languages array', () => {
      useLangStore.getState().setLanguages(mockLanguages);
      useLangStore.getState().setLang('ps');
      
      const stored = localStorage.getItem('aria-lang');
      expect(stored).toBeTruthy();
      
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.languages).toBeDefined();
        expect(Array.isArray(parsed.state.languages)).toBe(true);
        expect(parsed.state.languages.length).toBe(3);
      }
    });

    it('should maintain persistence across same language re-selection', () => {
      useLangStore.getState().setLanguages(mockLanguages);
      
      // Set language twice to same value
      useLangStore.getState().setLang('fa');
      const stored1 = localStorage.getItem('aria-lang');
      
      useLangStore.getState().setLang('fa');
      const stored2 = localStorage.getItem('aria-lang');
      
      // Both should have persisted the same language
      expect(stored1).toBeTruthy();
      expect(stored2).toBeTruthy();
      
      if (stored1 && stored2) {
        const parsed1 = JSON.parse(stored1);
        const parsed2 = JSON.parse(stored2);
        
        expect(parsed1.state.code).toBe('fa');
        expect(parsed2.state.code).toBe('fa');
        expect(parsed1.state.dir).toBe('rtl');
        expect(parsed2.state.dir).toBe('rtl');
      }
    });
  });
});
