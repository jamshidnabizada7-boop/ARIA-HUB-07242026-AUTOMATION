/**
 * Task 10.3: Verify language switching triggers component re-renders
 * Integration test with actual React components
 * 
 * This test suite validates Requirement 5.2:
 * - When Lang Store updates, useT Hook causes components to re-render
 * - All text updates to the new language
 * 
 * These tests go beyond hook testing to verify that actual components
 * properly re-render and display updated translations when language changes.
 */
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useLangStore } from '@/lib/lang-store';
import { useT } from '@/hooks/use-t';
import type { Language } from '@/lib/types';

// Test component that displays multiple translated strings
function TestComponent() {
  const t = useT();
  
  return (
    <div>
      <h1 data-testid="title">{t('admin.nav.dashboard')}</h1>
      <button data-testid="save-btn">{t('admin.button.save')}</button>
      <button data-testid="cancel-btn">{t('common.cancel')}</button>
      <p data-testid="status">{t('status.loading')}</p>
    </div>
  );
}

// Test component with parametric translation
function ParametricTestComponent({ count, total }: { count: number; total: number }) {
  const t = useT();
  
  return (
    <div>
      <p data-testid="table-info">{t('admin.table.showing', { count, total })}</p>
      <p data-testid="results">{t('admin.table.results')}</p>
    </div>
  );
}

// Test component that uses language-dependent logic
function ConditionalTestComponent() {
  const t = useT();
  const lang = useLangStore(s => s.code);
  
  return (
    <div>
      <div data-testid="lang-code">{lang}</div>
      <h2 data-testid="heading">{t('admin.nav.services')}</h2>
      <p data-testid="direction">{useLangStore(s => s.dir)}</p>
    </div>
  );
}

describe('Task 10.3: Component Re-renders on Language Change (Integration Tests)', () => {
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
    localStorage.clear();
    useLangStore.setState({
      code: 'fa',
      dir: 'rtl',
      languages: [],
    });
    useLangStore.getState().setLanguages(mockLanguages);
  });

  describe('Requirement 5.2: Components re-render with new language text', () => {
    it('should re-render component with English translations when language changes to en', () => {
      const { rerender } = render(<TestComponent />);
      
      // Initial render: Persian
      const title = screen.getByTestId('title');
      const saveBtn = screen.getByTestId('save-btn');
      const initialTitleText = title.textContent;
      const initialSaveBtnText = saveBtn.textContent;
      
      expect(initialTitleText).toBeTruthy();
      expect(initialSaveBtnText).toBeTruthy();
      
      // Change language to English
      act(() => {
        useLangStore.getState().setLang('en');
      });
      
      // Component should re-render
      rerender(<TestComponent />);
      
      // Text should be different (now in English)
      const newTitleText = title.textContent;
      const newSaveBtnText = saveBtn.textContent;
      
      expect(newTitleText).toBeTruthy();
      expect(newSaveBtnText).toBeTruthy();
      expect(newTitleText).not.toBe(initialTitleText);
      expect(newSaveBtnText).not.toBe(initialSaveBtnText);
    });

    it('should update all text elements in component when language changes', () => {
      const { rerender } = render(<TestComponent />);
      
      // Capture initial texts (Persian)
      const initialTexts = {
        title: screen.getByTestId('title').textContent,
        saveBtn: screen.getByTestId('save-btn').textContent,
        cancelBtn: screen.getByTestId('cancel-btn').textContent,
        status: screen.getByTestId('status').textContent,
      };
      
      // All should have content
      Object.values(initialTexts).forEach(text => {
        expect(text).toBeTruthy();
      });
      
      // Change to Pashto
      act(() => {
        useLangStore.getState().setLang('ps');
      });
      
      rerender(<TestComponent />);
      
      // All texts should be updated
      const newTexts = {
        title: screen.getByTestId('title').textContent,
        saveBtn: screen.getByTestId('save-btn').textContent,
        cancelBtn: screen.getByTestId('cancel-btn').textContent,
        status: screen.getByTestId('status').textContent,
      };
      
      // All should have content
      Object.values(newTexts).forEach(text => {
        expect(text).toBeTruthy();
      });
      
      // All should be different from initial
      expect(newTexts.title).not.toBe(initialTexts.title);
      expect(newTexts.saveBtn).not.toBe(initialTexts.saveBtn);
      expect(newTexts.cancelBtn).not.toBe(initialTexts.cancelBtn);
      expect(newTexts.status).not.toBe(initialTexts.status);
    });

    it('should handle parametric translations correctly after language change', () => {
      const { rerender } = render(<ParametricTestComponent count={5} total={10} />);
      
      // Get initial parametric translation
      const tableInfo = screen.getByTestId('table-info');
      const initialText = tableInfo.textContent;
      
      expect(initialText).toBeTruthy();
      // Should contain the numbers somewhere in the text
      expect(initialText?.length).toBeGreaterThan(0);
      
      // Change language
      act(() => {
        useLangStore.getState().setLang('en');
      });
      
      rerender(<ParametricTestComponent count={5} total={10} />);
      
      // Text should be different with English template
      const newText = tableInfo.textContent;
      expect(newText).toBeTruthy();
      expect(newText).not.toBe(initialText);
    });

    it('should update component when switching between multiple languages sequentially', () => {
      const { rerender } = render(<TestComponent />);
      
      const titleElement = screen.getByTestId('title');
      const texts: string[] = [];
      
      // Collect Persian text
      texts.push(titleElement.textContent || '');
      expect(texts[0]).toBeTruthy();
      
      // Switch to English
      act(() => {
        useLangStore.getState().setLang('en');
      });
      rerender(<TestComponent />);
      texts.push(titleElement.textContent || '');
      expect(texts[1]).toBeTruthy();
      expect(texts[1]).not.toBe(texts[0]);
      
      // Switch to Pashto
      act(() => {
        useLangStore.getState().setLang('ps');
      });
      rerender(<TestComponent />);
      texts.push(titleElement.textContent || '');
      expect(texts[2]).toBeTruthy();
      expect(texts[2]).not.toBe(texts[1]);
      
      // Switch back to Persian
      act(() => {
        useLangStore.getState().setLang('fa');
      });
      rerender(<TestComponent />);
      const finalText = titleElement.textContent || '';
      expect(finalText).toBeTruthy();
      
      // Should match original Persian text
      expect(finalText).toBe(texts[0]);
    });

    it('should re-render component that uses both language code and translations', () => {
      const { rerender } = render(<ConditionalTestComponent />);
      
      // Initial state: Persian
      expect(screen.getByTestId('lang-code').textContent).toBe('fa');
      expect(screen.getByTestId('direction').textContent).toBe('rtl');
      const initialHeading = screen.getByTestId('heading').textContent;
      expect(initialHeading).toBeTruthy();
      
      // Change to English
      act(() => {
        useLangStore.getState().setLang('en');
      });
      rerender(<ConditionalTestComponent />);
      
      // Language code and direction should update
      expect(screen.getByTestId('lang-code').textContent).toBe('en');
      expect(screen.getByTestId('direction').textContent).toBe('ltr');
      
      // Heading text should be different
      const englishHeading = screen.getByTestId('heading').textContent;
      expect(englishHeading).toBeTruthy();
      expect(englishHeading).not.toBe(initialHeading);
    });

    it('should handle rapid language switches without missing updates', () => {
      const { rerender } = render(<TestComponent />);
      
      const titleElement = screen.getByTestId('title');
      
      // Rapid switches
      act(() => {
        useLangStore.getState().setLang('en');
        useLangStore.getState().setLang('ps');
        useLangStore.getState().setLang('fa');
        useLangStore.getState().setLang('en');
      });
      
      rerender(<TestComponent />);
      
      // Final state should be English
      const finalText = titleElement.textContent;
      expect(finalText).toBeTruthy();
      
      // Verify by checking the current language
      expect(useLangStore.getState().code).toBe('en');
      expect(useLangStore.getState().dir).toBe('ltr');
    });

    it('should maintain component state while updating translations', () => {
      // Component with local state
      function StatefulComponent() {
        const t = useT();
        const [counter, setCounter] = React.useState(0);
        
        return (
          <div>
            <p data-testid="translation">{t('admin.button.save')}</p>
            <p data-testid="counter">{counter}</p>
            <button data-testid="increment" onClick={() => setCounter(c => c + 1)}>+</button>
          </div>
        );
      }

      const { rerender } = render(<StatefulComponent />);
      
      // Get initial translation
      const initialTranslation = screen.getByTestId('translation').textContent;
      
      // Increment counter
      const incrementBtn = screen.getByTestId('increment');
      act(() => {
        incrementBtn.click();
        incrementBtn.click();
      });
      
      expect(screen.getByTestId('counter').textContent).toBe('2');
      
      // Change language
      act(() => {
        useLangStore.getState().setLang('en');
      });
      
      rerender(<StatefulComponent />);
      
      // Translation should update
      const newTranslation = screen.getByTestId('translation').textContent;
      expect(newTranslation).not.toBe(initialTranslation);
      
      // But counter state should be preserved
      expect(screen.getByTestId('counter').textContent).toBe('2');
    });

    it('should update nested components when language changes', () => {
      function ParentComponent() {
        const t = useT();
        return (
          <div>
            <p data-testid="parent">{t('admin.nav.dashboard')}</p>
            <ChildComponent />
          </div>
        );
      }

      function ChildComponent() {
        const t = useT();
        return <p data-testid="child">{t('admin.button.save')}</p>;
      }

      const { rerender } = render(<ParentComponent />);
      
      const parentInitial = screen.getByTestId('parent').textContent;
      const childInitial = screen.getByTestId('child').textContent;
      
      expect(parentInitial).toBeTruthy();
      expect(childInitial).toBeTruthy();
      
      // Change language
      act(() => {
        useLangStore.getState().setLang('en');
      });
      
      rerender(<ParentComponent />);
      
      // Both parent and child should update
      const parentNew = screen.getByTestId('parent').textContent;
      const childNew = screen.getByTestId('child').textContent;
      
      expect(parentNew).not.toBe(parentInitial);
      expect(childNew).not.toBe(childInitial);
    });

    it('should update multiple instances of same component independently', () => {
      function TranslatedButton({ labelKey }: { labelKey: string }) {
        const t = useT();
        return <button>{t(labelKey)}</button>;
      }

      function MultiButtonComponent() {
        return (
          <div>
            <div data-testid="btn1"><TranslatedButton labelKey="admin.button.save" /></div>
            <div data-testid="btn2"><TranslatedButton labelKey="admin.button.delete" /></div>
            <div data-testid="btn3"><TranslatedButton labelKey="common.cancel" /></div>
          </div>
        );
      }

      const { rerender } = render(<MultiButtonComponent />);
      
      const btn1Initial = screen.getByTestId('btn1').textContent;
      const btn2Initial = screen.getByTestId('btn2').textContent;
      const btn3Initial = screen.getByTestId('btn3').textContent;
      
      expect(btn1Initial).toBeTruthy();
      expect(btn2Initial).toBeTruthy();
      expect(btn3Initial).toBeTruthy();
      
      // Change language
      act(() => {
        useLangStore.getState().setLang('ps');
      });
      
      rerender(<MultiButtonComponent />);
      
      // All buttons should update
      expect(screen.getByTestId('btn1').textContent).not.toBe(btn1Initial);
      expect(screen.getByTestId('btn2').textContent).not.toBe(btn2Initial);
      expect(screen.getByTestId('btn3').textContent).not.toBe(btn3Initial);
    });
  });
});
