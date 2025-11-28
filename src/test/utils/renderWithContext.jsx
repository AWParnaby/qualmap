import { render } from '@testing-library/react';
import { MapDataProvider } from '@/contexts/MapDataContext';

/**
 * Render a component wrapped in MapDataProvider for testing
 *
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @returns {Object} render result from @testing-library/react
 */
export function renderWithContext(ui, options = {}) {
  const { ...renderOptions } = options;

  const Wrapper = ({ children }) => (
    <MapDataProvider>
      {children}
    </MapDataProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Create mock data for testing
 *
 * @returns {Object} Mock data state
 */
export function createMockDataState() {
  return {
    servicesData: [
      {
        service_name: 'Test Hub',
        postcode: 'NE1',
        contact_details: '01234 567890',
        text_summary: 'Digital skills training and community support'
      },
      {
        service_name: 'Tech Center',
        postcode: 'TS1',
        contact_details: 'test@example.com',
        text_summary: 'Providing access to computers and internet'
      }
    ],
    feedbackData: [
      {
        service_name: 'Test Hub',
        postcode: 'NE1',
        feedback_text: 'Great service with helpful staff'
      },
      {
        service_name: 'Tech Center',
        postcode: 'TS1',
        feedback_text: 'Friendly environment for learning'
      }
    ]
  };
}

/**
 * Create mock GeoJSON data for testing
 *
 * @returns {Object} Mock GeoJSON FeatureCollection
 */
export function createMockGeoJSON() {
  return {
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
}
