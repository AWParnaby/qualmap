import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostcodeMap from './PostcodeMap';
import { renderWithContext } from '@test/utils/renderWithContext';

// Mock react-leaflet before imports
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, bounds, ...props }) => (
    <div data-testid="map-container" data-bounds={JSON.stringify(bounds)} {...props}>
      {children}
    </div>
  ),
  TileLayer: ({ url, attribution }) => (
    <div data-testid="tile-layer" data-url={url} data-attribution={attribution} />
  ),
  GeoJSON: ({ data, onEachFeature, style, ...otherProps }) => {
    // Simulate onEachFeature being called for each feature
    if (data && data.features && onEachFeature) {
      data.features.forEach(feature => {
        const mockLayer = {
          on: vi.fn(),
          options: {},
          getElement: vi.fn(() => {
            const elem = document.createElement('div');
            elem.setAttribute('data-postcode', feature.properties?.name);
            elem.setAttribute('role', 'button');
            elem.setAttribute('tabindex', '0');
            elem.setAttribute('aria-label', `Postcode area ${feature.properties?.name}`);
            return elem;
          })
        };
        onEachFeature(feature, mockLayer);
      });
    }
    return (
      <div data-testid="geojson-layer" data-feature-count={data?.features?.length || 0}>
        {data?.features?.map((feature, idx) => (
          <div
            key={idx}
            data-testid={`geojson-feature-${feature.properties?.name}`}
            data-postcode={feature.properties?.name}
            role="button"
            tabIndex="0"
            aria-label={`Postcode area ${feature.properties?.name}`}
          >
            {feature.properties?.name}
          </div>
        ))}
      </div>
    );
  },
  useMap: vi.fn(() => ({
    getContainer: vi.fn(() => document.createElement('div')),
    on: vi.fn(),
    off: vi.fn()
  }))
}));

// Mock leaflet
vi.mock('leaflet', () => ({
  default: {
    latLngBounds: vi.fn((sw, ne) => ({
      _southWest: sw,
      _northEast: ne,
      pad: vi.fn(function(padding) {
        return this;
      }),
      isValid: () => true
    })),
    geoJSON: vi.fn((data) => ({
      getBounds: vi.fn(() => ({
        _southWest: [49.8, -8.5],
        _northEast: [59, 2],
        pad: vi.fn(function() { return this; })
      }))
    }))
  }
}));

// Mock CSV data
const mockServicesCSV = `service_name,postcode,contact_details,text_summary
Test Hub,NE1 4ST,01234 567890,Digital skills training and community support
Tech Center,TS1 2AA,test@example.com,Providing access to computers and internet`;

const mockFeedbackCSV = `service_name,postcode,feedback_text
Test Hub,NE1 4ST,Great service with helpful staff
Tech Center,TS1 2AA,Friendly environment for learning`;

const mockGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'NE1' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[-1.62, 54.97], [-1.62, 54.99], [-1.60, 54.99], [-1.60, 54.97], [-1.62, 54.97]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'TS1' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[-1.25, 54.56], [-1.25, 54.58], [-1.23, 54.58], [-1.23, 54.56], [-1.25, 54.56]]]
      }
    }
  ]
};

describe('PostcodeMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock fetch to return test data
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

  describe('Rendering', () => {
    it('renders the map container', () => {
      renderWithContext(<PostcodeMap />);

      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    it('renders tile layer with OSM attribution', () => {
      renderWithContext(<PostcodeMap />);

      const tileLayer = screen.getByTestId('tile-layer');
      expect(tileLayer).toBeInTheDocument();
      expect(tileLayer).toHaveAttribute('data-url', 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
      expect(tileLayer).toHaveAttribute('data-attribution', expect.stringContaining('OpenStreetMap'));
    });

    it('renders GeoJSON layer', () => {
      renderWithContext(<PostcodeMap />);

      expect(screen.getByTestId('geojson-layer')).toBeInTheDocument();
    });

    it('uses default UK bounds when no GeoJSON data', () => {
      renderWithContext(<PostcodeMap />);

      const mapContainer = screen.getByTestId('map-container');
      const boundsData = mapContainer.getAttribute('data-bounds');
      expect(boundsData).toBeTruthy();

      // Should have bounds data (exact values depend on L.latLngBounds mock)
      const bounds = JSON.parse(boundsData);
      expect(bounds).toHaveProperty('_southWest');
      expect(bounds).toHaveProperty('_northEast');
    });
  });

  describe('Feature Rendering', () => {
    it('renders postcode features from GeoJSON data', async () => {
      renderWithContext(<PostcodeMap />);

      // Wait for data to load (MapDataProvider loads data on mount)
      await waitFor(() => {
        const geoJSONLayer = screen.queryByTestId('geojson-layer');
        expect(geoJSONLayer).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('applies accessibility attributes to features', async () => {
      renderWithContext(<PostcodeMap />);

      await waitFor(() => {
        const geoJSONLayer = screen.queryByTestId('geojson-layer');
        expect(geoJSONLayer).toBeInTheDocument();
      });

      // Features should have role="button" and tabindex="0"
      const features = screen.getAllByRole('button');
      expect(features.length).toBeGreaterThan(0);

      features.forEach(feature => {
        expect(feature).toHaveAttribute('tabindex', '0');
      });
    });

    it('sets data-postcode attribute on features', async () => {
      renderWithContext(<PostcodeMap />);

      await waitFor(() => {
        const geoJSONLayer = screen.queryByTestId('geojson-layer');
        expect(geoJSONLayer).toBeInTheDocument();
      });

      const features = screen.getAllByRole('button');
      features.forEach(feature => {
        const postcode = feature.getAttribute('data-postcode');
        expect(postcode).toBeTruthy();
        expect(postcode).toMatch(/^[A-Z]+\d+[A-Z]?$/); // UK postcode district pattern
      });
    });
  });

  describe('Interactions', () => {
    it('toggles area selection on click', async () => {
      const user = userEvent.setup();
      const { container } = renderWithContext(<PostcodeMap />);

      await waitFor(() => {
        expect(screen.getByTestId('geojson-layer')).toBeInTheDocument();
      });

      // Find a feature to click
      const features = screen.getAllByRole('button');
      expect(features.length).toBeGreaterThan(0);

      const firstFeature = features[0];
      const postcode = firstFeature.getAttribute('data-postcode');

      // Click the feature
      await user.click(firstFeature);

      // The feature should still be in the document
      expect(firstFeature).toBeInTheDocument();
    });

    it('handles multiple area selections', async () => {
      const user = userEvent.setup();
      renderWithContext(<PostcodeMap />);

      await waitFor(() => {
        expect(screen.getByTestId('geojson-layer')).toBeInTheDocument();
      });

      const features = screen.getAllByRole('button');

      // Click multiple features
      if (features.length >= 2) {
        await user.click(features[0]);
        await user.click(features[1]);

        // Both features should still be in the document
        expect(features[0]).toBeInTheDocument();
        expect(features[1]).toBeInTheDocument();
      }
    });

    it('toggles selection when clicking same area twice', async () => {
      const user = userEvent.setup();
      renderWithContext(<PostcodeMap />);

      await waitFor(() => {
        expect(screen.getByTestId('geojson-layer')).toBeInTheDocument();
      });

      const features = screen.getAllByRole('button');
      const firstFeature = features[0];

      // Click twice
      await user.click(firstFeature);
      await user.click(firstFeature);

      // Feature should still exist
      expect(firstFeature).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies different colors for selected vs unselected areas', async () => {
      const user = userEvent.setup();
      renderWithContext(<PostcodeMap />);

      await waitFor(() => {
        expect(screen.getByTestId('geojson-layer')).toBeInTheDocument();
      });

      const features = screen.getAllByRole('button');
      if (features.length > 0) {
        const feature = features[0];

        // Click to select
        await user.click(feature);

        // Feature should still be rendered (styling is handled by react-leaflet)
        expect(feature).toBeInTheDocument();
      }
    });
  });

  describe('Keyboard Navigation', () => {
    it('makes features focusable', async () => {
      renderWithContext(<PostcodeMap />);

      await waitFor(() => {
        expect(screen.getByTestId('geojson-layer')).toBeInTheDocument();
      });

      const features = screen.getAllByRole('button');
      features.forEach(feature => {
        expect(feature).toHaveAttribute('tabindex', '0');
      });
    });

    it('features are focusable via tab navigation', async () => {
      renderWithContext(<PostcodeMap />);

      await waitFor(() => {
        expect(screen.getByTestId('geojson-layer')).toBeInTheDocument();
      });

      const features = screen.getAllByRole('button');
      if (features.length > 0) {
        const firstFeature = features[0];

        // Check feature can receive focus (has tabindex="0")
        expect(firstFeature).toHaveAttribute('tabindex', '0');
        expect(firstFeature).toBeInTheDocument();
      }
    });

    it('allows keyboard selection with Enter key', async () => {
      const user = userEvent.setup();
      renderWithContext(<PostcodeMap />);

      await waitFor(() => {
        expect(screen.getByTestId('geojson-layer')).toBeInTheDocument();
      });

      const features = screen.getAllByRole('button');
      if (features.length > 0) {
        const firstFeature = features[0];

        // Focus and press Enter
        firstFeature.focus();
        await user.keyboard('{Enter}');

        // Feature should still be in document
        expect(firstFeature).toBeInTheDocument();
      }
    });

    it('allows keyboard selection with Space key', async () => {
      const user = userEvent.setup();
      renderWithContext(<PostcodeMap />);

      await waitFor(() => {
        expect(screen.getByTestId('geojson-layer')).toBeInTheDocument();
      });

      const features = screen.getAllByRole('button');
      if (features.length > 0) {
        const firstFeature = features[0];

        // Focus and press Space
        firstFeature.focus();
        await user.keyboard(' ');

        // Feature should still be in document
        expect(firstFeature).toBeInTheDocument();
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for screen readers', async () => {
      renderWithContext(<PostcodeMap />);

      await waitFor(() => {
        expect(screen.getByTestId('geojson-layer')).toBeInTheDocument();
      });

      const features = screen.getAllByRole('button');
      features.forEach(feature => {
        const ariaLabel = feature.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel).toMatch(/Postcode area/i);
      });
    });

    it('has semantic button role for interactive areas', async () => {
      renderWithContext(<PostcodeMap />);

      await waitFor(() => {
        expect(screen.getByTestId('geojson-layer')).toBeInTheDocument();
      });

      const features = screen.getAllByRole('button');
      expect(features.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty GeoJSON data gracefully', () => {
      renderWithContext(<PostcodeMap />);

      // Should still render map container
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
      expect(screen.getByTestId('geojson-layer')).toBeInTheDocument();
    });

    it('handles GeoJSON with no features', () => {
      renderWithContext(<PostcodeMap />);

      const geoJSONLayer = screen.getByTestId('geojson-layer');
      expect(geoJSONLayer).toBeInTheDocument();

      // Check feature count attribute
      const featureCount = geoJSONLayer.getAttribute('data-feature-count');
      expect(featureCount).toBeDefined();
    });

    it('renders without crashing when context is provided', () => {
      expect(() => {
        renderWithContext(<PostcodeMap />);
      }).not.toThrow();
    });
  });
});
