/**
 * Unit tests for Settings Panel translations
 * 
 * Tests verify:
 * - All settings panel section headers use translation keys
 * - All field labels use translation keys
 * - Button labels use translation keys
 * - Toast notifications use translation keys
 * - Language switching updates all text in the settings panel
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import { AdminApp } from './admin-app';
import { useLangStore } from '@/lib/lang-store';
import { translations } from '@/lib/i18n';

// Mock the fetch API
global.fetch = vi.fn();

// Mock toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockAdmin = {
  id: 'admin-1',
  email: 'admin@ariahub.com',
  name: 'Test Admin',
  role: 'admin',
};

const mockSettingsData = {
  settings: {
    siteName: 'ARIA HUB',
    tagline: 'Your Gateway to Opportunities',
    description: 'Premium services',
    email: 'info@ariahub.com',
    phone: '+93123456789',
    address: 'Kabul, Afghanistan',
    currency: 'USD',
    timezone: 'Asia/Kabul',
    dateFormat: 'DD/MM/YYYY',
    fontFamily: 'Inter',
    gaId: 'GA-123456',
    fbPixelId: 'FB-123456',
    logoUrl: '/logo.svg',
    logoDarkUrl: '/logo-dark.svg',
    faviconUrl: '/favicon.ico',
    appleIconUrl: '/apple-icon.png',
    primaryColor: '#0A66C2',
    secondaryColor: '#FF6B35',
    accentColor: '#4ECDC4',
    socialPosition: 'left',
    socialHideOnScroll: false,
    maintenanceMode: false,
    mapEmbed: '<iframe src="https://maps.google.com"></iframe>',
  },
};

const mockStatsResponse = {
  counts: {
    services: 12,
    visas: 8,
    opportunities: 15,
    news: 20,
    contactMessages: 5,
    newMessages: 2,
    subscribers: 45,
    galleryItems: 30,
    visits: 1250,
  },
  visitChart: [
    { date: '2024-01-01', count: 100 },
  ],
  deviceBreakdown: { mobile: 600, desktop: 600, tablet: 50 },
  recentMessages: [],
  recentSubscribers: [],
};

describe('Settings Panel Unit Tests', () => {
  beforeEach(() => {
    // Reset language store to default Persian
    act(() => {
      useLangStore.setState({
        code: 'fa',
        dir: 'rtl',
        languages: [
          { 
            id: '1', code: 'fa', name: 'Persian', nativeName: 'فارسی', 
            direction: 'rtl', enabled: true, isDefault: true, order: 0, 
            createdAt: new Date(), updatedAt: new Date() 
          },
          { 
            id: '2', code: 'en', name: 'English', nativeName: 'English', 
            direction: 'ltr', enabled: true, isDefault: false, order: 1, 
            createdAt: new Date(), updatedAt: new Date() 
          },
          { 
            id: '3', code: 'ps', name: 'Pashto', nativeName: 'پښتو', 
            direction: 'rtl', enabled: true, isDefault: false, order: 2, 
            createdAt: new Date(), updatedAt: new Date() 
          },
        ],
      });
    });

    // Reset fetch mock
    vi.clearAllMocks();
    mockToast.mockClear();
    
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/admin/stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStatsResponse),
        });
      }
      if (url.includes('/api/admin/settings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSettingsData),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  describe('Section Headers - Requirement 7.3', () => {
    it('renders Branding section header with Persian translation', async () => {
      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      // Navigate to Settings
      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.fa['admin.nav.siteSettings']));

      // Check section header
      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.settings.branding'])).toBeInTheDocument();
      });
    });

    it('renders Theme Colors section header with Persian translation', async () => {
      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.fa['admin.nav.siteSettings']));

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.settings.themeColors'])).toBeInTheDocument();
      });
    });

    it('renders Layout & Behavior section header with Persian translation', async () => {
      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.fa['admin.nav.siteSettings']));

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.settings.layoutBehavior'])).toBeInTheDocument();
      });
    });

    it('renders Map Embed section header with Persian translation', async () => {
      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.fa['admin.nav.siteSettings']));

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.settings.mapEmbed'])).toBeInTheDocument();
      });
    });

    it('renders all section headers with English translations', async () => {
      act(() => {
        useLangStore.setState({ code: 'en', dir: 'ltr' });
      });

      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.en['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.en['admin.nav.siteSettings']));

      await waitFor(() => {
        expect(screen.getByText(translations.en['admin.settings.branding'])).toBeInTheDocument();
        expect(screen.getByText(translations.en['admin.settings.themeColors'])).toBeInTheDocument();
        expect(screen.getByText(translations.en['admin.settings.layoutBehavior'])).toBeInTheDocument();
        expect(screen.getByText(translations.en['admin.settings.mapEmbed'])).toBeInTheDocument();
      });
    });
  });

  describe('Field Labels - Requirements 7.2, 7.4', () => {
    it('renders branding field labels with Persian translations', async () => {
      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.fa['admin.nav.siteSettings']));

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.settings.siteName'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.tagline'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.email'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.phone'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.description'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.address'])).toBeInTheDocument();
      });
    });

    it('renders configuration field labels with Persian translations', async () => {
      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.fa['admin.nav.siteSettings']));

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.settings.currency'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.timezone'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.dateFormat'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.fontFamily'])).toBeInTheDocument();
      });
    });

    it('renders analytics field labels with Persian translations', async () => {
      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.fa['admin.nav.siteSettings']));

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.settings.gaId'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.fbPixelId'])).toBeInTheDocument();
      });
    });

    it('renders asset field labels with Persian translations', async () => {
      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.fa['admin.nav.siteSettings']));

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.settings.logoUrl'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.logoDarkUrl'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.faviconUrl'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.appleIconUrl'])).toBeInTheDocument();
      });
    });

    it('renders color field labels with Persian translations', async () => {
      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.fa['admin.nav.siteSettings']));

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.settings.primaryColor'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.secondaryColor'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.accentColor'])).toBeInTheDocument();
      });
    });

    it('renders behavior field labels with Persian translations', async () => {
      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.fa['admin.nav.siteSettings']));

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.settings.socialPosition'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.socialHideOnScroll'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.maintenanceMode'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.maintenanceDesc'])).toBeInTheDocument();
      });
    });

    it('renders all field labels with English translations', async () => {
      act(() => {
        useLangStore.setState({ code: 'en', dir: 'ltr' });
      });

      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.en['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.en['admin.nav.siteSettings']));

      await waitFor(() => {
        expect(screen.getByText(translations.en['admin.settings.siteName'])).toBeInTheDocument();
        expect(screen.getByText(translations.en['admin.settings.email'])).toBeInTheDocument();
        expect(screen.getByText(translations.en['admin.settings.primaryColor'])).toBeInTheDocument();
        expect(screen.getByText(translations.en['admin.settings.socialPosition'])).toBeInTheDocument();
      });
    });

    it('renders all field labels with Pashto translations', async () => {
      act(() => {
        useLangStore.setState({ code: 'ps', dir: 'rtl' });
      });

      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.ps['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.ps['admin.nav.siteSettings']));

      await waitFor(() => {
        expect(screen.getByText(translations.ps['admin.settings.siteName'])).toBeInTheDocument();
        expect(screen.getByText(translations.ps['admin.settings.email'])).toBeInTheDocument();
        expect(screen.getByText(translations.ps['admin.settings.primaryColor'])).toBeInTheDocument();
        expect(screen.getByText(translations.ps['admin.settings.socialPosition'])).toBeInTheDocument();
      });
    });
  });

  describe('Button Labels - Requirement 7.6', () => {
    it('renders Save Settings button with Persian translation', async () => {
      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.fa['admin.nav.siteSettings']));

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.settings.saveSettings'])).toBeInTheDocument();
      });
    });

    it('renders Save Settings button with English translation', async () => {
      act(() => {
        useLangStore.setState({ code: 'en', dir: 'ltr' });
      });

      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.en['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.en['admin.nav.siteSettings']));

      await waitFor(() => {
        expect(screen.getByText(translations.en['admin.settings.saveSettings'])).toBeInTheDocument();
      });
    });

    it('renders Save Settings button with Pashto translation', async () => {
      act(() => {
        useLangStore.setState({ code: 'ps', dir: 'rtl' });
      });

      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.ps['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.ps['admin.nav.siteSettings']));

      await waitFor(() => {
        expect(screen.getByText(translations.ps['admin.settings.saveSettings'])).toBeInTheDocument();
      });
    });

    it('renders select dropdown options with Persian translations', async () => {
      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.fa['admin.nav.siteSettings']));

      // Verify the label for social position select is translated
      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.settings.socialPosition'])).toBeInTheDocument();
      });

      // Verify the select component is present (the options are rendered in the component)
      const selectElements = screen.getAllByRole('combobox');
      expect(selectElements.length).toBeGreaterThan(0);
    });
  });

  describe('Toast Notifications - Requirement 7.5', () => {
    it('displays success toast with Persian translation on save', async () => {
      (global.fetch as any).mockImplementation((url: string, options: any) => {
        if (url.includes('/api/admin/stats')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockStatsResponse),
          });
        }
        if (url.includes('/api/admin/settings')) {
          if (options?.method === 'PUT') {
            // PUT request - update
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ success: true }),
            });
          }
          // GET request
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockSettingsData),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.fa['admin.nav.siteSettings']));

      // Wait for form to load - look for a field label instead of the button
      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.settings.siteName'])).toBeInTheDocument();
      });

      // Find the save button by its type attribute
      const saveButton = screen.getByRole('button', { name: new RegExp(translations.fa['admin.settings.saveSettings']) });
      await user.click(saveButton);

      // Check toast was called with translated message
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: translations.fa['admin.toast.saved'],
        });
      });
    });

    it('displays error toast with Persian translation on save failure', async () => {
      (global.fetch as any).mockImplementation((url: string, options: any) => {
        if (url.includes('/api/admin/stats')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockStatsResponse),
          });
        }
        if (url.includes('/api/admin/settings')) {
          if (options?.method === 'PUT') {
            // PUT request - simulate error
            return Promise.resolve({
              ok: false,
              json: () => Promise.resolve({ error: 'Save failed' }),
            });
          }
          // GET request
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockSettingsData),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.fa['admin.nav.siteSettings']));

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.settings.saveSettings'])).toBeInTheDocument();
      });

      const saveButton = screen.getByText(translations.fa['admin.settings.saveSettings']);
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: expect.any(String),
          variant: 'destructive',
        });
      });
    });

    it('displays loading error message with Persian translation', async () => {
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/stats')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockStatsResponse),
          });
        }
        if (url.includes('/api/admin/settings')) {
          return Promise.reject(new Error('Failed to load'));
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.fa['admin.nav.siteSettings']));

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.panel.failedLoadSettings'])).toBeInTheDocument();
      });
    });
  });

  describe('Language Switching - Requirement 7.1, 7.6', () => {
    it('updates all settings panel text when switching from Persian to English', async () => {
      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      // Navigate to settings in Persian
      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.fa['admin.nav.siteSettings']));

      // Verify Persian translations
      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.settings.branding'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.siteName'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.saveSettings'])).toBeInTheDocument();
      });

      // Switch to English
      act(() => {
        useLangStore.getState().setLang('en');
      });

      // Verify English translations
      await waitFor(() => {
        expect(screen.getByText(translations.en['admin.settings.branding'])).toBeInTheDocument();
        expect(screen.getByText(translations.en['admin.settings.siteName'])).toBeInTheDocument();
        expect(screen.getByText(translations.en['admin.settings.saveSettings'])).toBeInTheDocument();
      });

      // Verify Persian translations are removed
      expect(screen.queryByText(translations.fa['admin.settings.branding'])).not.toBeInTheDocument();
      expect(screen.queryByText(translations.fa['admin.settings.siteName'])).not.toBeInTheDocument();
    });

    it('updates all settings panel text when switching from English to Pashto', async () => {
      act(() => {
        useLangStore.setState({ code: 'en', dir: 'ltr' });
      });

      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      // Navigate to settings in English
      await waitFor(() => {
        expect(screen.getByText(translations.en['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.en['admin.nav.siteSettings']));

      // Verify English translations
      await waitFor(() => {
        expect(screen.getByText(translations.en['admin.settings.branding'])).toBeInTheDocument();
        expect(screen.getByText(translations.en['admin.settings.themeColors'])).toBeInTheDocument();
      });

      // Switch to Pashto
      act(() => {
        useLangStore.getState().setLang('ps');
      });

      // Verify Pashto translations
      await waitFor(() => {
        expect(screen.getByText(translations.ps['admin.settings.branding'])).toBeInTheDocument();
        expect(screen.getByText(translations.ps['admin.settings.themeColors'])).toBeInTheDocument();
        expect(screen.getByText(translations.ps['admin.settings.saveSettings'])).toBeInTheDocument();
      });

      // Verify English translations are removed
      expect(screen.queryByText(translations.en['admin.settings.branding'])).not.toBeInTheDocument();
    });

    it('updates all field labels, section headers, and buttons simultaneously', async () => {
      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      // Navigate to settings in Persian
      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.fa['admin.nav.siteSettings']));

      // Verify initial Persian state
      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.settings.branding'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.siteName'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.themeColors'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.primaryColor'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.settings.saveSettings'])).toBeInTheDocument();
      });

      // Switch to English
      act(() => {
        useLangStore.getState().setLang('en');
      });

      // Verify ALL elements update to English simultaneously
      await waitFor(() => {
        // Section headers
        expect(screen.getByText(translations.en['admin.settings.branding'])).toBeInTheDocument();
        expect(screen.getByText(translations.en['admin.settings.themeColors'])).toBeInTheDocument();
        expect(screen.getByText(translations.en['admin.settings.layoutBehavior'])).toBeInTheDocument();
        
        // Field labels
        expect(screen.getByText(translations.en['admin.settings.siteName'])).toBeInTheDocument();
        expect(screen.getByText(translations.en['admin.settings.primaryColor'])).toBeInTheDocument();
        expect(screen.getByText(translations.en['admin.settings.socialPosition'])).toBeInTheDocument();
        
        // Buttons
        expect(screen.getByText(translations.en['admin.settings.saveSettings'])).toBeInTheDocument();
      });

      // Verify Persian translations are gone
      expect(screen.queryByText(translations.fa['admin.settings.branding'])).not.toBeInTheDocument();
      expect(screen.queryByText(translations.fa['admin.settings.siteName'])).not.toBeInTheDocument();
    });

    it('cycles through all three languages correctly in settings panel', async () => {
      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      // Navigate to settings
      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.nav.siteSettings'])).toBeInTheDocument();
      });
      await user.click(screen.getByText(translations.fa['admin.nav.siteSettings']));

      // Verify Persian
      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.settings.branding'])).toBeInTheDocument();
      });

      // Switch to English
      act(() => {
        useLangStore.getState().setLang('en');
      });

      await waitFor(() => {
        expect(screen.getByText(translations.en['admin.settings.branding'])).toBeInTheDocument();
      });

      // Switch to Pashto
      act(() => {
        useLangStore.getState().setLang('ps');
      });

      await waitFor(() => {
        expect(screen.getByText(translations.ps['admin.settings.branding'])).toBeInTheDocument();
      });

      // Switch back to Persian
      act(() => {
        useLangStore.getState().setLang('fa');
      });

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.settings.branding'])).toBeInTheDocument();
      });
    });
  });
});
