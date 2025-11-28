import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import NgramDataPanel from './NgramDataPanel';
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
  features: [{ type: 'Feature', properties: { name: 'NE1' }, geometry: { type: 'Polygon', coordinates: [[[-1.62, 54.97], [-1.62, 54.99], [-1.60, 54.99], [-1.60, 54.97], [-1.62, 54.97]]]} }]
};

describe('NgramDataPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock fetch
    global.fetch = vi.fn((url) => {
      if (url.includes('services.csv')) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve(mockServicesCSV) });
      }
      if (url.includes('feedback.csv')) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve(mockFeedbackCSV) });
      }
      if (url.includes('.geojson')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockGeoJSON) });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  describe('Conditional Rendering', () => {
    it('returns null when no selectedNgram', async () => {
      const { container } = renderWithContext(<NgramDataPanel />);

      await waitFor(() => {
        expect(container).toBeEmptyDOMElement();
      });
    });

    it('returns null when selectedNgram exists but no ngramData', async () => {
      const TestComponent = () => {
        const { actions } = useMapData();

        return (
          <div>
            <button onClick={() => actions.setSelectedNgram('test')}>
              Set Ngram
            </button>
            <NgramDataPanel />
          </div>
        );
      };

      renderWithContext(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('Set Ngram')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Set Ngram'));

      // Panel should not render because ngramData is null
      expect(screen.queryByText(/Sources containing/)).not.toBeInTheDocument();
    });

    it('renders panel when both selectedNgram and ngramData exist', async () => {
      const TestComponent = () => {
        const { actions } = useMapData();

        const testData = [
          {
            service_name: 'Test Service',
            postcode: 'NE1',
            text_summary: 'Digital skills training',
            sourceField: 'text_summary'
          }
        ];

        return (
          <div>
            <button onClick={() => {
              actions.setSelectedNgram('digital skills');
              actions.setNgramData(testData);
            }}>
              Show Panel
            </button>
            <NgramDataPanel />
          </div>
        );
      };

      renderWithContext(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('Show Panel')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Show Panel'));

      await waitFor(() => {
        expect(screen.getByText('Sources containing "digital skills"')).toBeInTheDocument();
      });
    });
  });

  describe('Display', () => {
    it('shows heading with selected phrase', async () => {
      const TestComponent = () => {
        const { actions } = useMapData();

        const testData = [
          {
            service_name: 'Test Service',
            postcode: 'NE1',
            text_summary: 'Digital skills training',
            sourceField: 'text_summary'
          }
        ];

        return (
          <div>
            <button onClick={() => {
              actions.setSelectedNgram('digital skills');
              actions.setNgramData(testData);
            }}>
              Show Panel
            </button>
            <NgramDataPanel />
          </div>
        );
      };

      renderWithContext(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('Show Panel')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Show Panel'));

      await waitFor(() => {
        expect(screen.getByText('Sources containing "digital skills"')).toBeInTheDocument();
      });
    });

    it('displays all matching items', async () => {
      const TestComponent = () => {
        const { actions } = useMapData();

        const testData = [
          {
            service_name: 'Service One',
            postcode: 'NE1',
            text_summary: 'Digital skills training',
            sourceField: 'text_summary'
          },
          {
            service_name: 'Service Two',
            postcode: 'TS1',
            text_summary: 'More digital skills',
            sourceField: 'text_summary'
          }
        ];

        return (
          <div>
            <button onClick={() => {
              actions.setSelectedNgram('digital skills');
              actions.setNgramData(testData);
            }}>
              Show Panel
            </button>
            <NgramDataPanel />
          </div>
        );
      };

      renderWithContext(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('Show Panel')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Show Panel'));

      await waitFor(() => {
        expect(screen.getByText('Service One')).toBeInTheDocument();
        expect(screen.getByText('Service Two')).toBeInTheDocument();
      });
    });

    it('shows service name, postcode, and text for each item', async () => {
      const TestComponent = () => {
        const { actions } = useMapData();

        const testData = [
          {
            service_name: 'Test Service',
            postcode: 'NE1',
            text_summary: 'Digital skills training',
            sourceField: 'text_summary'
          }
        ];

        return (
          <div>
            <button onClick={() => {
              actions.setSelectedNgram('digital');
              actions.setNgramData(testData);
            }}>
              Show Panel
            </button>
            <NgramDataPanel />
          </div>
        );
      };

      renderWithContext(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('Show Panel')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Show Panel'));

      await waitFor(() => {
        expect(screen.getByText('Test Service')).toBeInTheDocument();
        expect(screen.getByText('NE1')).toBeInTheDocument();
        expect(screen.getByText('Digital skills training')).toBeInTheDocument();
      });
    });

    it('shows "No matching data found" when ngramData is empty array', async () => {
      const TestComponent = () => {
        const { actions } = useMapData();

        return (
          <div>
            <button onClick={() => {
              actions.setSelectedNgram('nonexistent');
              actions.setNgramData([]);
            }}>
              Show Empty Panel
            </button>
            <NgramDataPanel />
          </div>
        );
      };

      renderWithContext(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('Show Empty Panel')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Show Empty Panel'));

      await waitFor(() => {
        expect(screen.getByText('No matching data found')).toBeInTheDocument();
      });
    });

    it('shows "No text available" when sourceField has no value', async () => {
      const TestComponent = () => {
        const { actions } = useMapData();

        const testData = [
          {
            service_name: 'Test Service',
            postcode: 'NE1',
            sourceField: 'missing_field'
          }
        ];

        return (
          <div>
            <button onClick={() => {
              actions.setSelectedNgram('test');
              actions.setNgramData(testData);
            }}>
              Show Panel
            </button>
            <NgramDataPanel />
          </div>
        );
      };

      renderWithContext(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('Show Panel')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Show Panel'));

      await waitFor(() => {
        expect(screen.getByText('No text available')).toBeInTheDocument();
      });
    });
  });

  describe('Interactions', () => {
    it('closes panel when X button clicked', async () => {
      const TestComponent = () => {
        const { actions } = useMapData();

        const testData = [
          {
            service_name: 'Test Service',
            postcode: 'NE1',
            text_summary: 'Digital skills',
            sourceField: 'text_summary'
          }
        ];

        return (
          <div>
            <button onClick={() => {
              actions.setSelectedNgram('digital');
              actions.setNgramData(testData);
            }}>
              Show Panel
            </button>
            <NgramDataPanel />
          </div>
        );
      };

      renderWithContext(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('Show Panel')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Show Panel'));

      await waitFor(() => {
        expect(screen.getByText('Sources containing "digital"')).toBeInTheDocument();
      });

      // Click X button
      const closeButton = screen.getByRole('button', { name: 'Close panel' });
      await userEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Sources containing "digital"')).not.toBeInTheDocument();
      });
    });

    it('closes panel when bottom Close button clicked', async () => {
      const TestComponent = () => {
        const { actions } = useMapData();

        const testData = [
          {
            service_name: 'Test Service',
            postcode: 'NE1',
            text_summary: 'Digital skills',
            sourceField: 'text_summary'
          }
        ];

        return (
          <div>
            <button onClick={() => {
              actions.setSelectedNgram('digital');
              actions.setNgramData(testData);
            }}>
              Show Panel
            </button>
            <NgramDataPanel />
          </div>
        );
      };

      renderWithContext(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('Show Panel')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Show Panel'));

      await waitFor(() => {
        expect(screen.getByText('Sources containing "digital"')).toBeInTheDocument();
      });

      // Click Close button at bottom
      const closeButtons = screen.getAllByText('Close');
      await userEvent.click(closeButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('Sources containing "digital"')).not.toBeInTheDocument();
      });
    });

    it('has proper aria-label for X close button', async () => {
      const TestComponent = () => {
        const { actions } = useMapData();

        const testData = [
          {
            service_name: 'Test Service',
            postcode: 'NE1',
            text_summary: 'Test',
            sourceField: 'text_summary'
          }
        ];

        return (
          <div>
            <button onClick={() => {
              actions.setSelectedNgram('test');
              actions.setNgramData(testData);
            }}>
              Show Panel
            </button>
            <NgramDataPanel />
          </div>
        );
      };

      renderWithContext(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('Show Panel')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Show Panel'));

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: 'Close panel' });
        expect(closeButton).toBeInTheDocument();
        expect(closeButton).toHaveAccessibleName('Close panel');
      });
    });
  });

  describe('Edge Cases', () => {
    it('renders without crashing when both props exist', async () => {
      const TestComponent = () => {
        const { actions } = useMapData();

        const testData = [
          {
            service_name: 'Test',
            postcode: 'NE1',
            text_summary: 'Test text',
            sourceField: 'text_summary'
          }
        ];

        return (
          <div>
            <button onClick={() => {
              actions.setSelectedNgram('test');
              actions.setNgramData(testData);
            }}>
              Show
            </button>
            <NgramDataPanel />
          </div>
        );
      };

      expect(() => {
        renderWithContext(<TestComponent />);
      }).not.toThrow();
    });

    it('handles missing service_name gracefully', async () => {
      const TestComponent = () => {
        const { actions } = useMapData();

        const testData = [
          {
            postcode: 'NE1',
            text_summary: 'Test text',
            sourceField: 'text_summary'
          }
        ];

        return (
          <div>
            <button onClick={() => {
              actions.setSelectedNgram('test');
              actions.setNgramData(testData);
            }}>
              Show
            </button>
            <NgramDataPanel />
          </div>
        );
      };

      renderWithContext(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('Show')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Show'));

      await waitFor(() => {
        expect(screen.getByText('Sources containing "test"')).toBeInTheDocument();
      });
    });
  });
});
