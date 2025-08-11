import { useState, useEffect } from 'react';

/**
 * GlitchEffect component that adds random glitches to text
 * @param {Object} props - Component props
 * @param {string} props.text - The text to display with glitch effect
 * @param {number} props.intensity - Glitch intensity (0-10, default: 3)
 * @param {boolean} props.active - Whether the glitch effect is active
 */
const GlitchEffect = ({ text, intensity = 3, active = true }) => {
  const [displayText, setDisplayText] = useState(text);
  
  useEffect(() => {
    // Update display text when source text changes
    setDisplayText(text);
  }, [text]);
  
  useEffect(() => {
    if (!active) {
      setDisplayText(text);
      return;
    }
    
    // Characters to use for glitches
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/\\~`';
    
    // Calculate glitch frequency based on intensity (1-10)
    const glitchInterval = Math.max(5000 - intensity * 400, 1000);
    const glitchDuration = Math.min(intensity * 50, 300);
    
    // Function to create a glitched version of the text
    const createGlitchedText = () => {
      if (!text) return '';
      
      // Determine how many characters to glitch (based on intensity)
      const maxGlitches = Math.ceil(text.length * (intensity / 100));
      const numGlitches = Math.floor(Math.random() * maxGlitches) + 1;
      
      // Create a copy of the text as an array
      const chars = [...text];
      
      // Replace random characters with glitch characters
      for (let i = 0; i < numGlitches; i++) {
        const pos = Math.floor(Math.random() * text.length);
        const glitchChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        chars[pos] = glitchChar;
      }
      
      return chars.join('');
    };
    
    // Set up glitch interval
    const glitchTimer = setInterval(() => {
      // Create and display glitched text
      setDisplayText(createGlitchedText());
      
      // Reset to normal text after glitch duration
      setTimeout(() => {
        setDisplayText(text);
      }, glitchDuration);
    }, glitchInterval);
    
    return () => {
      clearInterval(glitchTimer);
    };
  }, [text, intensity, active]);
  
  return (
    <span className={`glitch-text ${active ? 'active' : ''}`}>
      {displayText}
    </span>
  );
};

export default GlitchEffect;
