/**
 * Sound effects manager for terminal portfolio
 */
import audioGenerator from './audioGenerator';

class SoundEffects {
  constructor() {
    this.enabled = false;
    this.initialized = false;
  }

  /**
   * Initialize sound effects
   */
  init() {
    if (typeof window === 'undefined' || this.initialized) return;
    
    this.initialized = true;
    
    // Initialize audio generator
    audioGenerator.init();
  }

  // No longer needed - using audioGenerator instead

  /**
   * Enable sound effects
   */
  enable() {
    this.enabled = true;
    this.init();
  }

  /**
   * Disable sound effects
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Toggle sound effects
   */
  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) this.init();
    return this.enabled;
  }

  /**
   * Play a sound if enabled
   */
  play(name) {
    if (!this.enabled || !this.initialized) return;
    
    // Use audioGenerator to play sounds
    switch (name) {
      case 'typing':
        audioGenerator.typing();
        break;
      case 'enter':
        audioGenerator.enter();
        break;
      case 'error':
        audioGenerator.error();
        break;
      case 'startup':
        audioGenerator.startup();
        break;
      case 'click':
        audioGenerator.click();
        break;
      default:
        console.warn(`Sound '${name}' not found`);
    }
  }
}

// Export singleton instance
const soundEffects = new SoundEffects();
export default soundEffects;
