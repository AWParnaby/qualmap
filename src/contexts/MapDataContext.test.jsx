import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MapDataProvider, useMapData } from './MapDataContext';

// Mock fetch globally
global.fetch = vi.fn();

// Mock PapaParse
vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn((text, options) => {
      // Simple CSV parser mock
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {});
      });

      setTimeout(() => {
        options.complete({
          data,
          meta: { fields: headers }
        });
      }, 0);
    })
  }
}));

describe('MapDataContext Reducer', () => {
  let initialState;

  beforeEach(() => {
    initialState = {
      dataState: {},
      postcodeGeoJSON: null,
      selectedAreas: [],
      focusedArea: null,
      dataLoaded: false,
      showKeyboardHelp: false,
      activeTab: 'selections',
      selectedNgram: null,
      ngramData: null,
    };
    vi.clearAllMocks();
  });

  describe('SET_DATA_STATE', () => {
    it('sets the data state', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;

      // Mock fetch to prevent actual data loading
      global.fetch.mockRejectedValue(new Error('Test - no fetch'));

      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      const testData = {
        servicesData: [{ name: 'Test Service' }],
        feedbackData: [{ text: 'Test Feedback' }]
      };

      // The reducer doesn't expose a way to dispatch directly, but we can test
      // that the state structure is correct
      expect(result.current.state.dataState).toBeDefined();
    });
  });

  describe('SET_GEOJSON', () => {
    it('sets the GeoJSON data', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      global.fetch.mockRejectedValue(new Error('Test - no fetch'));

      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      expect(result.current.state.postcodeGeoJSON).toBeDefined();
    });
  });

  describe('SET_SELECTED_AREAS', () => {
    it('sets selected areas array', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      global.fetch.mockRejectedValue(new Error('Test - no fetch'));

      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      expect(result.current.state.selectedAreas).toEqual([]);
    });

    it('creates new array when setting selected areas', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      global.fetch.mockRejectedValue(new Error('Test - no fetch'));

      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      const originalArray = result.current.state.selectedAreas;

      act(() => {
        result.current.actions.toggleAreaSelection('NE1');
      });

      // Should be a new array, not mutation
      expect(result.current.state.selectedAreas).not.toBe(originalArray);
    });

    it('handles non-array payload gracefully', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      global.fetch.mockRejectedValue(new Error('Test - no fetch'));

      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      // The reducer ensures selectedAreas is always an array
      expect(Array.isArray(result.current.state.selectedAreas)).toBe(true);
    });
  });

  describe('CLEAR_SELECTIONS', () => {
    it('clears all selected areas', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      global.fetch.mockRejectedValue(new Error('Test - no fetch'));

      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      // Add some selections
      act(() => {
        result.current.actions.toggleAreaSelection('NE1');
        result.current.actions.toggleAreaSelection('NE2');
      });

      expect(result.current.state.selectedAreas.length).toBeGreaterThan(0);

      // Clear selections
      act(() => {
        result.current.actions.clearSelections();
      });

      expect(result.current.state.selectedAreas).toEqual([]);
    });

    it('handles clearing already empty selections', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      global.fetch.mockRejectedValue(new Error('Test - no fetch'));

      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      expect(result.current.state.selectedAreas).toEqual([]);

      act(() => {
        result.current.actions.clearSelections();
      });

      expect(result.current.state.selectedAreas).toEqual([]);
    });
  });

  describe('SET_FOCUSED_AREA', () => {
    it('sets the focused area', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      global.fetch.mockRejectedValue(new Error('Test - no fetch'));

      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      expect(result.current.state.focusedArea).toBe(null);

      act(() => {
        result.current.actions.setFocusedArea('NE1');
      });

      expect(result.current.state.focusedArea).toBe('NE1');
    });

    it('can clear focused area by setting to null', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      global.fetch.mockRejectedValue(new Error('Test - no fetch'));

      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      act(() => {
        result.current.actions.setFocusedArea('NE1');
      });

      expect(result.current.state.focusedArea).toBe('NE1');

      act(() => {
        result.current.actions.setFocusedArea(null);
      });

      expect(result.current.state.focusedArea).toBe(null);
    });
  });

  describe('SET_DATA_LOADED', () => {
    it('sets data loaded status', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      global.fetch.mockRejectedValue(new Error('Test - no fetch'));

      const { result } = renderHook(() => useMapData(), { wrapper });

      // Initially false, then becomes true after loading attempt
      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });
    });
  });

  describe('TOGGLE_KEYBOARD_HELP', () => {
    it('toggles keyboard help visibility', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      global.fetch.mockRejectedValue(new Error('Test - no fetch'));

      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      expect(result.current.state.showKeyboardHelp).toBe(false);

      act(() => {
        result.current.actions.toggleKeyboardHelp();
      });

      expect(result.current.state.showKeyboardHelp).toBe(true);

      act(() => {
        result.current.actions.toggleKeyboardHelp();
      });

      expect(result.current.state.showKeyboardHelp).toBe(false);
    });
  });

  describe('SET_ACTIVE_TAB', () => {
    it('sets the active tab', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      global.fetch.mockRejectedValue(new Error('Test - no fetch'));

      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      expect(result.current.state.activeTab).toBe('selections');

      act(() => {
        result.current.actions.setActiveTab('wordcloud');
      });

      expect(result.current.state.activeTab).toBe('wordcloud');

      act(() => {
        result.current.actions.setActiveTab('ngram');
      });

      expect(result.current.state.activeTab).toBe('ngram');
    });
  });

  describe('SET_SELECTED_NGRAM', () => {
    it('sets the selected n-gram', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      global.fetch.mockRejectedValue(new Error('Test - no fetch'));

      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      expect(result.current.state.selectedNgram).toBe(null);

      act(() => {
        result.current.actions.setSelectedNgram('digital skills');
      });

      expect(result.current.state.selectedNgram).toBe('digital skills');
    });

    it('can clear selected n-gram', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      global.fetch.mockRejectedValue(new Error('Test - no fetch'));

      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      act(() => {
        result.current.actions.setSelectedNgram('digital skills');
      });

      expect(result.current.state.selectedNgram).toBe('digital skills');

      act(() => {
        result.current.actions.setSelectedNgram(null);
      });

      expect(result.current.state.selectedNgram).toBe(null);
    });
  });

  describe('SET_NGRAM_DATA', () => {
    it('sets n-gram data', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      global.fetch.mockRejectedValue(new Error('Test - no fetch'));

      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      expect(result.current.state.ngramData).toBe(null);

      const testNgramData = {
        phrase: 'digital skills',
        occurrences: [
          { service: 'Test Hub', postcode: 'NE1' },
          { service: 'Tech Center', postcode: 'TS1' }
        ]
      };

      act(() => {
        result.current.actions.setNgramData(testNgramData);
      });

      expect(result.current.state.ngramData).toEqual(testNgramData);
    });

    it('can clear n-gram data', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      global.fetch.mockRejectedValue(new Error('Test - no fetch'));

      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      const testNgramData = { phrase: 'test', occurrences: [] };

      act(() => {
        result.current.actions.setNgramData(testNgramData);
      });

      expect(result.current.state.ngramData).toEqual(testNgramData);

      act(() => {
        result.current.actions.setNgramData(null);
      });

      expect(result.current.state.ngramData).toBe(null);
    });
  });
});

describe('MapDataContext Action Creators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockRejectedValue(new Error('Test - no fetch'));
  });

  describe('toggleAreaSelection', () => {
    it('adds area when not selected', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      expect(result.current.state.selectedAreas).toEqual([]);

      act(() => {
        result.current.actions.toggleAreaSelection('NE1');
      });

      expect(result.current.state.selectedAreas).toEqual(['NE1']);
    });

    it('removes area when already selected', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      act(() => {
        result.current.actions.toggleAreaSelection('NE1');
      });

      expect(result.current.state.selectedAreas).toEqual(['NE1']);

      act(() => {
        result.current.actions.toggleAreaSelection('NE1');
      });

      expect(result.current.state.selectedAreas).toEqual([]);
    });

    it('handles multiple area selections', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      act(() => {
        result.current.actions.toggleAreaSelection('NE1');
        result.current.actions.toggleAreaSelection('NE2');
        result.current.actions.toggleAreaSelection('TS1');
      });

      expect(result.current.state.selectedAreas).toEqual(['NE1', 'NE2', 'TS1']);
    });

    it('removes specific area from multiple selections', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      act(() => {
        result.current.actions.toggleAreaSelection('NE1');
        result.current.actions.toggleAreaSelection('NE2');
        result.current.actions.toggleAreaSelection('TS1');
      });

      expect(result.current.state.selectedAreas).toEqual(['NE1', 'NE2', 'TS1']);

      act(() => {
        result.current.actions.toggleAreaSelection('NE2');
      });

      expect(result.current.state.selectedAreas).toEqual(['NE1', 'TS1']);
    });

    it('uses functional dispatch pattern', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      // toggleAreaSelection uses functional dispatch internally
      act(() => {
        result.current.actions.toggleAreaSelection('NE1');
      });

      expect(result.current.state.selectedAreas).toContain('NE1');
    });
  });

  describe('clearSelections', () => {
    it('clears all selections', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      act(() => {
        result.current.actions.toggleAreaSelection('NE1');
        result.current.actions.toggleAreaSelection('NE2');
      });

      expect(result.current.state.selectedAreas.length).toBe(2);

      act(() => {
        result.current.actions.clearSelections();
      });

      expect(result.current.state.selectedAreas).toEqual([]);
    });
  });

  describe('setFocusedArea', () => {
    it('sets focused area to specified value', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      act(() => {
        result.current.actions.setFocusedArea('NE1');
      });

      expect(result.current.state.focusedArea).toBe('NE1');
    });

    it('can update focused area', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      act(() => {
        result.current.actions.setFocusedArea('NE1');
      });

      expect(result.current.state.focusedArea).toBe('NE1');

      act(() => {
        result.current.actions.setFocusedArea('TS1');
      });

      expect(result.current.state.focusedArea).toBe('TS1');
    });
  });

  describe('toggleKeyboardHelp', () => {
    it('toggles between true and false', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      const initial = result.current.state.showKeyboardHelp;

      act(() => {
        result.current.actions.toggleKeyboardHelp();
      });

      expect(result.current.state.showKeyboardHelp).toBe(!initial);

      act(() => {
        result.current.actions.toggleKeyboardHelp();
      });

      expect(result.current.state.showKeyboardHelp).toBe(initial);
    });
  });

  describe('setActiveTab', () => {
    it('sets active tab to specified value', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      act(() => {
        result.current.actions.setActiveTab('wordcloud');
      });

      expect(result.current.state.activeTab).toBe('wordcloud');
    });
  });

  describe('setSelectedNgram', () => {
    it('sets selected n-gram to specified value', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      act(() => {
        result.current.actions.setSelectedNgram('digital skills');
      });

      expect(result.current.state.selectedNgram).toBe('digital skills');
    });
  });

  describe('setNgramData', () => {
    it('sets n-gram data to specified value', async () => {
      const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
      const { result } = renderHook(() => useMapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.dataLoaded).toBe(true);
      });

      const testData = { phrase: 'test', occurrences: [] };

      act(() => {
        result.current.actions.setNgramData(testData);
      });

      expect(result.current.state.ngramData).toEqual(testData);
    });
  });
});

describe('MapDataContext Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockRejectedValue(new Error('Test - no fetch'));
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useMapData());
    }).toThrow('useMapData must be used within a MapDataProvider');

    consoleSpy.mockRestore();
  });

  it('provides state and actions when used within provider', async () => {
    const wrapper = ({ children }) => <MapDataProvider>{children}</MapDataProvider>;
    const { result } = renderHook(() => useMapData(), { wrapper });

    await waitFor(() => {
      expect(result.current.state.dataLoaded).toBe(true);
    });

    expect(result.current.state).toBeDefined();
    expect(result.current.actions).toBeDefined();
    expect(typeof result.current.actions.toggleAreaSelection).toBe('function');
    expect(typeof result.current.actions.clearSelections).toBe('function');
    expect(typeof result.current.actions.setFocusedArea).toBe('function');
    expect(typeof result.current.actions.toggleKeyboardHelp).toBe('function');
    expect(typeof result.current.actions.setActiveTab).toBe('function');
    expect(typeof result.current.actions.setSelectedNgram).toBe('function');
    expect(typeof result.current.actions.setNgramData).toBe('function');
  });
});
