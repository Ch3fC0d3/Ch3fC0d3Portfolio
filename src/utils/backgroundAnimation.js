/**
 * Canvas-based background animation as a fallback for video background
 * Creates a matrix-style digital rain effect that fits the terminal theme
 */

class BackgroundAnimation {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    // Tag the fallback canvas for clarity if no id present
    if (this.canvas && !this.canvas.id) {
      this.canvas.id = 'bg-canvas';
    }

    // If this canvas already has a WebGL context, do NOT attach a 2D context.
    // This avoids the "Canvas has an existing context of a different type" error
    // when co-existing with React Three Fiber / Three.js canvases.
    const hasGLContext = (() => {
      try {
        return !!(
          this.canvas?.getContext?.('webgl') ||
          this.canvas?.getContext?.('webgl2')
        );
      } catch {
        return false;
      }
    })();

    this.disabled = false;
    if (hasGLContext) {
      this.disabled = true;
      this.ctx = null;
      console.warn('[BackgroundAnimation] Aborting: target canvas already has a WebGL context', {
        id: this.canvas?.id,
        className: this.canvas?.className,
      });
    } else {
      this.ctx = this.canvas.getContext('2d');
      if (!this.ctx) {
        this.disabled = true;
        console.warn('[BackgroundAnimation] Aborting: failed to acquire 2D context', {
          id: this.canvas?.id,
          className: this.canvas?.className,
        });
      }
    }
    this.animationId = null;
    this.isRunning = false;
    
    // Default options
    this.options = {
      color: options.color || '#00FF00',
      backgroundColor: options.backgroundColor || 'rgba(0, 0, 0, 0.95)',
      fontSize: options.fontSize || 14,
      speed: options.speed || 1.5,
      density: options.density || 0.8,
      glitchFrequency: options.glitchFrequency || 0.03,
      ...options
    };
    
    // Characters for the matrix effect
    this.chars = '01アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    this.drops = [];
    
    // Initialize only if enabled
    if (!this.disabled) {
      this.resize();
      window.addEventListener('resize', this.resize.bind(this));
    }
  }
  
  resize() {
    // Make canvas full screen
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Reset drops
    this.initDrops();
  }
  
  initDrops() {
    const columns = Math.floor(this.canvas.width / this.options.fontSize);
    this.drops = [];
    
    // Create drops based on density
    for (let i = 0; i < columns * this.options.density; i++) {
      this.drops.push({
        x: Math.floor(Math.random() * columns) * this.options.fontSize,
        y: Math.random() * -100, // Start above the canvas
        speed: Math.random() * 2 + this.options.speed,
        length: Math.floor(Math.random() * 15) + 5,
        opacity: Math.random() * 0.5 + 0.5,
        chars: []
      });
      
      // Generate random characters for this drop
      for (let j = 0; j < this.drops[i].length; j++) {
        this.drops[i].chars.push(this.getRandomChar());
      }
    }
  }
  
  getRandomChar() {
    return this.chars.charAt(Math.floor(Math.random() * this.chars.length));
  }
  
  start() {
    if (this.disabled || !this.ctx) return;
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.animate();
  }
  
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isRunning = false;
    
    // Clear canvas
    if (this.ctx) {
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
  
  animate() {
    if (this.disabled || !this.ctx) return;
    // Semi-transparent background to create trail effect
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Set text properties
    this.ctx.font = `${this.options.fontSize}px monospace`;
    
    // Update and draw each drop
    for (let i = 0; i < this.drops.length; i++) {
      const drop = this.drops[i];
      
      // Draw characters in the drop with different opacities
      for (let j = 0; j < drop.chars.length; j++) {
        // First character is brightest
        const opacity = j === 0 ? 1 : 1 - (j / drop.length);
        
        // Set color with opacity
        this.ctx.fillStyle = this.options.color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
        
        // Draw character
        const y = drop.y - (j * this.options.fontSize);
        if (y > 0 && y < this.canvas.height) {
          this.ctx.fillText(drop.chars[j], drop.x, y);
        }
        
        // Randomly change characters (except the first one which changes every frame)
        if (j > 0 && Math.random() > 0.98) {
          drop.chars[j] = this.getRandomChar();
        }
      }
      
      // Always change the first character
      drop.chars[0] = this.getRandomChar();
      
      // Move drop down
      drop.y += drop.speed;
      
      // Reset drop when it goes off screen
      if (drop.y - (drop.length * this.options.fontSize) > this.canvas.height) {
        drop.y = Math.random() * -100;
        drop.speed = Math.random() * 2 + this.options.speed;
      }
    }
    
    // Add occasional glitch effect
    if (Math.random() < this.options.glitchFrequency) {
      this.addGlitch();
    }
    
    // Continue animation
    if (this.isRunning) {
      this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
  }
  
  addGlitch() {
    if (this.disabled || !this.ctx) return;
    // Random glitch rectangle
    const x = Math.random() * this.canvas.width;
    const y = Math.random() * this.canvas.height;
    const width = Math.random() * 100 + 50;
    const height = Math.random() * 10 + 5;
    
    // Save context
    this.ctx.save();
    
    // Apply random transformations
    if (Math.random() > 0.5) {
      this.ctx.translate(x, y);
      this.ctx.rotate(Math.random() * 0.1);
      this.ctx.translate(-x, -y);
    }
    
    // Draw glitch effect
    this.ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`;
    this.ctx.fillRect(x, y, width, height);
    
    // Restore context
    this.ctx.restore();
  }
}

export default BackgroundAnimation;
