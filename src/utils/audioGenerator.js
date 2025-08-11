/**
 * Audio Generator - Creates programmatic sound effects using Web Audio API
 * This replaces the need for external sound files
 */

class AudioGenerator {
  constructor() {
    this.context = null;
    this.initialized = false;
  }

  /**
   * Initialize the audio context
   */
  init() {
    if (typeof window === 'undefined') return false;
    
    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      
      this.context = new AudioContext();
      this.initialized = true;
      return true;
    } catch (e) {
      console.error('Failed to initialize AudioGenerator:', e);
      return false;
    }
  }

  /**
   * Generate a typing sound
   * @returns {Promise} Promise that resolves when sound is played
   */
  typing() {
    if (!this.initialized && !this.init()) return Promise.resolve();
    
    return this.generateSound({
      type: 'sine',
      frequency: 600 + Math.random() * 200,
      duration: 0.015,
      volume: 0.05,
      attack: 0.001,
      decay: 0.02,
      detune: Math.random() * 30 - 15
    });
  }

  /**
   * Generate an enter key sound
   * @returns {Promise} Promise that resolves when sound is played
   */
  enter() {
    if (!this.initialized && !this.init()) return Promise.resolve();
    
    return this.generateSound({
      type: 'triangle',
      frequency: 400,
      duration: 0.08,
      volume: 0.15,
      attack: 0.001,
      decay: 0.1,
      detune: -10
    });
  }

  /**
   * Generate an error sound
   * @returns {Promise} Promise that resolves when sound is played
   */
  error() {
    if (!this.initialized && !this.init()) return Promise.resolve();
    
    const baseFreq = 200;
    
    // Play two tones in sequence
    return this.generateSound({
      type: 'sawtooth',
      frequency: baseFreq * 1.5,
      duration: 0.1,
      volume: 0.2,
      attack: 0.001,
      decay: 0.1
    }).then(() => {
      return this.generateSound({
        type: 'sawtooth',
        frequency: baseFreq,
        duration: 0.15,
        volume: 0.2,
        attack: 0.001,
        decay: 0.15
      });
    });
  }

  /**
   * Generate a startup sound
   * @returns {Promise} Promise that resolves when sound is played
   */
  startup() {
    if (!this.initialized && !this.init()) return Promise.resolve();
    
    const baseFreq = 440;
    const duration = 0.15;
    
    // Play a sequence of tones
    return this.generateSound({
      type: 'sine',
      frequency: baseFreq,
      duration: duration,
      volume: 0.2,
      attack: 0.01,
      decay: duration
    }).then(() => {
      return this.generateSound({
        type: 'sine',
        frequency: baseFreq * 1.5,
        duration: duration,
        volume: 0.2,
        attack: 0.01,
        decay: duration
      });
    }).then(() => {
      return this.generateSound({
        type: 'sine',
        frequency: baseFreq * 2,
        duration: duration * 1.5,
        volume: 0.2,
        attack: 0.01,
        decay: duration * 1.5
      });
    });
  }

  /**
   * Generate a click sound
   * @returns {Promise} Promise that resolves when sound is played
   */
  click() {
    if (!this.initialized && !this.init()) return Promise.resolve();
    
    return this.generateSound({
      type: 'sine',
      frequency: 800 + Math.random() * 300,
      duration: 0.03,
      volume: 0.1,
      attack: 0.001,
      decay: 0.03,
      detune: Math.random() * 20 - 10
    });
  }

  /**
   * Generate a sound with the given parameters
   * @param {Object} options - Sound options
   * @returns {Promise} Promise that resolves when sound is played
   */
  generateSound(options) {
    if (!this.initialized && !this.init()) return Promise.resolve();
    
    const {
      type = 'sine',
      frequency = 440,
      duration = 0.1,
      volume = 0.2,
      attack = 0.01,
      // decay value is used in the envelope calculation below
      decay = 0.1,
      detune = 0
    } = options;
    
    return new Promise(resolve => {
      try {
        // Create oscillator
        const oscillator = this.context.createOscillator();
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        oscillator.detune.value = detune;
        
        // Create gain node for volume control
        const gainNode = this.context.createGain();
        gainNode.gain.value = 0;
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        // Schedule envelope
        const now = this.context.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + attack);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + attack + decay);
        
        // Start and stop oscillator
        oscillator.start(now);
        oscillator.stop(now + duration);
        
        // Clean up
        oscillator.onended = () => {
          oscillator.disconnect();
          gainNode.disconnect();
          resolve();
        };
      } catch (e) {
        console.error('Error generating sound:', e);
        resolve();
      }
    });
  }
}

// Export singleton instance
const audioGenerator = new AudioGenerator();
export default audioGenerator;
