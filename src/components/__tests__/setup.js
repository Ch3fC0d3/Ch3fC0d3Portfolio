/**
 * @jest-environment jsdom
 */

// Jest setup file
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: function mockMatchMedia(query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: function() {},
      removeListener: function() {},
      addEventListener: function() {},
      removeEventListener: function() {},
      dispatchEvent: function() {},
    };
  },
});

// Mock IntersectionObserver
if (typeof window.IntersectionObserver === 'undefined') {
  window.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() { return null; }
    unobserve() { return null; }
    disconnect() { return null; }
  };
}

// Mock ResizeObserver
if (typeof window.ResizeObserver === 'undefined') {
  window.ResizeObserver = class ResizeObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() { return null; }
    unobserve() { return null; }
    disconnect() { return null; }
  };
}

// Mock window.scrollTo
window.scrollTo = function() {};

// Mock console methods to avoid noise in test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = function(...args) {
  // Suppress specific React errors during tests
  const suppressedMessages = [
    'Warning: ReactDOM.render is no longer supported',
    'Warning: useLayoutEffect does nothing on the server',
  ];
  
  if (!suppressedMessages.some(msg => args[0] && args[0].includes(msg))) {
    originalConsoleError(...args);
  }
};

console.warn = function(...args) {
  // Suppress specific React warnings during tests
  const suppressedMessages = [
    'Warning: React does not recognize the',
  ];
  
  if (!suppressedMessages.some(msg => args[0] && args[0].includes(msg))) {
    originalConsoleWarn(...args);
  }
};
