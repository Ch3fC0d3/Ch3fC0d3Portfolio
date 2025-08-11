/**
 * @jest-environment jsdom
 */

import { 
  announceToScreenReader, 
  addKeyboardNavigation, 
  checkColorContrast, 
  addScreenReaderOnlyStyles 
} from '../accessibilityHelper';

// Import Jest functions
import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock DOM elements and functions
beforeEach(() => {
  // Clear any previous elements
  document.body.innerHTML = '';
  
  // Mock createElement and appendChild
  jest.spyOn(document, 'createElement');
  jest.spyOn(document.body, 'appendChild');
  jest.spyOn(document.head, 'appendChild');
  
  // Mock addEventListener and removeEventListener
  jest.spyOn(Element.prototype, 'addEventListener');
  jest.spyOn(Element.prototype, 'removeEventListener');
  
  // Reset all mocks
  jest.clearAllMocks();
});

describe('announceToScreenReader', () => {
  test('creates a live region element if it does not exist', () => {
    announceToScreenReader('Test message');
    
    expect(document.createElement).toHaveBeenCalledWith('div');
    expect(document.body.appendChild).toHaveBeenCalled();
    
    const liveRegion = document.getElementById('screen-reader-announce');
    expect(liveRegion).not.toBeNull();
    expect(liveRegion.getAttribute('aria-live')).toBe('polite');
    expect(liveRegion.textContent).toBe('Test message');
  });
  
  test('uses existing live region if it exists', () => {
    // Create the element first
    const liveRegion = document.createElement('div');
    liveRegion.id = 'screen-reader-announce';
    document.body.appendChild(liveRegion);
    
    // Clear mocks to check if createElement is called again
    jest.clearAllMocks();
    
    announceToScreenReader('Another message');
    
    // Should not create a new element
    expect(document.createElement).not.toHaveBeenCalled();
    expect(liveRegion.textContent).toBe('Another message');
  });
  
  test('respects priority parameter', () => {
    announceToScreenReader('Important message', 'assertive');
    
    const liveRegion = document.getElementById('screen-reader-announce');
    expect(liveRegion.getAttribute('aria-live')).toBe('assertive');
  });
});

describe('addKeyboardNavigation', () => {
  test('adds event listeners to the provided ref', () => {
    const mockRef = { current: document.createElement('div') };
    const mockHandlers = {
      onEnter: jest.fn(),
      onEscape: jest.fn(),
      onArrowUp: jest.fn(),
      onArrowDown: jest.fn()
    };
    
    const cleanup = addKeyboardNavigation(mockRef, mockHandlers);
    
    expect(mockRef.current.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    // Simulate keydown events
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    mockRef.current.dispatchEvent(enterEvent);
    expect(mockHandlers.onEnter).toHaveBeenCalled();
    
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    mockRef.current.dispatchEvent(escapeEvent);
    expect(mockHandlers.onEscape).toHaveBeenCalled();
    
    const arrowUpEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    mockRef.current.dispatchEvent(arrowUpEvent);
    expect(mockHandlers.onArrowUp).toHaveBeenCalled();
    
    const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    mockRef.current.dispatchEvent(arrowDownEvent);
    expect(mockHandlers.onArrowDown).toHaveBeenCalled();
    
    // Test cleanup function
    cleanup();
    expect(mockRef.current.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
  
  test('does nothing if ref.current is null', () => {
    const mockRef = { current: null };
    const mockHandlers = { onEnter: jest.fn() };
    
    const cleanup = addKeyboardNavigation(mockRef, mockHandlers);
    
    expect(cleanup).toBeUndefined();
  });
});

describe('checkColorContrast', () => {
  test('calculates contrast ratio correctly', () => {
    // Black text on white background should have high contrast
    const blackOnWhite = checkColorContrast('#000000', '#FFFFFF');
    expect(parseFloat(blackOnWhite.ratio)).toBeGreaterThan(20); // Should be around 21
    expect(blackOnWhite.passesAA).toBe(true);
    expect(blackOnWhite.passesAAA).toBe(true);
    
    // White text on white background should have no contrast
    const whiteOnWhite = checkColorContrast('#FFFFFF', '#FFFFFF');
    expect(parseFloat(whiteOnWhite.ratio)).toBe(1);
    expect(whiteOnWhite.passesAA).toBe(false);
    expect(whiteOnWhite.passesAAA).toBe(false);
    
    // Green text on black background (terminal colors)
    const greenOnBlack = checkColorContrast('#00FF00', '#000000');
    expect(parseFloat(greenOnBlack.ratio)).toBeGreaterThan(15);
    expect(greenOnBlack.passesAA).toBe(true);
    expect(greenOnBlack.passesAAA).toBe(true);
  });
  
  test('handles invalid hex colors', () => {
    const invalidResult = checkColorContrast('invalid', '#FFFFFF');
    expect(parseFloat(invalidResult.ratio)).toBe(1);
    expect(invalidResult.passesAA).toBe(false);
    expect(invalidResult.passesAAA).toBe(false);
  });
});

describe('addScreenReaderOnlyStyles', () => {
  test('adds sr-only styles to document head', () => {
    addScreenReaderOnlyStyles();
    
    expect(document.createElement).toHaveBeenCalledWith('style');
    expect(document.head.appendChild).toHaveBeenCalled();
    
    const styleElement = document.getElementById('sr-only-styles');
    expect(styleElement).not.toBeNull();
    expect(styleElement.textContent).toContain('.sr-only');
  });
  
  test('does not add styles if they already exist', () => {
    // Add styles first
    addScreenReaderOnlyStyles();
    
    // Clear mocks
    jest.clearAllMocks();
    
    // Call again
    addScreenReaderOnlyStyles();
    
    // Should not create or append anything
    expect(document.createElement).not.toHaveBeenCalled();
    expect(document.head.appendChild).not.toHaveBeenCalled();
  });
});
