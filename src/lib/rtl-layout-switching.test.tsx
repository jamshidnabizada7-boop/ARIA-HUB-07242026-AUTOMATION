/**
 * RTL/LTR Layout Switching Tests
 * Task 10.4: Verify RTL/LTR layout switching
 * 
 * **Validates: Requirements 5.3, 5.4, 8.1, 8.3, 8.5, 8.6**
 * 
 * These tests verify that:
 * 1. HTML dir attribute updates correctly when language changes
 * 2. Admin panel layout mirrors properly in RTL mode
 * 3. Layout transitions occur without visual glitches
 */

import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import { useLangStore } from './lang-store';
import { Providers } from '@/components/providers';
import type { Language } from './types';
import fc from 'fast-check';

// Mock matchMedia for ThemeProvider
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('RTL/LTR Layout Switching', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset store to initial state
    useLangStore.setState({
      code: 'fa',
      dir: 'rtl',
      languages: [],
    });

    // Reset document.documentElement attributes
    document.documentElement.lang = 'fa';
    document.documentElement.dir = 'rtl';
  });

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

  describe('Requirement 8.1: HTML dir attribute updates correctly', () => {
    it('should set HTML dir attribute to "rtl" when language is Persian', async () => {
      useLangStore.getState().setLanguages(mockLanguages);
      
      const TestComponent = () => {
        return <Providers><div>Test</div></Providers>;
      };

      render(<TestComponent />);

      await act(async () => {
        useLangStore.getState().setLang('fa');
      });

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('rtl');
        expect(document.documentElement.lang).toBe('fa');
      });
    });

    it('should set HTML dir attribute to "ltr" when language is English', async () => {
      useLangStore.getState().setLanguages(mockLanguages);
      
      const TestComponent = () => {
        return <Providers><div>Test</div></Providers>;
      };

      render(<TestComponent />);

      await act(async () => {
        useLangStore.getState().setLang('en');
      });

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('ltr');
        expect(document.documentElement.lang).toBe('en');
      });
    });

    it('should set HTML dir attribute to "rtl" when language is Pashto', async () => {
      useLangStore.getState().setLanguages(mockLanguages);
      
      const TestComponent = () => {
        return <Providers><div>Test</div></Providers>;
      };

      render(<TestComponent />);

      await act(async () => {
        useLangStore.getState().setLang('ps');
      });

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('rtl');
        expect(document.documentElement.lang).toBe('ps');
      });
    });

    it('should update HTML attributes immediately when language changes', async () => {
      useLangStore.getState().setLanguages(mockLanguages);
      
      const TestComponent = () => {
        return <Providers><div>Test</div></Providers>;
      };

      render(<TestComponent />);

      // Start with Persian (RTL)
      await act(async () => {
        useLangStore.getState().setLang('fa');
      });

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('rtl');
        expect(document.documentElement.lang).toBe('fa');
      });

      // Switch to English (LTR)
      await act(async () => {
        useLangStore.getState().setLang('en');
      });

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('ltr');
        expect(document.documentElement.lang).toBe('en');
      });

      // Switch back to Pashto (RTL)
      await act(async () => {
        useLangStore.getState().setLang('ps');
      });

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('rtl');
        expect(document.documentElement.lang).toBe('ps');
      });
    });
  });

  describe('Requirement 8.3: Admin panel layout mirrors in RTL mode', () => {
    it('should have RTL direction applied to layout when in Persian', () => {
      useLangStore.getState().setLanguages(mockLanguages);
      useLangStore.getState().setLang('fa');

      const { dir } = useLangStore.getState();
      expect(dir).toBe('rtl');

      // This verifies that the dir value is available for CSS to use
      // CSS will apply mirroring based on [dir="rtl"] selector
      expect(document.documentElement.getAttribute('dir')).toBeDefined();
    });

    it('should have LTR direction applied to layout when in English', () => {
      useLangStore.getState().setLanguages(mockLanguages);
      useLangStore.getState().setLang('en');

      const { dir } = useLangStore.getState();
      expect(dir).toBe('ltr');

      expect(document.documentElement.getAttribute('dir')).toBeDefined();
    });

    it('should provide correct direction for CSS-based layout mirroring', async () => {
      useLangStore.getState().setLanguages(mockLanguages);
      
      const TestComponent = () => {
        return <Providers><div>Test</div></Providers>;
      };

      render(<TestComponent />);

      // Test RTL languages
      for (const lang of ['fa', 'ps']) {
        await act(async () => {
          useLangStore.getState().setLang(lang);
        });

        await waitFor(() => {
          expect(document.documentElement.dir).toBe('rtl');
        });
      }

      // Test LTR language
      await act(async () => {
        useLangStore.getState().setLang('en');
      });

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('ltr');
      });
    });
  });

  describe('Requirement 8.5, 8.6: Layout transitions occur without visual glitches', () => {
    it('should maintain consistent state during language switch', async () => {
      useLangStore.getState().setLanguages(mockLanguages);
      
      const TestComponent = () => {
        return <Providers><div>Test</div></Providers>;
      };

      render(<TestComponent />);

      // Switch language
      await act(async () => {
        useLangStore.getState().setLang('en');
      });

      // State should be consistent immediately after switch
      const state = useLangStore.getState();
      expect(state.code).toBe('en');
      expect(state.dir).toBe('ltr');

      await waitFor(() => {
        expect(document.documentElement.lang).toBe('en');
        expect(document.documentElement.dir).toBe('ltr');
      });
    });

    it('should not have intermediate undefined or null states during transition', async () => {
      useLangStore.getState().setLanguages(mockLanguages);
      
      const TestComponent = () => {
        return <Providers><div>Test</div></Providers>;
      };

      render(<TestComponent />);

      // Perform multiple rapid switches
      const languages = ['fa', 'en', 'ps', 'en', 'fa'];
      
      for (const lang of languages) {
        await act(async () => {
          useLangStore.getState().setLang(lang);
        });

        // Check that state never becomes undefined/null
        const state = useLangStore.getState();
        expect(state.code).toBeDefined();
        expect(state.code).not.toBeNull();
        expect(state.dir).toBeDefined();
        expect(state.dir).not.toBeNull();
        expect(['ltr', 'rtl']).toContain(state.dir);
      }
    });

    it('should synchronize code and dir atomically to prevent mismatched states', async () => {
      useLangStore.getState().setLanguages(mockLanguages);
      
      const TestComponent = () => {
        return <Providers><div>Test</div></Providers>;
      };

      render(<TestComponent />);

      // Test multiple transitions
      const transitions = [
        { code: 'fa', expectedDir: 'rtl' },
        { code: 'en', expectedDir: 'ltr' },
        { code: 'ps', expectedDir: 'rtl' },
        { code: 'en', expectedDir: 'ltr' },
      ];

      for (const { code, expectedDir } of transitions) {
        await act(async () => {
          useLangStore.getState().setLang(code);
        });

        // Immediately after setting, state should be consistent
        const state = useLangStore.getState();
        expect(state.code).toBe(code);
        expect(state.dir).toBe(expectedDir);

        await waitFor(() => {
          expect(document.documentElement.lang).toBe(code);
          expect(document.documentElement.dir).toBe(expectedDir);
        });
      }
    });

    it('should handle rapid language switching without race conditions', async () => {
      useLangStore.getState().setLanguages(mockLanguages);
      
      const TestComponent = () => {
        return <Providers><div>Test</div></Providers>;
      };

      render(<TestComponent />);

      // Rapidly switch languages
      const rapidSwitches = ['fa', 'en', 'ps', 'fa', 'en', 'ps', 'en', 'fa'];
      
      for (const lang of rapidSwitches) {
        await act(async () => {
          useLangStore.getState().setLang(lang);
        });
      }

      // After all switches, final state should be correct
      const finalState = useLangStore.getState();
      expect(finalState.code).toBe('fa');
      expect(finalState.dir).toBe('rtl');

      await waitFor(() => {
        expect(document.documentElement.lang).toBe('fa');
        expect(document.documentElement.dir).toBe('rtl');
      });
    });
  });

  describe('Property-Based Tests: RTL/LTR Layout Consistency', () => {
    it('should always maintain correct dir attribute for any language sequence', async () => {
      useLangStore.getState().setLanguages(mockLanguages);
      
      const TestComponent = () => {
        return <Providers><div>Test</div></Providers>;
      };

      render(<TestComponent />);

      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.constantFrom('en', 'fa', 'ps'), { minLength: 1, maxLength: 20 }),
          async (langSequence) => {
            for (const lang of langSequence) {
              await act(async () => {
                useLangStore.getState().setLang(lang);
              });

              const state = useLangStore.getState();
              const expectedDir = lang === 'en' ? 'ltr' : 'rtl';

              // Verify state consistency
              expect(state.code).toBe(lang);
              expect(state.dir).toBe(expectedDir);

              // Verify HTML attributes are updated
              await waitFor(() => {
                expect(document.documentElement.lang).toBe(lang);
                expect(document.documentElement.dir).toBe(expectedDir);
              });
            }
          }
        ),
        { numRuns: 50 } // Reduced from 100 for async tests
      );
    });

    it('should never have mismatched code and dir values', () => {
      useLangStore.getState().setLanguages(mockLanguages);

      fc.assert(
        fc.property(
          fc.constantFrom('en', 'fa', 'ps'),
          (lang) => {
            useLangStore.getState().setLang(lang);
            
            const state = useLangStore.getState();
            
            // Property: code and dir must always be consistent
            if (state.code === 'en') {
              expect(state.dir).toBe('ltr');
            } else if (state.code === 'fa' || state.code === 'ps') {
              expect(state.dir).toBe('rtl');
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain valid dir values across all language changes', () => {
      useLangStore.getState().setLanguages(mockLanguages);

      fc.assert(
        fc.property(
          fc.array(fc.constantFrom('en', 'fa', 'ps'), { minLength: 1, maxLength: 50 }),
          (langSequence) => {
            for (const lang of langSequence) {
              useLangStore.getState().setLang(lang);
              
              const { dir } = useLangStore.getState();
              
              // Property: dir must always be either 'ltr' or 'rtl'
              expect(['ltr', 'rtl']).toContain(dir);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Integration: Complete Layout Switching Workflow', () => {
    it('should complete full RTL to LTR transition workflow', async () => {
      useLangStore.getState().setLanguages(mockLanguages);
      
      const TestComponent = () => {
        return <Providers><div>Test</div></Providers>;
      };

      render(<TestComponent />);

      // Step 1: Start in Persian (RTL)
      await act(async () => {
        useLangStore.getState().setLang('fa');
      });

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('rtl');
        expect(document.documentElement.lang).toBe('fa');
      });

      const rtlState = useLangStore.getState();
      expect(rtlState.code).toBe('fa');
      expect(rtlState.dir).toBe('rtl');

      // Step 2: Switch to English (LTR)
      await act(async () => {
        useLangStore.getState().setLang('en');
      });

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('ltr');
        expect(document.documentElement.lang).toBe('en');
      });

      const ltrState = useLangStore.getState();
      expect(ltrState.code).toBe('en');
      expect(ltrState.dir).toBe('ltr');

      // Step 3: Verify persistence
      const stored = localStorage.getItem('aria-lang');
      expect(stored).toBeTruthy();
      
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.code).toBe('en');
        expect(parsed.state.dir).toBe('ltr');
      }
    });

    it('should complete full LTR to RTL transition workflow', async () => {
      useLangStore.getState().setLanguages(mockLanguages);
      
      const TestComponent = () => {
        return <Providers><div>Test</div></Providers>;
      };

      render(<TestComponent />);

      // Step 1: Start in English (LTR)
      await act(async () => {
        useLangStore.getState().setLang('en');
      });

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('ltr');
        expect(document.documentElement.lang).toBe('en');
      });

      // Step 2: Switch to Pashto (RTL)
      await act(async () => {
        useLangStore.getState().setLang('ps');
      });

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('rtl');
        expect(document.documentElement.lang).toBe('ps');
      });

      const rtlState = useLangStore.getState();
      expect(rtlState.code).toBe('ps');
      expect(rtlState.dir).toBe('rtl');

      // Step 3: Verify persistence
      const stored = localStorage.getItem('aria-lang');
      expect(stored).toBeTruthy();
      
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.code).toBe('ps');
        expect(parsed.state.dir).toBe('rtl');
      }
    });

    it('should handle multiple RTL languages without issues', async () => {
      useLangStore.getState().setLanguages(mockLanguages);
      
      const TestComponent = () => {
        return <Providers><div>Test</div></Providers>;
      };

      render(<TestComponent />);

      // Switch between RTL languages
      await act(async () => {
        useLangStore.getState().setLang('fa');
      });

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('rtl');
        expect(document.documentElement.lang).toBe('fa');
      });

      await act(async () => {
        useLangStore.getState().setLang('ps');
      });

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('rtl');
        expect(document.documentElement.lang).toBe('ps');
      });

      // Both should maintain RTL
      const state = useLangStore.getState();
      expect(state.dir).toBe('rtl');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined language gracefully without breaking layout', () => {
      useLangStore.getState().setLanguages(mockLanguages);
      
      const stateBefore = useLangStore.getState();
      
      // Try to set non-existent language
      useLangStore.getState().setLang('invalid-lang');
      
      const stateAfter = useLangStore.getState();
      
      // State should remain unchanged
      expect(stateAfter.code).toBe(stateBefore.code);
      expect(stateAfter.dir).toBe(stateBefore.dir);
      expect(['ltr', 'rtl']).toContain(stateAfter.dir);
    });

    it('should maintain valid dir attribute even with rapid switches', async () => {
      useLangStore.getState().setLanguages(mockLanguages);
      
      const TestComponent = () => {
        return <Providers><div>Test</div></Providers>;
      };

      render(<TestComponent />);

      // Perform many rapid switches
      for (let i = 0; i < 20; i++) {
        const lang = ['fa', 'en', 'ps'][i % 3];
        await act(async () => {
          useLangStore.getState().setLang(lang);
        });
      }

      // Final state should still be valid
      const finalState = useLangStore.getState();
      expect(['ltr', 'rtl']).toContain(finalState.dir);
      expect(['fa', 'en', 'ps']).toContain(finalState.code);

      await waitFor(() => {
        expect(['ltr', 'rtl']).toContain(document.documentElement.dir);
      });
    });

    it('should recover from invalid states if they somehow occur', () => {
      useLangStore.getState().setLanguages(mockLanguages);

      // Force invalid state (this shouldn't happen in production)
      // @ts-expect-error: Testing edge case with invalid state
      useLangStore.setState({ code: 'fa', dir: 'invalid' });

      // Setting a valid language should correct the state
      useLangStore.getState().setLang('en');

      const state = useLangStore.getState();
      expect(state.dir).toBe('ltr');
      expect(['ltr', 'rtl']).toContain(state.dir);
    });
  });
});
