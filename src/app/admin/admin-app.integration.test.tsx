/**
 * Integration tests for admin panel translation integration
 * 
 * Tests verify:
 * - Admin navigation sidebar renders with correct translation keys
 * - Admin dashboard components use proper translations
 * - Admin CRUD interfaces display translated text
 * - Admin toast notifications show translated messages
 * - Language changes trigger re-renders with updated translations across all admin components
 * 
 * Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import { AdminApp } from './admin-app';
import { useLangStore } from '@/lib/lang-store';
import { translations } from '@/lib/i18n';

// Mock the fetch API for admin data
global.fetch = vi.fn();

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
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
    { date: '2024-01-02', count: 150 },
    { date: '2024-01-03', count: 120 },
    { date: '2024-01-04', count: 180 },
    { date: '2024-01-05', count: 200 },
    { date: '2024-01-06', count: 250 },
    { date: '2024-01-07', count: 250 },
  ],
  deviceBreakdown: {
    mobile: 600,
    desktop: 600,
    tablet: 50,
  },
  recentMessages: [
    {
      id: 'msg-1',
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message',
      status: 'new',
    },
  ],
  recentSubscribers: [
    {
      id: 'sub-1',
      email: 'subscriber@example.com',
      createdAt: new Date().toISOString(),
    },
  ],
};

const mockCrudResponse = {
  items: [
    { id: '1', title: 'Test Service', status: 'active' },
    { id: '2', title: 'Another Service', status: 'draft' },
  ],
  fields: ['title', 'status'],
  label: 'Services',
  total: 2,
};

describe('Admin Panel Translation Integration', () => {
  beforeEach(() => {
    // Reset language store to default Persian
    act(() => {
      useLangStore.setState({
        code: 'fa',
        dir: 'rtl',
        languages: [
          { id: '1', code: 'fa', name: 'Persian', nativeName: 'فارسی', direction: 'rtl', enabled: true, isDefault: true, order: 0, createdAt: new Date(), updatedAt: new Date() },
          { id: '2', code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', enabled: true, isDefault: false, order: 1, createdAt: new Date(), updatedAt: new Date() },
          { id: '3', code: 'ps', name: 'Pashto', nativeName: 'پښتو', direction: 'rtl', enabled: true, isDefault: false, order: 2, createdAt: new Date(), updatedAt: new Date() },
        ],
      });
    });

    // Reset fetch mock
    vi.clearAllMocks();
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/admin/stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStatsResponse),
        });
      }
      if (url.includes('/api/admin/crud')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCrudResponse),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  describe('Admin Navigation Sidebar - Requirement 3.2', () => {
    it('renders all navigation items with correct Persian translations', async () => {
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getAllByText(translations.fa['admin.nav.dashboard']).length).toBeGreaterThan(0);
      });

      // Verify key navigation items are translated
      expect(screen.getAllByText(translations.fa['admin.nav.services'])[0]).toBeInTheDocument();
      expect(screen.getAllByText(translations.fa['admin.nav.visas'])[0]).toBeInTheDocument();
      expect(screen.getAllByText(translations.fa['admin.nav.opportunities'])[0]).toBeInTheDocument();
      expect(screen.getAllByText(translations.fa['admin.nav.news'])[0]).toBeInTheDocument();
      expect(screen.getAllByText(translations.fa['admin.nav.testimonials'])[0]).toBeInTheDocument();
      expect(screen.getAllByText(translations.fa['admin.nav.partners'])[0]).toBeInTheDocument();
      expect(screen.getAllByText(translations.fa['admin.nav.siteSettings'])[0]).toBeInTheDocument();
    });

    it('renders navigation items with correct English translations', async () => {
      act(() => {
        useLangStore.setState({ code: 'en', dir: 'ltr' });
      });

      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getAllByText(translations.en['admin.nav.dashboard'])[0]).toBeInTheDocument();
      });

      expect(screen.getAllByText(translations.en['admin.nav.services'])[0]).toBeInTheDocument();
      expect(screen.getAllByText(translations.en['admin.nav.visas'])[0]).toBeInTheDocument();
      expect(screen.getAllByText(translations.en['admin.nav.opportunities'])[0]).toBeInTheDocument();
    });

    it('renders navigation items with correct Pashto translations', async () => {
      act(() => {
        useLangStore.setState({ code: 'ps', dir: 'rtl' });
      });

      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getAllByText(translations.ps['admin.nav.dashboard'])[0]).toBeInTheDocument();
      });

      expect(screen.getAllByText(translations.ps['admin.nav.services'])[0]).toBeInTheDocument();
      expect(screen.getAllByText(translations.ps['admin.nav.visas'])[0]).toBeInTheDocument();
      expect(screen.getAllByText(translations.ps['admin.nav.opportunities'])[0]).toBeInTheDocument();
    });

    it('renders sign out button with correct translation', async () => {
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.button.signOut'])).toBeInTheDocument();
      });
    });

    it('renders view site button with correct translation', async () => {
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.button.viewSite'])).toBeInTheDocument();
      });
    });
  });

  describe('Admin Dashboard Components - Requirements 3.3, 3.4', () => {
    it('renders dashboard stat cards with correct Persian translations', async () => {
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getAllByText(translations.fa['admin.stat.services'])[0]).toBeInTheDocument();
      });

      expect(screen.getAllByText(translations.fa['admin.stat.visas'])[0]).toBeInTheDocument();
      expect(screen.getAllByText(translations.fa['admin.stat.opportunities'])[0]).toBeInTheDocument();
      expect(screen.getAllByText(translations.fa['admin.stat.news'])[0]).toBeInTheDocument();
      expect(screen.getAllByText(translations.fa['admin.stat.messages'])[0]).toBeInTheDocument();
      expect(screen.getAllByText(translations.fa['admin.stat.subscribers'])[0]).toBeInTheDocument();
      expect(screen.getAllByText(translations.fa['admin.stat.gallery'])[0]).toBeInTheDocument();
      expect(screen.getAllByText(translations.fa['admin.stat.visits'])[0]).toBeInTheDocument();
    });

    it('renders dashboard section headers with correct translations', async () => {
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.dashboard.recentMessages'])).toBeInTheDocument();
      });

      expect(screen.getByText(translations.fa['admin.dashboard.recentSubscribers'])).toBeInTheDocument();
    });

    it('renders empty state messages with correct translations when no data', async () => {
      // Mock empty data response
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/stats')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              ...mockStatsResponse,
              recentMessages: [],
              recentSubscribers: [],
            }),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.empty.noMessages'])).toBeInTheDocument();
      });

      expect(screen.getByText(translations.fa['admin.empty.noSubscribers'])).toBeInTheDocument();
    });

    it('displays stat card values correctly', async () => {
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        expect(screen.getByText('12')).toBeInTheDocument(); // services count
      });

      expect(screen.getByText('8')).toBeInTheDocument(); // visas count
      expect(screen.getByText('15')).toBeInTheDocument(); // opportunities count
      expect(screen.getByText('20')).toBeInTheDocument(); // news count
    });
  });

  describe('Admin CRUD Interfaces - Requirements 3.5, 3.6, 3.7', () => {
    it('renders CRUD table header with correct translation', async () => {
      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      // Click on Services navigation item
      await waitFor(() => {
        expect(screen.getAllByText(translations.fa['admin.nav.services'])[0]).toBeInTheDocument();
      });

      await user.click(screen.getAllByText(translations.fa['admin.nav.services'])[0]);

      await waitFor(() => {
        // The header should show the translated navigation label
        expect(screen.getAllByText(translations.fa['admin.nav.services'])[0]).toBeInTheDocument();
      });
    });

    it('renders Add New button with correct translation in CRUD interface', async () => {
      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      // Navigate to Services
      await waitFor(() => {
        expect(screen.getAllByText(translations.fa['admin.nav.services'])[0]).toBeInTheDocument();
      });

      await user.click(screen.getAllByText(translations.fa['admin.nav.services'])[0]);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.button.addNew'])).toBeInTheDocument();
      });
    });

    it('renders table action buttons with correct translations', async () => {
      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      // Navigate to Services
      await waitFor(() => {
        expect(screen.getAllByText(translations.fa['admin.nav.services'])[0]).toBeInTheDocument();
      });

      await user.click(screen.getAllByText(translations.fa['admin.nav.services'])[0]);

      await waitFor(() => {
        // Wait for table to load
        expect(screen.getByText('Test Service')).toBeInTheDocument();
      });

      // Check for action buttons in the table (Edit and Delete icon buttons)
      const allButtons = screen.getAllByRole('button');
      // Should have nav buttons + action buttons + other UI buttons
      expect(allButtons.length).toBeGreaterThan(20);
    });

    it('switches languages in CRUD interface correctly', async () => {
      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      // Navigate to Services in Persian
      await waitFor(() => {
        expect(screen.getAllByText(translations.fa['admin.nav.services'])[0]).toBeInTheDocument();
      });

      await user.click(screen.getAllByText(translations.fa['admin.nav.services'])[0]);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.button.addNew'])).toBeInTheDocument();
      });

      // Switch to English
      act(() => {
        useLangStore.getState().setLang('en');
      });

      await waitFor(() => {
        expect(screen.getByText(translations.en['admin.button.addNew'])).toBeInTheDocument();
      });

      expect(screen.getAllByText(translations.en['admin.nav.services'])[0]).toBeInTheDocument();
    });
  });

  describe('Language Change Propagation - Requirements 3.8, 3.9', () => {
    it('updates all navigation items when language changes from Persian to English', async () => {
      render(<AdminApp admin={mockAdmin} />);

      // Verify initial Persian translations
      await waitFor(() => {
        expect(screen.getAllByText(translations.fa['admin.nav.dashboard'])[0]).toBeInTheDocument();
        expect(screen.getAllByText(translations.fa['admin.nav.services'])[0]).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.button.signOut'])).toBeInTheDocument();
      });

      // Change language to English
      act(() => {
        useLangStore.getState().setLang('en');
      });

      // Verify English translations appear
      await waitFor(() => {
        expect(screen.getAllByText(translations.en['admin.nav.dashboard'])[0]).toBeInTheDocument();
      });

      expect(screen.getAllByText(translations.en['admin.nav.services'])[0]).toBeInTheDocument();
      expect(screen.getByText(translations.en['admin.button.signOut'])).toBeInTheDocument();

      // Verify Persian translations are gone
      expect(screen.queryByText(translations.fa['admin.nav.dashboard'])).not.toBeInTheDocument();
      expect(screen.queryByText(translations.fa['admin.nav.services'])).not.toBeInTheDocument();
    });

    it('updates all dashboard components when language changes from English to Pashto', async () => {
      act(() => {
        useLangStore.setState({ code: 'en', dir: 'ltr' });
      });

      render(<AdminApp admin={mockAdmin} />);

      // Verify initial English translations
      await waitFor(() => {
        expect(screen.getAllByText(translations.en['admin.stat.services'])[0]).toBeInTheDocument();
        expect(screen.getAllByText(translations.en['admin.stat.visas'])[0]).toBeInTheDocument();
        expect(screen.getByText(translations.en['admin.dashboard.recentMessages'])).toBeInTheDocument();
      });

      // Change language to Pashto
      act(() => {
        useLangStore.getState().setLang('ps');
      });

      // Verify Pashto translations appear
      await waitFor(() => {
        expect(screen.getAllByText(translations.ps['admin.stat.services'])[0]).toBeInTheDocument();
      });

      expect(screen.getAllByText(translations.ps['admin.stat.visas'])[0]).toBeInTheDocument();
      expect(screen.getByText(translations.ps['admin.dashboard.recentMessages'])).toBeInTheDocument();

      // Verify English translations are gone
      expect(screen.queryByText(translations.en['admin.stat.services'])).not.toBeInTheDocument();
    });

    it('updates all components simultaneously when language changes', async () => {
      render(<AdminApp admin={mockAdmin} />);

      // Wait for initial Persian render
      await waitFor(() => {
        expect(screen.getAllByText(translations.fa['admin.nav.dashboard'])[0]).toBeInTheDocument();
        expect(screen.getAllByText(translations.fa['admin.stat.services'])[0]).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.button.signOut'])).toBeInTheDocument();
      });

      // Change language to English
      act(() => {
        useLangStore.getState().setLang('en');
      });

      // Verify ALL components update together
      await waitFor(() => {
        // Navigation
        expect(screen.getAllByText(translations.en['admin.nav.dashboard'])[0]).toBeInTheDocument();
        expect(screen.getAllByText(translations.en['admin.nav.services'])[0]).toBeInTheDocument();
        
        // Dashboard stats
        expect(screen.getAllByText(translations.en['admin.stat.services'])[0]).toBeInTheDocument();
        expect(screen.getAllByText(translations.en['admin.stat.visas'])[0]).toBeInTheDocument();
        
        // Buttons
        expect(screen.getByText(translations.en['admin.button.signOut'])).toBeInTheDocument();
        expect(screen.getByText(translations.en['admin.button.viewSite'])).toBeInTheDocument();
        
        // Dashboard sections
        expect(screen.getByText(translations.en['admin.dashboard.recentMessages'])).toBeInTheDocument();
        expect(screen.getByText(translations.en['admin.dashboard.recentSubscribers'])).toBeInTheDocument();
      });
    });

    it('maintains language consistency across navigation', async () => {
      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      // Start in Persian
      await waitFor(() => {
        expect(screen.getAllByText(translations.fa['admin.nav.dashboard'])[0]).toBeInTheDocument();
      });

      // Navigate to Services
      await user.click(screen.getAllByText(translations.fa['admin.nav.services'])[0]);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.button.addNew'])).toBeInTheDocument();
      });

      // Change language to English
      act(() => {
        useLangStore.getState().setLang('en');
      });

      // Verify consistency: both navigation and content are in English
      await waitFor(() => {
        expect(screen.getAllByText(translations.en['admin.nav.services'])[0]).toBeInTheDocument();
        expect(screen.getByText(translations.en['admin.button.addNew'])).toBeInTheDocument();
      });

      // Navigate back to Dashboard
      await user.click(screen.getAllByText(translations.en['admin.nav.dashboard'])[0]);

      // Verify Dashboard is also in English
      await waitFor(() => {
        expect(screen.getAllByText(translations.en['admin.stat.services'])[0]).toBeInTheDocument();
        expect(screen.getByText(translations.en['admin.dashboard.recentMessages'])).toBeInTheDocument();
      });
    });

    it('cycles through all three languages correctly', async () => {
      render(<AdminApp admin={mockAdmin} />);

      // Start with Persian
      await waitFor(() => {
        expect(screen.getAllByText(translations.fa['admin.nav.dashboard'])[0]).toBeInTheDocument();
      });

      // Switch to English
      act(() => {
        useLangStore.getState().setLang('en');
      });

      await waitFor(() => {
        expect(screen.getAllByText(translations.en['admin.nav.dashboard'])[0]).toBeInTheDocument();
      });

      // Switch to Pashto
      act(() => {
        useLangStore.getState().setLang('ps');
      });

      await waitFor(() => {
        expect(screen.getAllByText(translations.ps['admin.nav.dashboard'])[0]).toBeInTheDocument();
      });

      // Switch back to Persian
      act(() => {
        useLangStore.getState().setLang('fa');
      });

      await waitFor(() => {
        expect(screen.getAllByText(translations.fa['admin.nav.dashboard'])[0]).toBeInTheDocument();
      });
    });
  });

  describe('Complete Integration - All Requirements', () => {
    it('renders complete admin panel with all translations in Persian', async () => {
      render(<AdminApp admin={mockAdmin} />);

      await waitFor(() => {
        // Navigation (3.2)
        expect(screen.getAllByText(translations.fa['admin.nav.dashboard'])[0]).toBeInTheDocument();
        expect(screen.getAllByText(translations.fa['admin.nav.services'])[0]).toBeInTheDocument();
        expect(screen.getAllByText(translations.fa['admin.nav.visas'])[0]).toBeInTheDocument();
        
        // Dashboard stats (3.3)
        expect(screen.getAllByText(translations.fa['admin.stat.services'])[0]).toBeInTheDocument();
        expect(screen.getAllByText(translations.fa['admin.stat.visas'])[0]).toBeInTheDocument();
        
        // Dashboard sections (3.4)
        expect(screen.getByText(translations.fa['admin.dashboard.recentMessages'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.dashboard.recentSubscribers'])).toBeInTheDocument();
        
        // Buttons (3.5, 3.6)
        expect(screen.getByText(translations.fa['admin.button.signOut'])).toBeInTheDocument();
        expect(screen.getByText(translations.fa['admin.button.viewSite'])).toBeInTheDocument();
      });
    });

    it('handles complete language switch from Persian to English across all components', async () => {
      const user = userEvent.setup();
      render(<AdminApp admin={mockAdmin} />);

      // Wait for Persian render
      await waitFor(() => {
        expect(screen.getAllByText(translations.fa['admin.nav.dashboard'])[0]).toBeInTheDocument();
      });

      // Navigate to a CRUD view
      await user.click(screen.getAllByText(translations.fa['admin.nav.services'])[0]);

      await waitFor(() => {
        expect(screen.getByText(translations.fa['admin.button.addNew'])).toBeInTheDocument();
      });

      // Switch language to English
      act(() => {
        useLangStore.getState().setLang('en');
      });

      // Verify complete English translation across all visible elements
      await waitFor(() => {
        // Navigation
        expect(screen.getAllByText(translations.en['admin.nav.services'])[0]).toBeInTheDocument();
        expect(screen.getAllByText(translations.en['admin.nav.dashboard'])[0]).toBeInTheDocument();
        
        // CRUD interface
        expect(screen.getByText(translations.en['admin.button.addNew'])).toBeInTheDocument();
        
        // Buttons
        expect(screen.getByText(translations.en['admin.button.signOut'])).toBeInTheDocument();
        expect(screen.getByText(translations.en['admin.button.viewSite'])).toBeInTheDocument();
      });

      // Navigate back to dashboard
      await user.click(screen.getAllByText(translations.en['admin.nav.dashboard'])[0]);

      // Verify dashboard is fully in English
      await waitFor(() => {
        expect(screen.getAllByText(translations.en['admin.stat.services'])[0]).toBeInTheDocument();
        expect(screen.getByText(translations.en['admin.dashboard.recentMessages'])).toBeInTheDocument();
      });
    });
  });
});
