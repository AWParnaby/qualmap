import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import SelectionPanel from './SelectionPanel';
import { MapDataProvider, useMapData } from '../../contexts/MapDataContext';

// Wrapper that provides context
function renderWithContext(ui) {
  return render(
    <MapDataProvider>
      {ui}
    </MapDataProvider>
  );
}

// Mock CSV data
const mockServicesCSV = `service_name,postcode,contact_details,text_summary
Test Hub,NE1,01234 567890,Digital skills training`;

const mockFeedbackCSV = `service_name,postcode,feedback_text
Test Hub,NE1,Great service`;

const mockGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'NE1' },
      geometry: { type: 'Polygon', coordinates: [[[-1.62, 54.97], [-1.62, 54.99], [-1.60, 54.99], [-1.60, 54.97], [-1.62, 54.97]]]}
    }
  ]
};

describe('SelectionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock fetch
    global.fetch = vi.fn((url) => {
      if (url.includes('services.csv')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockServicesCSV)
        });
      }
      if (url.includes('feedback.csv')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockFeedbackCSV)
        });
      }
      if (url.includes('.geojson')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGeoJSON)
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  describe('Empty State', () => {
    it('shows "No areas selected" when no selections', async () => {
      renderWithContext(<SelectionPanel />);

      await waitFor(() => {
        expect(screen.getByText('No areas selected')).toBeInTheDocument();
      });
    });

    it('does not show Clear All button when empty', async () => {
      renderWithContext(<SelectionPanel />);

      await waitFor(() => {
        expect(screen.getByText('No areas selected')).toBeInTheDocument();
      });

      expect(screen.queryByText('Clear All Selections')).not.toBeInTheDocument();
    });

    it('does not show selection list when empty', async () => {
      renderWithContext(<SelectionPanel />);

      await waitFor(() => {
        expect(screen.getByText('No areas selected')).toBeInTheDocument();
      });

      // Should only have the header, no list
      expect(screen.queryByRole('button', { name: /Remove/ })).not.toBeInTheDocument();
    });
  });

  describe('With Selections', () => {
    it('shows selection count for single area', async () => {
      const TestComponent = () => {
        const { actions, state } = useMapData();

        return (
          <div>
            <button onClick={() => actions.toggleAreaSelection('NE1')}>
              Select NE1
            </button>
            <SelectionPanel />
          </div>
        );
      };

      renderWithContext(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('No areas selected')).toBeInTheDocument();
      });

      // Click to select an area
      const selectButton = screen.getByText('Select NE1');
      await userEvent.click(selectButton);

      await waitFor(() => {
        expect(screen.getByText('1 area selected')).toBeInTheDocument();
      });
    });

    it('shows correct pluralization for multiple areas', async () => {
      const TestComponent = () => {
        const { actions } = useMapData();

        return (
          <div>
            <button onClick={() => actions.toggleAreaSelection('NE1')}>
              Select NE1
            </button>
            <button onClick={() => actions.toggleAreaSelection('TS1')}>
              Select TS1
            </button>
            <SelectionPanel />
          </div>
        );
      };

      renderWithContext(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('No areas selected')).toBeInTheDocument();
      });

      // Select two areas
      await userEvent.click(screen.getByText('Select NE1'));
      await userEvent.click(screen.getByText('Select TS1'));

      await waitFor(() => {
        expect(screen.getByText('2 areas selected')).toBeInTheDocument();
      });
    });

    it('renders list of selected areas', async () => {
      const TestComponent = () => {
        const { actions } = useMapData();

        return (
          <div>
            <button onClick={() => actions.toggleAreaSelection('NE1')}>
              Select NE1
            </button>
            <SelectionPanel />
          </div>
        );
      };

      renderWithContext(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('No areas selected')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Select NE1'));

      await waitFor(() => {
        expect(screen.getByText('NE1')).toBeInTheDocument();
      });
    });

    it('shows Clear All button when areas are selected', async () => {
      const TestComponent = () => {
        const { actions } = useMapData();

        return (
          <div>
            <button onClick={() => actions.toggleAreaSelection('NE1')}>
              Select NE1
            </button>
            <SelectionPanel />
          </div>
        );
      };

      renderWithContext(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('No areas selected')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Select NE1'));

      await waitFor(() => {
        expect(screen.getByText('Clear All Selections')).toBeInTheDocument();
      });
    });
  });

  describe('Interactions', () => {
    it('removes individual area when remove button clicked', async () => {
      const TestComponent = () => {
        const { actions } = useMapData();

        return (
          <div>
            <button onClick={() => actions.toggleAreaSelection('NE1')}>
              Select NE1
            </button>
            <SelectionPanel />
          </div>
        );
      };

      renderWithContext(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('No areas selected')).toBeInTheDocument();
      });

      // Select an area
      await userEvent.click(screen.getByText('Select NE1'));

      await waitFor(() => {
        expect(screen.getByText('1 area selected')).toBeInTheDocument();
      });

      // Click remove button
      const removeButton = screen.getByRole('button', { name: 'Remove NE1' });
      await userEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.getByText('No areas selected')).toBeInTheDocument();
      });
    });

    it('clears all selections when Clear All clicked', async () => {
      const TestComponent = () => {
        const { actions } = useMapData();

        return (
          <div>
            <button onClick={() => {
              actions.toggleAreaSelection('NE1');
              actions.toggleAreaSelection('TS1');
            }}>
              Select Areas
            </button>
            <SelectionPanel />
          </div>
        );
      };

      renderWithContext(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('No areas selected')).toBeInTheDocument();
      });

      // Select areas
      await userEvent.click(screen.getByText('Select Areas'));

      await waitFor(() => {
        expect(screen.getByText('Clear All Selections')).toBeInTheDocument();
      });

      // Click Clear All
      await userEvent.click(screen.getByText('Clear All Selections'));

      await waitFor(() => {
        expect(screen.getByText('No areas selected')).toBeInTheDocument();
      });
    });

    it('has proper aria-labels for remove buttons', async () => {
      const TestComponent = () => {
        const { actions } = useMapData();

        return (
          <div>
            <button onClick={() => actions.toggleAreaSelection('NE1')}>
              Select NE1
            </button>
            <SelectionPanel />
          </div>
        );
      };

      renderWithContext(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('No areas selected')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Select NE1'));

      await waitFor(() => {
        const removeButton = screen.getByRole('button', { name: 'Remove NE1' });
        expect(removeButton).toBeInTheDocument();
        expect(removeButton).toHaveAccessibleName('Remove NE1');
      });
    });
  });

  describe('Display', () => {
    it('displays remove button (✕) for each area', async () => {
      const TestComponent = () => {
        const { actions } = useMapData();

        return (
          <div>
            <button onClick={() => actions.toggleAreaSelection('NE1')}>
              Select NE1
            </button>
            <SelectionPanel />
          </div>
        );
      };

      renderWithContext(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('No areas selected')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Select NE1'));

      await waitFor(() => {
        const removeButton = screen.getByRole('button', { name: 'Remove NE1' });
        expect(removeButton).toHaveTextContent('✕');
      });
    });

    it('renders without crashing', () => {
      expect(() => {
        renderWithContext(<SelectionPanel />);
      }).not.toThrow();
    });
  });
});
