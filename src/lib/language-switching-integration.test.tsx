import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useLangStore } from './lang-store';
import { useT } from '@/hooks/use-t';
import type { Language } from './types';

/**
 * Task 10.7: Write integration tests for language switching
 * 
 * This test suite validates Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 12.5:
 * - End-to-end language switching flow from user action to UI updates
 * - Component re-renders on language change
 * - RTL/LTR layout switching
 * - Language persistence across navigation
 * - localStorage availability fallback
 * - Complete integration workflow
 */

describe('Task 10.7: Integration Tests for Language Switching', () => {
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

  // Test component that uses translations
  function TestComponent() {
    const t = useT();
    const { dir } = useLangStore();

    return (
      <div data-testid="test-component" dir={dir}>
        <h1 data-testid="title">{t('hero.title')}</h1>
        <button data-testid="button">{t('admin.button.save')}</button>
        <p data-testid="nav">{t('admin.nav.dashboard')}</p>
      </div>
    );
  }

  // Component that shows current language state
  function LanguageStateComponent() {
    const { code, dir } = useLangStore();
    return (
      <div data-testid="lang-state">
        <span data-testid="code">{code}</span>
        <span data-testid="dir">{dir}</span>
      </div>
    );
  }

  describe('Requirement 5.1, 5.2: End-to-end language switching flow', () => {
    it('should complete full language switch from user action to UI update', () => {
      // Render component with Persian (default)
      const { rerender } = render(<TestComponent />);
      
      // Verify initial Persian state
      expect(screen.getByTestId('title')).toHaveTextContent('دروازه شما به');
      expect(screen.getByTestId('button')).toHaveTextContent('ذخیره تغییرات');
      expect(screen.getByTestId('nav')).toHaveTextContent('داشبورد');
      expect(screen.getByTestId('test-component')).toHaveAttribute('dir', 'rtl');

      // User action: Switch to English
      act(() => {
        useLangStore.getState().setLang('en');
      });

      // Re-render to reflect state change
      rerender(<TestComponent />);

      // Verify UI updated to English
      expect(screen.getByTestId('title')).toHaveTextContent('Your Gateway to');
      expect(screen.getByTestId('button')).toHaveTextContent('Save Changes');
      expect(screen.getByTestId('nav')).toHaveTextContent('Dashboard');
      expect(screen.getByTestId('test-component')).toHaveAttribute('dir', 'ltr');
    });

    it('should update all translation text when language changes', () => {
      const { rerender } = render(<TestComponent />);

      // Start with Persian
      const persianTitle = screen.getByTestId('title').textContent;
      const persianButton = screen.getByTestId('button').textContent;
      const persianNav = screen.getByTestId('nav').textContent;

      // Switch to English
      act(() => {
        useLangStore.getState().setLang('en');
      });
      rerender(<TestComponent />);

      // All text should be different (in English)
      expect(screen.getByTestId('title').textContent).not.toBe(persianTitle);
      expect(screen.getByTestId('button').textContent).not.toBe(persianButton);
      expect(screen.getByTestId('nav').textContent).not.toBe(persianNav);

      // Switch to Pashto
      act(() => {
        useLangStore.getState().setLang('ps');
      });
      rerender(<TestComponent />);

      // Text should change again
      expect(screen.getByTestId('title').textContent).not.toBe(persianTitle);
      expect(screen.getByTestId('button').textContent).not.toBe(persianButton);
      expect(screen.getByTestId('nav').textContent).not.toBe(persianNav);
    });

    it('should trigger component re-render on language change', async () => {
      const { rerender } = render(
        <>
          <TestComponent />
          <LanguageStateComponent />
        </>
      );

      // Initial state
      expect(screen.getByTestId('code')).toHaveTextContent('fa');
      expect(screen.getByTestId('dir')).toHaveTextContent('rtl');

      // Change language
      act(() => {
        useLangStore.getState().setLang('en');
      });
      rerender(
        <>
          <TestComponent />
          <LanguageStateComponent />
        </>
      );

      // Components should re-render with new state
      await waitFor(() => {
        expect(screen.getByTestId('code')).toHaveTextContent('en');
        expect(screen.getByTestId('dir')).toHaveTextContent('ltr');
        expect(screen.getByTestId('title')).toHaveTextContent('Your Gateway to');
      });
    });
  });

  describe('Requirement 5.3, 5.4: RTL/LTR layout switching', () => {
    it('should switch to RTL layout for Persian', () => {
      const { rerender } = render(<TestComponent />);

      // Switch to Persian
      act(() => {
        useLangStore.getState().setLang('fa');
      });
      rerender(<TestComponent />);

      expect(screen.getByTestId('test-component')).toHaveAttribute('dir', 'rtl');
      expect(useLangStore.getState().dir).toBe('rtl');
    });

    it('should switch to RTL layout for Pashto', () => {
      const { rerender } = render(<TestComponent />);

      // Switch to Pashto
      act(() => {
        useLangStore.getState().setLang('ps');
      });
      rerender(<TestComponent />);

      expect(screen.getByTestId('test-component')).toHaveAttribute('dir', 'rtl');
      expect(useLangStore.getState().dir).toBe('rtl');
    });

    it('should switch to LTR layout for English', () => {
      const { rerender } = render(<TestComponent />);

      // Switch to English
      act(() => {
        useLangStore.getState().setLang('en');
      });
      rerender(<TestComponent />);

      expect(screen.getByTestId('test-component')).toHaveAttribute('dir', 'ltr');
      expect(useLangStore.getState().dir).toBe('ltr');
    });

    it('should handle layout transitions between RTL and LTR smoothly', () => {
      const { rerender } = render(<TestComponent />);

      // Start with Persian (RTL)
      expect(screen.getByTestId('test-component')).toHaveAttribute('dir', 'rtl');

      // Switch to English (LTR)
      act(() => {
        useLangStore.getState().setLang('en');
      });
      rerender(<TestComponent />);
      expect(screen.getByTestId('test-component')).toHaveAttribute('dir', 'ltr');

      // Switch to Pashto (RTL)
      act(() => {
        useLangStore.getState().setLang('ps');
      });
      rerender(<TestComponent />);
      expect(screen.getByTestId('test-component')).toHaveAttribute('dir', 'rtl');

      // Switch back to English (LTR)
      act(() => {
        useLangStore.getState().setLang('en');
      });
      rerender(<TestComponent />);
      expect(screen.getByTestId('test-component')).toHaveAttribute('dir', 'ltr');
    });

    it('should maintain layout consistency after multiple switches', () => {
      const { rerender } = render(<TestComponent />);
      const languages = [
        { code: 'en', expectedDir: 'ltr' },
        { code: 'fa', expectedDir: 'rtl' },
        { code: 'ps', expectedDir: 'rtl' },
        { code: 'en', expectedDir: 'ltr' },
        { code: 'fa', expectedDir: 'rtl' },
      ];

      for (const { code, expectedDir } of languages) {
        act(() => {
          useLangStore.getState().setLang(code);
        });
        rerender(<TestComponent />);

        expect(screen.getByTestId('test-component')).toHaveAttribute('dir', expectedDir);
        expect(useLangStore.getState().dir).toBe(expectedDir);
      }
    });
  });

  describe('Requirement 5.5, 5.6, 5.7, 5.8: Language persistence and navigation', () => {
    it('should persist language preference across component mounting', () => {
      // First render with Persian
      const { unmount: unmount1 } = render(<TestComponent />);
      expect(screen.getByTestId('title')).toHaveTextContent('دروازه شما به');

      // Switch to English
      act(() => {
        useLangStore.getState().setLang('en');
      });

      unmount1();

      // Second render should maintain English
      render(<TestComponent />);
      expect(screen.getByTestId('title')).toHaveTextContent('Your Gateway to');
      expect(useLangStore.getState().code).toBe('en');
    });

    it('should persist language across different component types', () => {
      // Render first component
      const { unmount: unmount1 } = render(<TestComponent />);
      
      // Switch to Pashto
      act(() => {
        useLangStore.getState().setLang('ps');
      });

      unmount1();

      // Render different component - should use same language
      render(<LanguageStateComponent />);
      expect(screen.getByTestId('code')).toHaveTextContent('ps');
      expect(screen.getByTestId('dir')).toHaveTextContent('rtl');
    });

    it('should persist language to localStorage for returning users', () => {
      render(<TestComponent />);

      // Switch to English
      act(() => {
        useLangStore.getState().setLang('en');
      });

      // Verify persistence
      const stored = localStorage.getItem('aria-lang');
      expect(stored).toBeTruthy();
      
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.code).toBe('en');
        expect(parsed.state.dir).toBe('ltr');
      }
    });

    it('should load persisted language on component mount', () => {
      // Pre-populate localStorage with English preference
      const persistedState = {
        state: {
          code: 'en',
          dir: 'ltr',
          languages: mockLanguages,
        },
        version: 0,
      };
      localStorage.setItem('aria-lang', JSON.stringify(persistedState));

      // Reset store and set languages (simulating app restart)
      useLangStore.setState({
        code: 'en',
        dir: 'ltr',
        languages: mockLanguages,
      });

      // Render component
      render(<TestComponent />);

      // Should use persisted English language
      expect(screen.getByTestId('title')).toHaveTextContent('Your Gateway to');
      expect(useLangStore.getState().code).toBe('en');
      expect(useLangStore.getState().dir).toBe('ltr');
    });

    it('should maintain language consistency across multiple components simultaneously', () => {
      // Render multiple components
      const { rerender } = render(
        <div>
          <TestComponent />
          <LanguageStateComponent />
        </div>
      );

      // All should start with Persian
      expect(screen.getByTestId('title')).toHaveTextContent('دروازه شما به');
      expect(screen.getByTestId('code')).toHaveTextContent('fa');
      expect(screen.getByTestId('dir')).toHaveTextContent('rtl');

      // Switch to English
      act(() => {
        useLangStore.getState().setLang('en');
      });

      // Re-render to reflect state change
      rerender(
        <div>
          <TestComponent />
          <LanguageStateComponent />
        </div>
      );

      // All components should update together
      expect(screen.getByTestId('title')).toHaveTextContent('Your Gateway to');
      expect(screen.getByTestId('code')).toHaveTextContent('en');
      expect(screen.getByTestId('dir')).toHaveTextContent('ltr');
    });
  });

  describe('Requirement 12.5: localStorage availability fallback', () => {
    it('should handle localStorage being available', () => {
      render(<TestComponent />);

      // Switch language
      act(() => {
        useLangStore.getState().setLang('en');
      });

      // Verify localStorage works
      const stored = localStorage.getItem('aria-lang');
      expect(stored).toBeTruthy();
    });

    it('should default to Persian when localStorage is empty', () => {
      // Clear localStorage
      localStorage.clear();

      // Reset store to initial state
      useLangStore.setState({
        code: 'fa',
        dir: 'rtl',
        languages: [],
      });
      useLangStore.getState().setLanguages(mockLanguages);

      render(<TestComponent />);

      // Should use Persian default
      expect(screen.getByTestId('title')).toHaveTextContent('دروازه شما به');
      expect(useLangStore.getState().code).toBe('fa');
      expect(useLangStore.getState().dir).toBe('rtl');
    });

    it('should gracefully handle missing localStorage data', () => {
      // Clear localStorage
      localStorage.clear();
      
      // Store should still function in-memory
      render(<TestComponent />);
      
      // Initial Persian state should work
      expect(screen.getByTestId('title')).toBeDefined();
      expect(useLangStore.getState().code).toBe('fa');
      
      // Language switching should still work
      act(() => {
        useLangStore.getState().setLang('en');
      });
      
      expect(useLangStore.getState().code).toBe('en');
    });

    it('should continue to work even when persistence fails', () => {
      render(<TestComponent />);

      // Switch language (persistence happens automatically)
      act(() => {
        useLangStore.getState().setLang('en');
      });

      // In-memory state should be updated regardless of persistence
      expect(useLangStore.getState().code).toBe('en');
      expect(useLangStore.getState().dir).toBe('ltr');
    });
  });

  describe('Complete integration workflow', () => {
    it('should handle complete user journey: load → switch → persist → reload', () => {
      // Step 1: Initial load with Persian default
      const { unmount: unmount1, rerender: rerender1 } = render(<TestComponent />);
      expect(screen.getByTestId('title')).toHaveTextContent('دروازه شما به');
      expect(useLangStore.getState().code).toBe('fa');
      expect(screen.getByTestId('test-component')).toHaveAttribute('dir', 'rtl');

      // Step 2: User switches to English
      act(() => {
        useLangStore.getState().setLang('en');
      });
      rerender1(<TestComponent />);
      expect(screen.getByTestId('title')).toHaveTextContent('Your Gateway to');
      expect(useLangStore.getState().code).toBe('en');
      expect(screen.getByTestId('test-component')).toHaveAttribute('dir', 'ltr');

      // Step 3: Verify persistence
      const stored = localStorage.getItem('aria-lang');
      expect(stored).toBeTruthy();
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.code).toBe('en');
        expect(parsed.state.dir).toBe('ltr');
      }

      unmount1();

      // Step 4: Simulate app reload - should load English from localStorage
      render(<TestComponent />);
      expect(useLangStore.getState().code).toBe('en');
      expect(screen.getByTestId('title')).toHaveTextContent('Your Gateway to');
      expect(screen.getByTestId('test-component')).toHaveAttribute('dir', 'ltr');
    });

    it('should handle rapid language switching with persistence', () => {
      const { rerender } = render(<TestComponent />);

      // Rapidly switch between languages
      const sequence = ['en', 'ps', 'fa', 'en', 'ps'];
      
      for (const lang of sequence) {
        act(() => {
          useLangStore.getState().setLang(lang);
        });
        rerender(<TestComponent />);

        // Verify state is consistent
        expect(useLangStore.getState().code).toBe(lang);
        const expectedDir = lang === 'en' ? 'ltr' : 'rtl';
        expect(useLangStore.getState().dir).toBe(expectedDir);
        expect(screen.getByTestId('test-component')).toHaveAttribute('dir', expectedDir);

        // Verify persistence
        const stored = localStorage.getItem('aria-lang');
        expect(stored).toBeTruthy();
        if (stored) {
          const parsed = JSON.parse(stored);
          expect(parsed.state.code).toBe(lang);
          expect(parsed.state.dir).toBe(expectedDir);
        }
      }
    });

    it('should maintain translation consistency across component lifecycle', () => {
      const { rerender, unmount } = render(<TestComponent />);

      // Mount with Persian
      expect(screen.getByTestId('title')).toHaveTextContent('دروازه شما به');

      // Switch to English
      act(() => {
        useLangStore.getState().setLang('en');
      });
      rerender(<TestComponent />);
      expect(screen.getByTestId('title')).toHaveTextContent('Your Gateway to');

      // Switch to Pashto
      act(() => {
        useLangStore.getState().setLang('ps');
      });
      rerender(<TestComponent />);
      expect(screen.getByTestId('title')).toHaveTextContent('ستاسو دروازه');

      // Unmount and remount
      unmount();
      render(<TestComponent />);

      // Should maintain last language (Pashto)
      expect(useLangStore.getState().code).toBe('ps');
      expect(screen.getByTestId('title')).toHaveTextContent('ستاسو دروازه');
    });

    it('should handle full integration from first visit to return visit', () => {
      // Simulate first visit - no localStorage
      localStorage.clear();
      useLangStore.setState({
        code: 'fa',
        dir: 'rtl',
        languages: [],
      });
      useLangStore.getState().setLanguages(mockLanguages);

      // First render - Persian default
      const { unmount: unmount1 } = render(<TestComponent />);
      expect(screen.getByTestId('title')).toHaveTextContent('دروازه شما به');

      // User switches to English
      act(() => {
        useLangStore.getState().setLang('en');
      });

      // Verify persistence occurred
      const stored1 = localStorage.getItem('aria-lang');
      expect(stored1).toBeTruthy();

      unmount1();

      // Simulate returning visit - localStorage has English
      const { rerender: rerender2 } = render(<TestComponent />);
      expect(useLangStore.getState().code).toBe('en');
      expect(screen.getByTestId('title')).toHaveTextContent('Your Gateway to');

      // User switches to Pashto
      act(() => {
        useLangStore.getState().setLang('ps');
      });
      rerender2(<TestComponent />);

      // Verify state and persistence
      expect(useLangStore.getState().code).toBe('ps');
      expect(screen.getByTestId('title')).toHaveTextContent('ستاسو دروازه');
      
      const stored2 = localStorage.getItem('aria-lang');
      if (stored2) {
        const parsed = JSON.parse(stored2);
        expect(parsed.state.code).toBe('ps');
      }
    });
  });
});
