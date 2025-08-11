import { useEffect, useRef, useState } from 'react';

/**
 * MusicVisualizer component that creates a terminal-style audio visualization
 * @param {Object} props - Component props
 * @param {boolean} props.active - Whether the visualizer is active
 * @param {string} props.audioSrc - Source URL for the audio file
 * @param {string} props.visualStyle - Style of visualization ('bars', 'wave', 'dots')
 */
const MusicVisualizer = ({ active = false, audioSrc = '', visualStyle = 'bars' }) => {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Initialize audio context and analyzer
  useEffect(() => {
    if (!active) return;
    
    // Create audio context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;
    
    // Set up audio element if provided
    if (audioSrc && audioRef.current) {
      audioRef.current.src = audioSrc;
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [active, audioSrc]);
  
  // Draw visualization
  useEffect(() => {
    if (!active || !analyserRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Resize canvas to fit container
    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Animation function
    const draw = () => {
      if (!active) return;
      
      animationRef.current = requestAnimationFrame(draw);
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Different visualization styles
      switch (visualStyle) {
        case 'bars':
          drawBars(ctx, dataArray, bufferLength, canvas);
          break;
        case 'wave':
          drawWave(ctx, dataArray, bufferLength, canvas);
          break;
        case 'dots':
          drawDots(ctx, dataArray, bufferLength, canvas);
          break;
        default:
          drawBars(ctx, dataArray, bufferLength, canvas);
      }
    };
    
    draw();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, visualStyle]);
  
  // Handle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Draw bars visualization
  const drawBars = (ctx, dataArray, bufferLength, canvas) => {
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i] / 2;
      
      // Terminal green color with varying opacity based on frequency
      ctx.fillStyle = `rgba(0, ${Math.min(255, 150 + barHeight)}, 0, 0.8)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1;
    }
  };
  
  // Draw wave visualization
  const drawWave = (ctx, dataArray, bufferLength, canvas) => {
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00ff00';
    ctx.beginPath();
    
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * (canvas.height / 2);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };
  
  // Draw dots visualization
  const drawDots = (ctx, dataArray, bufferLength, canvas) => {
    const radius = 2;
    const step = Math.floor(bufferLength / 32); // Reduce number of dots
    
    for (let i = 0; i < bufferLength; i += step) {
      const percent = i / bufferLength;
      const amplitude = dataArray[i] / 256;
      
      // Calculate position in a circular pattern
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radiusX = centerX * amplitude * 0.8;
      const radiusY = centerY * amplitude * 0.8;
      
      const x = centerX + radiusX * Math.cos(percent * Math.PI * 2);
      const y = centerY + radiusY * Math.sin(percent * Math.PI * 2);
      
      ctx.beginPath();
      ctx.arc(x, y, radius + (amplitude * 5), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, ${Math.min(255, 150 + dataArray[i])}, 0, 0.8)`;
      ctx.fill();
    }
  };
  
  if (!active) return null;
  
  return (
    <div className="music-visualizer">
      <canvas ref={canvasRef} className="visualizer-canvas" />
      <audio ref={audioRef} loop />
      <div className="visualizer-controls">
        <button onClick={togglePlay} className="terminal-btn">
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  );
};

export default MusicVisualizer;
