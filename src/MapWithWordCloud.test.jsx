import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import MapWithWordCloud from './MapWithWordCloud';
import { renderWithContext } from '@test/utils/renderWithContext';

// Mock react-leaflet so PostcodeMap can render without a real map
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  GeoJSON: () => <div data-testid="geojson-layer" />,
  useMap: vi.fn(() => ({
    getContainer: vi.fn(() => document.createElement('div')),
  })),
}));

vi.mock('leaflet', () => ({
  default: {
    latLngBounds: vi.fn((sw, ne) => ({
      _southWest: sw,
      _northEast: ne,
      pad: vi.fn(function () {
        return this;
      }),
      isValid: () => true,
    })),
    geoJSON: vi.fn(() => ({
      getBounds: vi.fn(() => ({
        pad: vi.fn(function () {
          return this;
        }),
      })),
    })),
  },
}));

const mockServicesCSV = `service_name,postcode,contact_details,text_summary
Test Hub,NE1 4ST,01234 567890,Digital skills training`;

const mockFeedbackCSV = `service_name,postcode,feedback_text
Test Hub,NE1 4ST,Great service`;

const mockGeoJSON = {
  type: 'FeatureCollection',
  features: [{ type: 'Feature', properties: { name: 'NE1' }, geometry: { type: 'Polygon', coordinates: [] } }],
};

describe('MapWithWordCloud', () => {
  beforeEach(() => {
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

  describe('Resizable divider', () => {
    it('re-enables text selection once dragging ends', async () => {
      const { container } = renderWithContext(<MapWithWordCloud />);

      await waitFor(() => {
        expect(screen.getByRole('separator')).toBeInTheDocument();
      });

      const divider = screen.getByRole('separator');
      const root = container.firstChild;

      // Not dragging yet
      expect(root.style.userSelect).toBe('auto');

      // Start dragging and move - this should disable text selection
      fireEvent.mouseDown(divider);
      fireEvent.mouseMove(document, { clientX: 500 });
      expect(root.style.userSelect).toBe('none');

      // Ending the drag must re-enable text selection immediately,
      // without waiting for some unrelated re-render to happen first
      fireEvent.mouseUp(document);
      expect(root.style.userSelect).toBe('auto');
    });
  });
});
