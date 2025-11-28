import { vi } from 'vitest';

// Mock react-leaflet components for testing
// These preserve props and event handlers for testing interaction logic

export const MapContainer = ({ children, bounds, ...props }) => (
  <div data-testid="map-container" data-bounds={JSON.stringify(bounds)} {...props}>
    {children}
  </div>
);

export const TileLayer = ({ url, attribution }) => (
  <div
    data-testid="tile-layer"
    data-url={url}
    data-attribution={attribution}
  />
);

export const GeoJSON = ({ data, style, onEachFeature, ...props }) => {
  // Simulate calling onEachFeature for each feature
  if (data && data.features && onEachFeature) {
    data.features.forEach(feature => {
      // Create mock layer object
      const mockLayer = {
        on: vi.fn((events) => {
          // Store event handlers for testing
          mockLayer._events = events;
        }),
        options: {},
        getElement: vi.fn(() => {
          // Return mock DOM element
          const elem = document.createElement('path');
          elem.setAttribute('data-postcode', feature.properties?.name);
          return elem;
        })
      };

      onEachFeature(feature, mockLayer);
    });
  }

  return (
    <div
      data-testid="geojson-layer"
      data-feature-count={data?.features?.length || 0}
      {...props}
    >
      {data?.features?.map((feature, idx) => (
        <div
          key={idx}
          data-testid={`geojson-feature-${feature.properties?.name}`}
          data-postcode={feature.properties?.name}
          role="button"
          tabIndex="0"
          onClick={() => {
            // Trigger click if onEachFeature set up handlers
            // This simulates the Leaflet layer click event
          }}
        >
          {feature.properties?.name}
        </div>
      ))}
    </div>
  );
};

// Mock useMap hook
export const useMap = vi.fn(() => ({
  getContainer: vi.fn(() => document.createElement('div')),
  on: vi.fn(),
  off: vi.fn(),
  setView: vi.fn(),
  fitBounds: vi.fn()
}));

// Mock the module
vi.mock('react-leaflet', () => ({
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap
}));
