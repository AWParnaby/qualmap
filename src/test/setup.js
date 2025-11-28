import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
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

// Mock getBoundingClientRect with realistic values
Element.prototype.getBoundingClientRect = vi.fn(function() {
  // Try to get data-postcode attribute for position-aware mocking
  const postcode = this.getAttribute?.('data-postcode');

  // Create position variation based on postcode (simple hash)
  let offset = 0;
  if (postcode) {
    offset = postcode.charCodeAt(0) * 10;
  }

  return {
    width: 200,
    height: 100,
    top: offset,
    left: offset,
    bottom: offset + 100,
    right: offset + 200,
    x: offset,
    y: offset,
    toJSON: () => {}
  };
});

// Mock focus/blur
HTMLElement.prototype.focus = vi.fn();
HTMLElement.prototype.blur = vi.fn();

// Suppress console errors and warnings in tests (optional - comment out if you want to see them)
const originalError = console.error;
const originalWarn = console.warn;

global.console = {
  ...console,
  error: (...args) => {
    // Suppress known React warnings in tests
    if (args[0]?.includes?.('Warning: ReactDOM.render')) return;
    if (args[0]?.includes?.('Warning: useLayoutEffect')) return;
    originalError(...args);
  },
  warn: (...args) => {
    // Suppress known warnings
    if (args[0]?.includes?.('Warning:')) return;
    originalWarn(...args);
  },
};
