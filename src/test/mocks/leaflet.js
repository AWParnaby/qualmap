import { vi } from 'vitest';

// Mock Leaflet library for testing
export const L = {
  latLngBounds: vi.fn((sw, ne) => ({
    _southWest: sw,
    _northEast: ne,
    pad: vi.fn((padding) => ({
      _southWest: sw,
      _northEast: ne,
      _padding: padding,
      isValid: () => true
    })),
    isValid: () => true,
    getSouthWest: () => sw,
    getNorthEast: () => ne
  })),

  geoJSON: vi.fn((data) => {
    const bounds = {
      _southWest: [49.8, -8.5],
      _northEast: [59, 2],
      pad: vi.fn(() => bounds),
      isValid: () => true
    };

    return {
      _data: data,
      getBounds: vi.fn(() => bounds),
      addTo: vi.fn(),
      remove: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    };
  })
};

// Mock vi.mock for 'leaflet' module
vi.mock('leaflet', () => ({
  default: L,
  ...L
}));
