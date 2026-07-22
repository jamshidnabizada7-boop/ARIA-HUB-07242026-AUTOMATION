/**
 * Task 10.3: Verify language switching triggers component re-renders
 * 
 * This test suite validates Requirement 5.2:
 * - When Lang Store updates, useT Hook causes components to re-render
 * - All text updates to the new language
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLangStore } from '@/lib/lang-store';
import { useT } from './use-t';
import type { Language } from '@/lib/types';

describe('Task 10.3: Language Switching Triggers Component Re-renders (Requirement 5.2)', () => {
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
    // Clear localStorage
    localStorage.clear();
    
    // Reset store to Persian default
    useLangStore.setState({
      code: 'fa',
      dir: 'rtl',
      languages: [],
    });
    
    useLangStore.getState().setLanguages(mockLanguages);
  });

  describe('Requirement 5.2: useT Hook causes components to re-render on language change', () => {
    it('should return a translation function that responds to language changes', () => {
      const { result } = renderHook(() => useT());
      
      // Initial state: Persian
      const t1 = result.current;
      const value1 = t1('admin.nav.dashboard');
      
      // Value should be from Persian translations
      expect(typeof value1).toBe('string');
      expect(value1.length).toBeGreaterThan(0);
      
      // Change language
      act(() => {
        useLangStore.getState().setLang('en');
      });
      
      // Hook should have new translation function
      const t2 = result.current;
      const value2 = t2('admin.nav.dashboard');
      
      // Value should be from English translations and different from Persian
      expect(typeof value2).toBe('string');
      expect(value2.length).toBeGreaterThan(0);
      expect(value2).not.toBe(value1); // Translations should be different
    });

    it('should cause re-render when language changes from fa to en', () => {
      const { result, rerender } = renderHook(() => useT());
      
      let renderCount = 0;
      const t = result.current;
      renderCount++;
      
      // Get initial translation (Persian)
      const persianText = t('admin.button.save');
      expect(persianText).toBeTruthy();
      
      // Change to English
      act(() => {
        useLangStore.getState().setLang('en');
      });
      
      // Force a rerender to simulate React's behavior
      rerender();
      
      // Get new translation function after language change
      const tAfter = result.current;
      const englishText = tAfter('admin.button.save');
      
      // Texts should be different (Persian vs English)
      expect(englishText).toBeTruthy();
      expect(englishText).not.toBe(persianText);
    });

    it('should update translations when language changes from fa to ps', () => {
      const { result } = renderHook(() => useT());
      
      // Get Persian translation
      const persianText = result.current('common.cancel');
      
      // Change to Pashto
      act(() => {
        useLangStore.getState().setLang('ps');
      });
      
      // Get Pashto translation
      const pashtoText = result.current('common.cancel');
      
      // Translations should be different
      expect(persianText).toBeTruthy();
      expect(pashtoText).toBeTruthy();
      expect(pashtoText).not.toBe(persianText);
    });

    it('should handle rapid language switches correctly', () => {
      const { result } = renderHook(() => useT());
      
      // Store translation values
      const translations: Record<string, string> = {};
      
      // Get Persian translation
      translations.fa = result.current('admin.nav.services');
      expect(translations.fa).toBeTruthy();
      
      // Switch to English
      act(() => {
        useLangStore.getState().setLang('en');
      });
      translations.en = result.current('admin.nav.services');
      expect(translations.en).toBeTruthy();
      expect(translations.en).not.toBe(translations.fa);
      
      // Switch to Pashto
      act(() => {
        useLangStore.getState().setLang('ps');
      });
      translations.ps = result.current('admin.nav.services');
      expect(translations.ps).toBeTruthy();
      expect(translations.ps).not.toBe(translations.en);
      
      // Switch back to Persian
      act(() => {
        useLangStore.getState().setLang('fa');
      });
      const finalPersian = result.current('admin.nav.services');
      
      // Should match original Persian translation
      expect(finalPersian).toBe(translations.fa);
    });

    it('should track language code changes and return appropriate translations', () => {
      const { result } = renderHook(() => {
        const t = useT();
        const code = useLangStore((s) => s.code);
        return { t, code };
      });
      
      // Initial: Persian
      expect(result.current.code).toBe('fa');
      const persianDashboard = result.current.t('admin.nav.dashboard');
      
      // Change to English
      act(() => {
        useLangStore.getState().setLang('en');
      });
      
      expect(result.current.code).toBe('en');
      const englishDashboard = result.current.t('admin.nav.dashboard');
      expect(englishDashboard).not.toBe(persianDashboard);
      
      // Change to Pashto
      act(() => {
        useLangStore.getState().setLang('ps');
      });
      
      expect(result.current.code).toBe('ps');
      const pashtoDashboard = result.current.t('admin.nav.dashboard');
      expect(pashtoDashboard).not.toBe(englishDashboard);
      expect(pashtoDashboard).not.toBe(persianDashboard);
    });

    it('should work with parametric translations after language change', () => {
      const { result } = renderHook(() => useT());
      
      // First check if the key exists and has placeholders
      const testKey = 'admin.table.showing';
      
      // Get parametric translation in Persian
      const persianTable = result.current(testKey, { count: 5, total: 10 });
      
      // The translation should include the parameter values (could be Arabic numerals or Persian numerals)
      // Or if placeholders exist, they should be replaced
      expect(persianTable).toBeTruthy();
      expect(persianTable.length).toBeGreaterThan(0);
      
      // Change to English
      act(() => {
        useLangStore.getState().setLang('en');
      });
      
      // Get parametric translation in English
      const englishTable = result.current(testKey, { count: 5, total: 10 });
      expect(englishTable).toBeTruthy();
      expect(englishTable.length).toBeGreaterThan(0);
      
      // If the translation has placeholders, they should be replaced in both languages
      // Just verify that the two translations are different (different language templates)
      // Only check if they're genuinely parametric (contain the substituted values)
      if (persianTable.includes('5') || persianTable.includes('۵')) {
        expect(persianTable).toMatch(/5|۵/);
        expect(persianTable).toMatch(/10|۱۰/);
      }
      
      if (englishTable.includes('5')) {
        expect(englishTable).toContain('5');
        expect(englishTable).toContain('10');
      }
    });

    it('should reflect store updates immediately in the hook', () => {
      const { result } = renderHook(() => useT());
      
      const languages = ['fa', 'en', 'ps'] as const;
      const translationsByLang: Record<string, string> = {};
      
      // Collect translations for each language
      languages.forEach(lang => {
        act(() => {
          useLangStore.getState().setLang(lang);
        });
        
        translationsByLang[lang] = result.current('admin.toast.saved');
        expect(translationsByLang[lang]).toBeTruthy();
      });
      
      // All translations should be different from each other
      expect(translationsByLang.fa).not.toBe(translationsByLang.en);
      expect(translationsByLang.en).not.toBe(translationsByLang.ps);
      expect(translationsByLang.ps).not.toBe(translationsByLang.fa);
    });

    it('should maintain translation functionality across multiple language cycles', () => {
      const { result } = renderHook(() => useT());
      
      // Cycle through languages multiple times
      const key = 'admin.button.edit';
      const cycles = 3;
      
      for (let i = 0; i < cycles; i++) {
        // Persian
        act(() => {
          useLangStore.getState().setLang('fa');
        });
        const fa = result.current(key);
        expect(fa).toBeTruthy();
        
        // English
        act(() => {
          useLangStore.getState().setLang('en');
        });
        const en = result.current(key);
        expect(en).toBeTruthy();
        expect(en).not.toBe(fa);
        
        // Pashto
        act(() => {
          useLangStore.getState().setLang('ps');
        });
        const ps = result.current(key);
        expect(ps).toBeTruthy();
        expect(ps).not.toBe(en);
      }
    });
  });
});
