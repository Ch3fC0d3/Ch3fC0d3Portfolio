/**
 * Accessibility helper functions for terminal portfolio
 * These functions help ensure the terminal interface is accessible to all users
 */

/**
 * Announces a message to screen readers using ARIA live regions
 * @param {string} message - The message to announce
 * @param {string} priority - The priority level ('polite' or 'assertive')
 */
export function announceToScreenReader(message, priority = 'polite') {
  // Create or get the live region element
  let liveRegion = document.getElementById('screen-reader-announce');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'screen-reader-announce';
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);
  }
  
  // Set the message
  liveRegion.textContent = message;
  
  // Clear the message after a delay to prevent repeated announcements
  setTimeout(() => {
    liveRegion.textContent = '';
  }, 1000);
}

/**
 * Adds keyboard navigation support to a component
 * @param {Object} ref - React ref to the element
 * @param {Object} options - Object containing keyboard event handlers
 * @param {Function} [options.onEnter] - Function to call when Enter is pressed
 * @param {Function} [options.onEscape] - Function to call when Escape is pressed
 * @param {Function} [options.onArrowUp] - Function to call when Arrow Up is pressed
 * @param {Function} [options.onArrowDown] - Function to call when Arrow Down is pressed
 */
export function addKeyboardNavigation(ref, options = {}) {
  const { onEnter, onEscape, onArrowUp, onArrowDown } = options || {};
  if (!ref.current) return;
  
  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter(event);
        }
        break;
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape(event);
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp(event);
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown(event);
        }
        break;
      default:
        break;
    }
  };
  
  ref.current.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => {
    if (ref.current) {
      ref.current.removeEventListener('keydown', handleKeyDown);
    }
  };
}

/**
 * Checks if the contrast ratio between two colors meets WCAG standards
 * @param {string} foreground - Foreground color in hex format (#RRGGBB)
 * @param {string} background - Background color in hex format (#RRGGBB)
 * @returns {Object} - Object containing contrast ratio and pass/fail status
 */
export function checkColorContrast(foreground, background) {
  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  // Calculate relative luminance
  const calculateLuminance = (color) => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;
    
    const { r, g, b } = rgb;
    
    const rsrgb = r / 255;
    const gsrgb = g / 255;
    const bsrgb = b / 255;
    
    const r1 = rsrgb <= 0.03928 ? rsrgb / 12.92 : Math.pow((rsrgb + 0.055) / 1.055, 2.4);
    const g1 = gsrgb <= 0.03928 ? gsrgb / 12.92 : Math.pow((gsrgb + 0.055) / 1.055, 2.4);
    const b1 = bsrgb <= 0.03928 ? bsrgb / 12.92 : Math.pow((bsrgb + 0.055) / 1.055, 2.4);
    
    return 0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1;
  };
  
  // Calculate contrast ratio
  const l1 = calculateLuminance(foreground);
  const l2 = calculateLuminance(background);
  
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return {
    ratio: ratio.toFixed(2),
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7,
  };
}

/**
 * Adds CSS for screen reader only elements
 */
export function addScreenReaderOnlyStyles() {
  // Check if styles already exist
  if (document.getElementById('sr-only-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'sr-only-styles';
  style.textContent = `
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
  `;
  
  document.head.appendChild(style);
}

// Initialize screen reader styles when module is imported
addScreenReaderOnlyStyles();
