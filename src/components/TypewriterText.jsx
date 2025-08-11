import { useState, useEffect } from 'react';
import soundEffects from '../utils/soundEffects';

/**
 * TypewriterText component that animates text with a typewriter effect
 * @param {Object} props - Component props
 * @param {string} props.text - The text to animate
 * @param {number} props.speed - Speed of typing in ms per character (default: 30)
 * @param {boolean} props.soundEnabled - Whether to play typing sounds
 * @param {Function} props.onComplete - Callback when animation completes
 */
const TypewriterText = ({ text, speed = 30, soundEnabled = false, onComplete = () => {} }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        // Add next character
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        
        // Play sound if enabled
        if (soundEnabled && text[currentIndex] !== ' ') {
          soundEffects.play('typing');
        }
      }, speed);
      
      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete();
    }
  }, [currentIndex, text, speed, soundEnabled, isComplete, onComplete]);
  
  return <span className="typewriter-text">{displayedText}</span>;
};

export default TypewriterText;
