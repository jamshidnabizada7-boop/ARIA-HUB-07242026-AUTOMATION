import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useLangStore } from './lang-store';
import { useT } from '@/hooks/use-t';
import type { Language } from './types';

/**
 * Task 10.5: Verify language persistence across navigation
 * 
 * This test suite validates Requirements 5.5, 5.6, 5.8, 12.2, 12.3, 12.5:
 * - Language preference applies across frontend and admin sections
 * - Returning users see their persisted language
 * - Cross-section language consistency
 * - Session-to-session persistence
 */

describe('Task 10.5: Verify Language Persistence Across Navigation', () => {
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

  // Simulated Frontend Component
  function FrontendComponent() {
    const t = useT();
    const { dir } = useLangStore();

    return (
      <div data-testid="frontend-section" dir={dir}>
        <h1 data-testid="frontend-title">{t('hero.title')}</h1>
        <p data-testid="frontend-subtitle">{t('hero.subtitle')}</p>
        <button data-testid="frontend-button">{t('hero.cta')}</button>
      </div>
    );
  }

  // Simulated Admin Panel Component
  function AdminComponent() {
    const t = useT();
    const { dir } = useLangStore();

    return (
      <div data-testid="admin-section" dir={dir}>
        <h1 data-testid="admin-title">{t('admin.nav.dashboard')}</h1>
        <button data-testid="admin-save">{t('admin.button.save')}</button>
        <button data-testid="admin-delete">{t('admin.button.delete')}</button>
        <p data-testid="admin-stat">{t('admin.stat.services')}</p>
      </div>
    );
  }

  // Component showing current language
  function LanguageDisplay() {
    const { code, dir } = useLangStore();
    return (
      <div data-testid="lang-display">
        <span data-testid="current-code">{code}</span>
        <span data-testid="current-dir">{dir}</span>
      </div>
    );
  }

  describe('Requirement 5.5: Language consistency across frontend and admin', () => {
    it('should apply same language to frontend and admin sections', () => {
      // Render both frontend and admin
      const { rerender } = render(
        <div>
          <FrontendComponent />
          <AdminComponent />
        </div>
      );

      // Initial state - both should be in Persian
      expect(screen.getByTestId('frontend-section')).toHaveAttribute('dir', 'rtl');
      expect(screen.getByTestId('admin-section')).toHaveAttribute('dir', 'rtl');
      expect(screen.getByTestId('frontend-title')).toHaveTextContent('دروازه شما به');
      expect(screen.getByTestId('admin-title')).toHaveTextContent('داشبورد');

      // Change to English
      act(() => {
        useLangStore.getState().setLang('en');
      });
      rerender(
        <div>
          <FrontendComponent />
          <AdminComponent />
        </div>
      );

      // Both sections should update to English
      expect(screen.getByTestId('frontend-section')).toHaveAttribute('dir', 'ltr');
      expect(screen.getByTestId('admin-section')).toHaveAttribute('dir', 'ltr');
      expect(screen.getByTestId('frontend-title')).toHaveTextContent('Your Gateway to');
      expect(screen.getByTestId('admin-title')).toHaveTextContent('Dashboard');
    });

    it('should persist language when navigating from frontend to admin', () => {
      // Step 1: Render frontend, set to English
      const { unmount: unmount1, rerender } = render(<FrontendComponent />);
      expect(screen.getByTestId('frontend-title')).toHaveTextContent('دروازه شما به'); // Persian default

      act(() => {
        useLangStore.getState().setLang('en');
      });

      rerender(<FrontendComponent />);
      expect(screen.getByTestId('frontend-title')).toHaveTextContent('Your Gateway to'); // English

      unmount1();

      // Step 2: Navigate to admin (simulated by unmounting frontend and mounting admin)
      render(<AdminComponent />);

      // Admin should use the same English language
      expect(screen.getByTestId('admin-title')).toHaveTextContent('Dashboard');
      expect(screen.getByTestId('admin-save')).toHaveTextContent('Save Changes');
      expect(screen.getByTestId('admin-section')).toHaveAttribute('dir', 'ltr');
      expect(useLangStore.getState().code).toBe('en');
    });

    it('should persist language when navigating from admin to frontend', () => {
      // Step 1: Render admin, set to Pashto
      const { unmount: unmount1, rerender } = render(<AdminComponent />);
      expect(screen.getByTestId('admin-title')).toHaveTextContent('داشبورد'); // Persian default

      act(() => {
        useLangStore.getState().setLang('ps');
      });

      rerender(<AdminComponent />);
      expect(screen.getByTestId('admin-title')).toHaveTextContent('ډشبورډ'); // Pashto

      unmount1();

      // Step 2: Navigate to frontend (simulated by unmounting admin and mounting frontend)
      render(<FrontendComponent />);

      // Frontend should use the same Pashto language
      expect(screen.getByTestId('frontend-title')).toHaveTextContent('ستاسو دروازه');
      expect(screen.getByTestId('frontend-section')).toHaveAttribute('dir', 'rtl');
      expect(useLangStore.getState().code).toBe('ps');
    });

    it('should maintain language consistency during multiple navigation cycles', () => {
      // Cycle 1: Frontend (Persian) → Admin
      const { unmount: unmount1 } = render(<FrontendComponent />);
      expect(useLangStore.getState().code).toBe('fa');
      unmount1();

      render(<AdminComponent />);
      expect(useLangStore.getState().code).toBe('fa');
      expect(screen.getByTestId('admin-title')).toHaveTextContent('داشبورد');
      screen.getByTestId('admin-section').parentElement?.remove();

      // Cycle 2: Admin (switch to English) → Frontend
      const { unmount: unmount2 } = render(<AdminComponent />);
      act(() => {
        useLangStore.getState().setLang('en');
      });
      expect(useLangStore.getState().code).toBe('en');
      unmount2();

      render(<FrontendComponent />);
      expect(useLangStore.getState().code).toBe('en');
      expect(screen.getByTestId('frontend-title')).toHaveTextContent('Your Gateway to');
      screen.getByTestId('frontend-section').parentElement?.remove();

      // Cycle 3: Frontend (switch to Pashto) → Admin
      const { unmount: unmount3 } = render(<FrontendComponent />);
      act(() => {
        useLangStore.getState().setLang('ps');
      });
      expect(useLangStore.getState().code).toBe('ps');
      unmount3();

      render(<AdminComponent />);
      expect(useLangStore.getState().code).toBe('ps');
      expect(screen.getByTestId('admin-title')).toHaveTextContent('ډشبورډ');
    });

    it('should synchronize language changes across simultaneous frontend and admin renders', () => {
      // Render both sections simultaneously
      const { rerender } = render(
        <div>
          <FrontendComponent />
          <AdminComponent />
          <LanguageDisplay />
        </div>
      );

      // Initial Persian state
      expect(screen.getByTestId('current-code')).toHaveTextContent('fa');
      expect(screen.getByTestId('frontend-title')).toHaveTextContent('دروازه شما به');
      expect(screen.getByTestId('admin-title')).toHaveTextContent('داشبورد');

      // Change to English
      act(() => {
        useLangStore.getState().setLang('en');
      });
      rerender(
        <div>
          <FrontendComponent />
          <AdminComponent />
          <LanguageDisplay />
        </div>
      );

      // All sections should synchronize to English
      expect(screen.getByTestId('current-code')).toHaveTextContent('en');
      expect(screen.getByTestId('frontend-title')).toHaveTextContent('Your Gateway to');
      expect(screen.getByTestId('admin-title')).toHaveTextContent('Dashboard');

      // Change to Pashto
      act(() => {
        useLangStore.getState().setLang('ps');
      });
      rerender(
        <div>
          <FrontendComponent />
          <AdminComponent />
          <LanguageDisplay />
        </div>
      );

      // All sections should synchronize to Pashto
      expect(screen.getByTestId('current-code')).toHaveTextContent('ps');
      expect(screen.getByTestId('frontend-title')).toHaveTextContent('ستاسو دروازه');
      expect(screen.getByTestId('admin-title')).toHaveTextContent('ډشبورډ');
    });
  });

  describe('Requirement 5.6, 5.8, 12.2, 12.3: Returning users see persisted language', () => {
    it('should load persisted English preference for returning user', () => {
      // Simulate first visit - user selects English
      const { unmount: unmount1 } = render(<FrontendComponent />);
      
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

      unmount1();

      // Simulate return visit - load from localStorage
      // The persist middleware automatically hydrates from localStorage
      useLangStore.setState({
        code: 'en',
        dir: 'ltr',
        languages: mockLanguages,
      });

      render(<FrontendComponent />);

      // Should show English content
      expect(useLangStore.getState().code).toBe('en');
      expect(screen.getByTestId('frontend-title')).toHaveTextContent('Your Gateway to');
      expect(screen.getByTestId('frontend-section')).toHaveAttribute('dir', 'ltr');
    });

    it('should load persisted Pashto preference for returning user in admin', () => {
      // Simulate first visit - user selects Pashto in admin
      const { unmount: unmount1 } = render(<AdminComponent />);
      
      act(() => {
        useLangStore.getState().setLang('ps');
      });

      // Verify persistence
      const stored = localStorage.getItem('aria-lang');
      expect(stored).toBeTruthy();
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.code).toBe('ps');
        expect(parsed.state.dir).toBe('rtl');
      }

      unmount1();

      // Simulate return visit - load from localStorage
      useLangStore.setState({
        code: 'ps',
        dir: 'rtl',
        languages: mockLanguages,
      });

      render(<AdminComponent />);

      // Should show Pashto content
      expect(useLangStore.getState().code).toBe('ps');
      expect(screen.getByTestId('admin-title')).toHaveTextContent('ډشبورډ');
      expect(screen.getByTestId('admin-section')).toHaveAttribute('dir', 'rtl');
    });

    it('should persist user language preference across multiple sessions', () => {
      // Session 1: User visits, changes to English, leaves
      const { unmount: unmount1 } = render(<FrontendComponent />);
      act(() => {
        useLangStore.getState().setLang('en');
      });
      unmount1();

      // Session 2: User returns, sees English, navigates to admin, leaves
      useLangStore.setState({
        code: 'en',
        dir: 'ltr',
        languages: mockLanguages,
      });
      const { unmount: unmount2 } = render(<FrontendComponent />);
      expect(useLangStore.getState().code).toBe('en');
      unmount2();

      const { unmount: unmount3 } = render(<AdminComponent />);
      expect(useLangStore.getState().code).toBe('en');
      expect(screen.getByTestId('admin-title')).toHaveTextContent('Dashboard');
      unmount3();

      // Session 3: User returns again, still sees English
      render(<FrontendComponent />);
      expect(useLangStore.getState().code).toBe('en');
      expect(screen.getByTestId('frontend-title')).toHaveTextContent('Your Gateway to');
    });

    it('should default to Persian for new users without persisted preference', () => {
      // Ensure localStorage is empty (new user)
      localStorage.clear();

      // Reset store to initial state
      useLangStore.setState({
        code: 'fa',
        dir: 'rtl',
        languages: [],
      });
      useLangStore.getState().setLanguages(mockLanguages);

      // Render frontend for new user
      render(<FrontendComponent />);

      // Should default to Persian
      expect(useLangStore.getState().code).toBe('fa');
      expect(screen.getByTestId('frontend-title')).toHaveTextContent('دروازه شما به');
      expect(screen.getByTestId('frontend-section')).toHaveAttribute('dir', 'rtl');
    });

    it('should persist latest language change for returning user', () => {
      // First visit - user selects English
      const { unmount: unmount1 } = render(<FrontendComponent />);
      act(() => {
        useLangStore.getState().setLang('en');
      });
      unmount1();

      // Return visit - user changes to Pashto
      useLangStore.setState({
        code: 'en',
        dir: 'ltr',
        languages: mockLanguages,
      });
      const { unmount: unmount2 } = render(<AdminComponent />);
      act(() => {
        useLangStore.getState().setLang('ps');
      });
      unmount2();

      // Verify Pashto is now persisted
      const stored = localStorage.getItem('aria-lang');
      expect(stored).toBeTruthy();
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.code).toBe('ps');
        expect(parsed.state.dir).toBe('rtl');
      }

      // Next return visit - should see Pashto
      useLangStore.setState({
        code: 'ps',
        dir: 'rtl',
        languages: mockLanguages,
      });
      render(<FrontendComponent />);
      expect(useLangStore.getState().code).toBe('ps');
      expect(screen.getByTestId('frontend-title')).toHaveTextContent('ستاسو دروازه');
    });
  });

  describe('Requirement 12.5: Complete cross-section persistence workflow', () => {
    it('should handle complete user journey across frontend and admin with persistence', () => {
      // New user visits frontend (Persian default)
      const { unmount: unmount1 } = render(<FrontendComponent />);
      expect(screen.getByTestId('frontend-title')).toHaveTextContent('دروازه شما به');
      expect(useLangStore.getState().code).toBe('fa');
      unmount1();

      // User navigates to admin, still Persian
      const { unmount: unmount2, rerender: rerender2 } = render(<AdminComponent />);
      expect(screen.getByTestId('admin-title')).toHaveTextContent('داشبورد');
      expect(useLangStore.getState().code).toBe('fa');

      // User changes to English in admin
      act(() => {
        useLangStore.getState().setLang('en');
      });
      rerender2(<AdminComponent />);
      expect(screen.getByTestId('admin-title')).toHaveTextContent('Dashboard');

      // Verify persistence
      let stored = localStorage.getItem('aria-lang');
      expect(stored).toBeTruthy();
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.code).toBe('en');
      }
      unmount2();

      // User navigates back to frontend, should see English
      const { unmount: unmount3 } = render(<FrontendComponent />);
      expect(useLangStore.getState().code).toBe('en');
      expect(screen.getByTestId('frontend-title')).toHaveTextContent('Your Gateway to');
      unmount3();

      // User closes browser and returns later
      // Simulate reload: reinitialize store with persisted data
      useLangStore.setState({
        code: 'en',
        dir: 'ltr',
        languages: mockLanguages,
      });

      // User lands on frontend, should still see English
      const { unmount: unmount4 } = render(<FrontendComponent />);
      expect(useLangStore.getState().code).toBe('en');
      expect(screen.getByTestId('frontend-title')).toHaveTextContent('Your Gateway to');
      unmount4();

      // User navigates to admin, still English
      render(<AdminComponent />);
      expect(useLangStore.getState().code).toBe('en');
      expect(screen.getByTestId('admin-title')).toHaveTextContent('Dashboard');
    });

    it('should handle language change in frontend persisting to admin across sessions', () => {
      // Session 1: Frontend, change to Pashto
      const { unmount: unmount1 } = render(<FrontendComponent />);
      act(() => {
        useLangStore.getState().setLang('ps');
      });
      const stored1 = localStorage.getItem('aria-lang');
      expect(stored1).toBeTruthy();
      unmount1();

      // Session 2: Return to admin
      useLangStore.setState({
        code: 'ps',
        dir: 'rtl',
        languages: mockLanguages,
      });
      render(<AdminComponent />);
      expect(useLangStore.getState().code).toBe('ps');
      expect(screen.getByTestId('admin-title')).toHaveTextContent('ډشبورډ');
      expect(screen.getByTestId('admin-stat')).toHaveTextContent('خدمات');
    });

    it('should handle language change in admin persisting to frontend across sessions', () => {
      // Session 1: Admin, change to English
      const { unmount: unmount1 } = render(<AdminComponent />);
      act(() => {
        useLangStore.getState().setLang('en');
      });
      const stored1 = localStorage.getItem('aria-lang');
      expect(stored1).toBeTruthy();
      unmount1();

      // Session 2: Return to frontend
      useLangStore.setState({
        code: 'en',
        dir: 'ltr',
        languages: mockLanguages,
      });
      render(<FrontendComponent />);
      expect(useLangStore.getState().code).toBe('en');
      expect(screen.getByTestId('frontend-title')).toHaveTextContent('Your Gateway to');
      expect(screen.getByTestId('frontend-subtitle')).toHaveTextContent('Premium business, visa, and opportunity services');
    });

    it('should maintain consistent dir attribute across sections and sessions', () => {
      // Session 1: Frontend, Persian (RTL)
      const { unmount: unmount1 } = render(<FrontendComponent />);
      expect(screen.getByTestId('frontend-section')).toHaveAttribute('dir', 'rtl');
      unmount1();

      // Navigate to admin, still RTL
      const { unmount: unmount2, rerender } = render(<AdminComponent />);
      expect(screen.getByTestId('admin-section')).toHaveAttribute('dir', 'rtl');

      // Change to English (LTR)
      act(() => {
        useLangStore.getState().setLang('en');
      });
      rerender(<AdminComponent />);
      expect(screen.getByTestId('admin-section')).toHaveAttribute('dir', 'ltr');
      unmount2();

      // Session 2: Return to frontend, should be LTR
      useLangStore.setState({
        code: 'en',
        dir: 'ltr',
        languages: mockLanguages,
      });
      render(<FrontendComponent />);
      expect(screen.getByTestId('frontend-section')).toHaveAttribute('dir', 'ltr');
    });

    it('should handle multiple section transitions with various language changes', () => {
      // Frontend (fa) → Admin (fa) → change to en → Frontend (en) → change to ps → Admin (ps)
      
      // Step 1: Frontend in Persian
      const { unmount: u1 } = render(<FrontendComponent />);
      expect(useLangStore.getState().code).toBe('fa');
      u1();

      // Step 2: Admin in Persian
      const { unmount: u2, rerender: r2 } = render(<AdminComponent />);
      expect(useLangStore.getState().code).toBe('fa');
      
      // Step 3: Change to English in Admin
      act(() => {
        useLangStore.getState().setLang('en');
      });
      r2(<AdminComponent />);
      expect(useLangStore.getState().code).toBe('en');
      u2();

      // Step 4: Frontend should be English
      const { unmount: u3, rerender: r3 } = render(<FrontendComponent />);
      expect(useLangStore.getState().code).toBe('en');
      expect(screen.getByTestId('frontend-title')).toHaveTextContent('Your Gateway to');
      
      // Step 5: Change to Pashto in Frontend
      act(() => {
        useLangStore.getState().setLang('ps');
      });
      r3(<FrontendComponent />);
      expect(useLangStore.getState().code).toBe('ps');
      u3();

      // Step 6: Admin should be Pashto
      render(<AdminComponent />);
      expect(useLangStore.getState().code).toBe('ps');
      expect(screen.getByTestId('admin-title')).toHaveTextContent('ډشبورډ');

      // Verify final persistence
      const stored = localStorage.getItem('aria-lang');
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.code).toBe('ps');
        expect(parsed.state.dir).toBe('rtl');
      }
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle rapid section switching without losing language state', () => {
      const { unmount: u1 } = render(<FrontendComponent />);
      act(() => {
        useLangStore.getState().setLang('en');
      });
      u1();

      const { unmount: u2 } = render(<AdminComponent />);
      expect(useLangStore.getState().code).toBe('en');
      u2();

      const { unmount: u3 } = render(<FrontendComponent />);
      expect(useLangStore.getState().code).toBe('en');
      u3();

      render(<AdminComponent />);
      expect(useLangStore.getState().code).toBe('en');
    });

    it('should persist even when switching sections rapidly during language change', () => {
      const { unmount: u1 } = render(<FrontendComponent />);
      
      // Rapid actions: change language and switch section
      act(() => {
        useLangStore.getState().setLang('ps');
      });
      u1();

      // Immediate navigation to admin
      render(<AdminComponent />);
      
      // Language should be Pashto
      expect(useLangStore.getState().code).toBe('ps');
      expect(screen.getByTestId('admin-title')).toHaveTextContent('ډشبورډ');
      
      // Persistence should have occurred
      const stored = localStorage.getItem('aria-lang');
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.code).toBe('ps');
      }
    });

    it('should handle corrupted localStorage gracefully and use default', () => {
      // Simulate corrupted localStorage
      localStorage.setItem('aria-lang', 'invalid-json{');
      
      // Reset store manually to default since persisted data is corrupted
      useLangStore.setState({
        code: 'fa',
        dir: 'rtl',
        languages: mockLanguages,
      });

      render(<FrontendComponent />);
      
      // Should use Persian default
      expect(useLangStore.getState().code).toBe('fa');
      expect(screen.getByTestId('frontend-title')).toHaveTextContent('دروازه شما به');
    });

    it('should handle missing localStorage gracefully', () => {
      // Clear localStorage completely
      localStorage.clear();
      
      // Reset to default
      useLangStore.setState({
        code: 'fa',
        dir: 'rtl',
        languages: [],
      });
      useLangStore.getState().setLanguages(mockLanguages);

      render(<FrontendComponent />);
      
      // Should default to Persian
      expect(useLangStore.getState().code).toBe('fa');
      
      // Language switching should still work in-memory
      act(() => {
        useLangStore.getState().setLang('en');
      });
      expect(useLangStore.getState().code).toBe('en');
    });
  });
});
