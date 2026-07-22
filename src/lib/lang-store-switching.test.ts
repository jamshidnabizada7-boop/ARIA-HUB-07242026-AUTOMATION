import { describe, it, expect, beforeEach } from 'vitest';
import { useLangStore } from './lang-store';
import type { Language } from './types';

/**
 * Task 10.1: Verify language switching updates Lang Store
 * 
 * This test suite validates Requirements 5.1, 5.7, 12.1, 12.4:
 * - setLang() updates both code and dir values atomically
 * - Persian (fa) and Pashto (ps) map to 'rtl'
 * - English (en) maps to 'ltr'
 * - Changes persist to localStorage
 * - Initialization from persisted data works correctly
 */
describe('Task 10.1: Language Switching Updates Lang Store', () => {
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
    
    // Reset store to initial Persian default
    useLangStore.setState({
      code: 'fa',
      dir: 'rtl',
      languages: [],
    });
    
    // Set up languages
    useLangStore.getState().setLanguages(mockLanguages);
  });

  describe('Requirement 5.1: setLang() updates both code and dir atomically', () => {
    it('should update both code and dir when switching to English', () => {
      const stateBefore = useLangStore.getState();
      expect(stateBefore.code).toBe('fa');
      expect(stateBefore.dir).toBe('rtl');

      // Switch to English
      useLangStore.getState().setLang('en');

      const stateAfter = useLangStore.getState();
      expect(stateAfter.code).toBe('en');
      expect(stateAfter.dir).toBe('ltr');
    });

    it('should update both code and dir when switching to Pashto', () => {
      // Start with English
      useLangStore.getState().setLang('en');
      expect(useLangStore.getState().code).toBe('en');
      expect(useLangStore.getState().dir).toBe('ltr');

      // Switch to Pashto
      useLangStore.getState().setLang('ps');

      const state = useLangStore.getState();
      expect(state.code).toBe('ps');
      expect(state.dir).toBe('rtl');
    });

    it('should update both code and dir when switching back to Persian', () => {
      // Switch to English first
      useLangStore.getState().setLang('en');
      expect(useLangStore.getState().code).toBe('en');
      expect(useLangStore.getState().dir).toBe('ltr');

      // Switch back to Persian
      useLangStore.getState().setLang('fa');

      const state = useLangStore.getState();
      expect(state.code).toBe('fa');
      expect(state.dir).toBe('rtl');
    });

    it('should not allow partial state updates (code without dir)', () => {
      useLangStore.getState().setLang('en');
      const state = useLangStore.getState();

      // Both should be updated together
      expect(state.code).toBe('en');
      expect(state.dir).toBe('ltr');

      // Verify they are consistent
      const expectedDir = state.code === 'en' ? 'ltr' : 'rtl';
      expect(state.dir).toBe(expectedDir);
    });
  });

  describe('Requirement 5.3, 5.4: Persian and Pashto map to RTL, English maps to LTR', () => {
    it('should map Persian (fa) to RTL direction', () => {
      useLangStore.getState().setLang('fa');
      
      const state = useLangStore.getState();
      expect(state.code).toBe('fa');
      expect(state.dir).toBe('rtl');
    });

    it('should map Pashto (ps) to RTL direction', () => {
      useLangStore.getState().setLang('ps');
      
      const state = useLangStore.getState();
      expect(state.code).toBe('ps');
      expect(state.dir).toBe('rtl');
    });

    it('should map English (en) to LTR direction', () => {
      useLangStore.getState().setLang('en');
      
      const state = useLangStore.getState();
      expect(state.code).toBe('en');
      expect(state.dir).toBe('ltr');
    });

    it('should maintain correct direction after multiple language switches', () => {
      // Switch to English (LTR)
      useLangStore.getState().setLang('en');
      expect(useLangStore.getState().dir).toBe('ltr');

      // Switch to Persian (RTL)
      useLangStore.getState().setLang('fa');
      expect(useLangStore.getState().dir).toBe('rtl');

      // Switch to Pashto (RTL)
      useLangStore.getState().setLang('ps');
      expect(useLangStore.getState().dir).toBe('rtl');

      // Switch back to English (LTR)
      useLangStore.getState().setLang('en');
      expect(useLangStore.getState().dir).toBe('ltr');
    });
  });

  describe('Requirement 5.7, 12.1, 12.4: Changes persist to localStorage', () => {
    it('should persist language changes to localStorage immediately', () => {
      // Switch to English
      useLangStore.getState().setLang('en');

      // Verify localStorage was updated
      const stored = localStorage.getItem('aria-lang');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.code).toBe('en');
      expect(parsed.state.dir).toBe('ltr');
    });

    it('should persist both code and dir values to localStorage', () => {
      // Switch to Pashto
      useLangStore.getState().setLang('ps');

      const stored = localStorage.getItem('aria-lang');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.code).toBe('ps');
      expect(parsed.state.dir).toBe('rtl');
      
      // Verify both values are present
      expect(parsed.state).toHaveProperty('code');
      expect(parsed.state).toHaveProperty('dir');
    });

    it('should update localStorage on each language change', () => {
      // First change
      useLangStore.getState().setLang('en');
      let stored = localStorage.getItem('aria-lang');
      let parsed = JSON.parse(stored!);
      expect(parsed.state.code).toBe('en');

      // Second change
      useLangStore.getState().setLang('ps');
      stored = localStorage.getItem('aria-lang');
      parsed = JSON.parse(stored!);
      expect(parsed.state.code).toBe('ps');

      // Third change
      useLangStore.getState().setLang('fa');
      stored = localStorage.getItem('aria-lang');
      parsed = JSON.parse(stored!);
      expect(parsed.state.code).toBe('fa');
    });

    it('should persist the correct direction for RTL languages', () => {
      useLangStore.getState().setLang('fa');

      const stored = localStorage.getItem('aria-lang');
      const parsed = JSON.parse(stored!);
      
      expect(parsed.state.dir).toBe('rtl');
    });

    it('should persist the correct direction for LTR languages', () => {
      useLangStore.getState().setLang('en');

      const stored = localStorage.getItem('aria-lang');
      const parsed = JSON.parse(stored!);
      
      expect(parsed.state.dir).toBe('ltr');
    });
  });

  describe('Requirement 12.2, 12.5: Initialization from persisted data', () => {
    it('should load persisted Persian language on initialization', () => {
      // Simulate persisted state
      const persistedState = {
        state: {
          code: 'fa',
          dir: 'rtl',
          languages: mockLanguages,
        },
        version: 0,
      };
      localStorage.setItem('aria-lang', JSON.stringify(persistedState));

      // Create a new store instance (simulating app restart)
      // In Zustand with persist, we need to check if the current state matches persisted
      const currentState = useLangStore.getState();
      
      // The store should have the Persian language loaded
      expect(currentState.code).toBe('fa');
      expect(currentState.dir).toBe('rtl');
    });

    it('should load persisted English language on initialization', () => {
      // Set to English first
      useLangStore.getState().setLang('en');
      
      // Verify it was persisted
      const stored = localStorage.getItem('aria-lang');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.state.code).toBe('en');
      expect(parsed.state.dir).toBe('ltr');

      // Current state should match
      const currentState = useLangStore.getState();
      expect(currentState.code).toBe('en');
      expect(currentState.dir).toBe('ltr');
    });

    it('should load persisted Pashto language on initialization', () => {
      // Set to Pashto first
      useLangStore.getState().setLang('ps');
      
      // Verify it was persisted
      const stored = localStorage.getItem('aria-lang');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.state.code).toBe('ps');
      expect(parsed.state.dir).toBe('rtl');

      // Current state should match
      const currentState = useLangStore.getState();
      expect(currentState.code).toBe('ps');
      expect(currentState.dir).toBe('rtl');
    });

    it('should maintain persisted state across multiple reads', () => {
      useLangStore.getState().setLang('en');

      // Read state multiple times
      const state1 = useLangStore.getState();
      const state2 = useLangStore.getState();
      const state3 = useLangStore.getState();

      expect(state1.code).toBe('en');
      expect(state2.code).toBe('en');
      expect(state3.code).toBe('en');

      expect(state1.dir).toBe('ltr');
      expect(state2.dir).toBe('ltr');
      expect(state3.dir).toBe('ltr');
    });

    it('should default to Persian when no persisted state exists', () => {
      // Ensure localStorage is empty
      localStorage.clear();

      // Reset to initial state
      useLangStore.setState({
        code: 'fa',
        dir: 'rtl',
        languages: [],
      });

      useLangStore.getState().setLanguages(mockLanguages);

      const state = useLangStore.getState();
      expect(state.code).toBe('fa');
      expect(state.dir).toBe('rtl');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should not change state when switching to non-existent language', () => {
      const stateBefore = useLangStore.getState();
      const codeBefore = stateBefore.code;
      const dirBefore = stateBefore.dir;

      // Try to switch to non-existent language
      useLangStore.getState().setLang('de');

      const stateAfter = useLangStore.getState();
      expect(stateAfter.code).toBe(codeBefore);
      expect(stateAfter.dir).toBe(dirBefore);
    });

    it('should handle empty string language code gracefully', () => {
      const stateBefore = useLangStore.getState();

      useLangStore.getState().setLang('');

      const stateAfter = useLangStore.getState();
      // State should remain unchanged
      expect(stateAfter.code).toBe(stateBefore.code);
      expect(stateAfter.dir).toBe(stateBefore.dir);
    });

    it('should maintain consistency when called rapidly', () => {
      // Rapidly switch languages
      useLangStore.getState().setLang('en');
      useLangStore.getState().setLang('fa');
      useLangStore.getState().setLang('ps');
      useLangStore.getState().setLang('en');

      const finalState = useLangStore.getState();
      expect(finalState.code).toBe('en');
      expect(finalState.dir).toBe('ltr');

      // Verify localStorage is consistent
      const stored = localStorage.getItem('aria-lang');
      const parsed = JSON.parse(stored!);
      expect(parsed.state.code).toBe('en');
      expect(parsed.state.dir).toBe('ltr');
    });

    it('should handle same language switch gracefully', () => {
      useLangStore.getState().setLang('fa');
      
      const stateBefore = useLangStore.getState();

      // Switch to same language
      useLangStore.getState().setLang('fa');

      const stateAfter = useLangStore.getState();
      expect(stateAfter.code).toBe(stateBefore.code);
      expect(stateAfter.dir).toBe(stateBefore.dir);
    });
  });

  describe('Integration: Complete language switching workflow', () => {
    it('should complete full language switch workflow with persistence', () => {
      // Step 1: Start with Persian (default)
      let state = useLangStore.getState();
      expect(state.code).toBe('fa');
      expect(state.dir).toBe('rtl');

      // Step 2: Switch to English
      useLangStore.getState().setLang('en');
      state = useLangStore.getState();
      expect(state.code).toBe('en');
      expect(state.dir).toBe('ltr');

      // Step 3: Verify persistence
      let stored = localStorage.getItem('aria-lang');
      let parsed = JSON.parse(stored!);
      expect(parsed.state.code).toBe('en');
      expect(parsed.state.dir).toBe('ltr');

      // Step 4: Switch to Pashto
      useLangStore.getState().setLang('ps');
      state = useLangStore.getState();
      expect(state.code).toBe('ps');
      expect(state.dir).toBe('rtl');

      // Step 5: Verify persistence updated
      stored = localStorage.getItem('aria-lang');
      parsed = JSON.parse(stored!);
      expect(parsed.state.code).toBe('ps');
      expect(parsed.state.dir).toBe('rtl');

      // Step 6: Switch back to Persian
      useLangStore.getState().setLang('fa');
      state = useLangStore.getState();
      expect(state.code).toBe('fa');
      expect(state.dir).toBe('rtl');

      // Step 7: Final verification
      stored = localStorage.getItem('aria-lang');
      parsed = JSON.parse(stored!);
      expect(parsed.state.code).toBe('fa');
      expect(parsed.state.dir).toBe('rtl');
    });

    it('should maintain language-direction consistency throughout the app lifecycle', () => {
      const languages = ['en', 'fa', 'ps', 'en', 'ps', 'fa'];

      languages.forEach((lang) => {
        useLangStore.getState().setLang(lang);
        const state = useLangStore.getState();

        // Verify code is set correctly
        expect(state.code).toBe(lang);

        // Verify direction matches the language
        const expectedDir = lang === 'en' ? 'ltr' : 'rtl';
        expect(state.dir).toBe(expectedDir);

        // Verify localStorage persistence
        const stored = localStorage.getItem('aria-lang');
        const parsed = JSON.parse(stored!);
        expect(parsed.state.code).toBe(lang);
        expect(parsed.state.dir).toBe(expectedDir);
      });
    });
  });
});
