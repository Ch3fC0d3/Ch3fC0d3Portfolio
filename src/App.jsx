import { useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page } from 'react-pdf'
import './App.css'
import TypewriterText from './components/TypewriterText'
import GlitchEffect from './components/GlitchEffect'
import HelpSidebar from './components/HelpSidebar'
import ErrorBoundary from './components/ErrorBoundary'
import VideoBackground from './components/VideoBackground'
import AITastingWheelHUD from './components/AITastingWheelHUD.tsx'
import HoloLogoCarousel from './components/HoloLogoCarousel'
import soundEffects from './utils/soundEffects'
import BackgroundAnimation from './utils/backgroundAnimation'
import { announceToScreenReader, addKeyboardNavigation, checkColorContrast } from './utils/accessibilityHelper'
// Note: react-pdf v10+ doesn't require CSS imports

// Import user data
import {
  USER_INFO,
  FILE_SYSTEM,
  PROJECTS,
  ARTIFACTS,
  ABOUT_TEXT,
  WELCOME_ASCII,
  SKILLS,
  CONTACT_CONFIG,
  RESUME_PATH,
  EASTER_EGGS,
  HELP_TEXT
} from './data/userData'

// Set up PDF.js worker
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Lightweight wrapper to load Spline viewer script once and render the custom element
function DynamicSplineViewer({ url }) {
  useEffect(() => {
    const exists = document.querySelector('script[data-spline-viewer]')
      || !!customElements.get?.('spline-viewer');
    if (!exists) {
      const s = document.createElement('script');
      s.type = 'module';
      s.src = 'https://unpkg.com/@splinetool/viewer@1.10.44/build/spline-viewer.js';
      s.setAttribute('data-spline-viewer', 'true');
      document.head.appendChild(s);
    }
  }, []);
  return (
    <spline-viewer
      loading-anim-type="spinner-small-dark"
      url={url}
      style={{ display:'block', width:'100%', height:'100%', border:'none' }}
    />
  );
}

function App() {
  const [cwd, setCwd] = useState('/')
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([]) // strings of previous commands
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [output, setOutput] = useState([]) // array of { type: 'line'|'block', content: string|string[] }
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [pdfNumPages, setPdfNumPages] = useState(null)
  const [pdfPageNumber, setPdfPageNumber] = useState(1)
  // Spline viewer popup for car3d
  const [showSplineModal, setShowSplineModal] = useState(false)
  const [splineUrl, setSplineUrl] = useState('https://prod.spline.design/Vq7IxclyxrQXYwAT/scene.splinecode')
  const [contactForm, setContactForm] = useState({
    active: false,
    step: 0,
    data: { name: '', email: '', message: '' }
  })
  const [typewriterActive, setTypewriterActive] = useState(true) // Enable typewriter by default
  const [soundEnabled, setSoundEnabled] = useState(false) // Disable sound by default
  const [glitchActive, setGlitchActive] = useState(true) // Enable glitch effects by default
  const [showHelpSidebar, setShowHelpSidebar] = useState(true) // Help sidebar starts open
  const [showProjectsModal, setShowProjectsModal] = useState(false)
  const inputRef = useRef(null)
  const bottomRef = useRef(null)
  const videoRef = useRef(null) // Reference for video element
  const canvasRef = useRef(null) // Reference for canvas animation
  const [useCanvasBackground, setUseCanvasBackground] = useState(false) // Toggle between video and canvas

  // Effect to handle video playback
  useEffect(() => {
    if (videoRef.current) {
      // Try to play the video when component mounts
      videoRef.current.play()
        .then(() => {
          // Ensure we show video (not canvas) when autoplay succeeds
          setUseCanvasBackground(false);
          if (canvasRef.current) canvasRef.current.style.opacity = '0';
          if (videoRef.current) videoRef.current.style.opacity = '0.4';
        })
        .catch(e => {
          console.warn('Auto-play prevented by browser:', e);
          // Fallback to canvas animation for now
          setUseCanvasBackground(true);
          if (videoRef.current) videoRef.current.style.opacity = '0';
          if (canvasRef.current) canvasRef.current.style.opacity = '0.4';

          // Add event listener for user interaction to play video
          const playVideoOnInteraction = () => {
            if (!videoRef.current) return;
            videoRef.current.play()
              .then(() => {
                // Switch back to video once user interacts and playback succeeds
                setUseCanvasBackground(false);
                if (canvasRef.current) canvasRef.current.style.opacity = '0';
                if (videoRef.current) videoRef.current.style.opacity = '0.4';
              })
              .catch(err => {
                console.error('Video play error after interaction:', err);
                // If video still fails to play after interaction, keep canvas
                setUseCanvasBackground(true);
                if (videoRef.current) videoRef.current.style.opacity = '0';
                if (canvasRef.current) canvasRef.current.style.opacity = '0.4';
              });
            // Remove event listeners after first interaction
            document.removeEventListener('click', playVideoOnInteraction);
            document.removeEventListener('keydown', playVideoOnInteraction);
          };
          document.addEventListener('click', playVideoOnInteraction);
          document.addEventListener('keydown', playVideoOnInteraction);
        });
    }
  }, []);
  
  // Effect to handle canvas animation fallback
  useEffect(() => {
    let animation = null;
    
    if (useCanvasBackground && canvasRef.current) {
      // Initialize and start canvas animation
      animation = new BackgroundAnimation(canvasRef.current, {
        color: 'rgba(0, 255, 0, 1)', // Matrix green
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        fontSize: 16,
        speed: 1.2,
        density: 0.7,
        glitchFrequency: 0.02
      });
      
      // Start animation
      animation.start();
      
      // Hide video, show canvas
      if (videoRef.current) videoRef.current.style.opacity = '0';
      canvasRef.current.style.opacity = '0.4';
      
      console.log('Canvas animation fallback activated');
    } else {
      // Show video, hide canvas if we're not using canvas background
      if (canvasRef.current) canvasRef.current.style.opacity = '0';
      if (videoRef.current) videoRef.current.style.opacity = '0.4';
    }
    
    // Cleanup function
    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [useCanvasBackground]);

  useEffect(() => {
    inputRef.current?.focus()
    
    // Initialize sound effects
    if (soundEnabled) {
      soundEffects.init()
      soundEffects.enable()
      // Play startup sound
      setTimeout(() => soundEffects.play('startup'), 500)
    }
    
    // Check color contrast for accessibility
    const contrastResult = checkColorContrast('#00FF00', '#000000');
    if (!contrastResult.passesAA) {
      console.warn(`Terminal color contrast ratio (${contrastResult.ratio}) does not meet WCAG AA standards.`);
    }
  }, [soundEnabled])

  // Seed startup transcript once per session
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    try {
      if (sessionStorage.getItem('startupTranscriptShown')) return;
      // Banner
      print([WELCOME_ASCII], 'block');
      // Simulate: gabriel@terminal-portfolio:/$ projects
      printCommand('projects');
      print(['Opening projects gallery… Hover to brighten; click to visit. [Esc] to close.']);
      // Simulate: gabriel@terminal-portfolio:/$ about
      printCommand('about');
      print(ABOUT_TEXT.split('\n'));
      sessionStorage.setItem('startupTranscriptShown', '1');
    } catch { /* noop: sessionStorage may be unavailable */ }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [output])
  
  // Add keyboard navigation for PDF modal
  useEffect(() => {
    if (!showPdfModal) return;
    
    const modalRef = document.querySelector('.pdf-modal');
    if (!modalRef) return;
    
    const cleanup = addKeyboardNavigation({
      current: modalRef
    }, {
      onEscape: () => setShowPdfModal(false),
      onArrowLeft: () => setPdfPageNumber(prev => Math.max(1, prev - 1)),
      onArrowRight: () => setPdfPageNumber(prev => Math.min(pdfNumPages || 1, prev + 1))
    });
    
    // Announce modal open to screen readers
    announceToScreenReader('Resume PDF opened. Use arrow keys to navigate pages and Escape to close.', 'polite');
    
    return cleanup;
  }, [showPdfModal, pdfNumPages])

  useEffect(() => {
    // Add keyboard navigation for accessibility
    addKeyboardNavigation({
      onEscape: () => {
        if (showPdfModal) {
          setShowPdfModal(false);
          announceToScreenReader('Resume PDF viewer closed', 'polite');
        }
        if (showProjectsModal) {
          setShowProjectsModal(false);
          announceToScreenReader('Projects gallery closed', 'polite');
        }
        if (contactForm.active) {
          setContactForm({ active: false, step: 0, data: { name: '', email: '', message: '' } });
          announceToScreenReader('Contact form closed', 'polite');
        }
        if (showHelpSidebar) {
          setShowHelpSidebar(false);
          announceToScreenReader('Help sidebar closed', 'polite');
        }
      },
      onArrowLeft: () => {
        if (showPdfModal) {
          setPdfPageNumber(prev => Math.max(1, prev - 1));
        }
      },
      onArrowRight: () => {
        if (showPdfModal) {
          setPdfPageNumber(prev => Math.min(pdfNumPages || 1, prev + 1));
        }
      },
      onQuestionMark: (e) => {
        // Toggle help sidebar with ? key
        if (e.shiftKey) {
          setShowHelpSidebar(prev => !prev);
          announceToScreenReader(showHelpSidebar ? 'Help sidebar closed' : 'Help sidebar opened', 'polite');
        }
      }
    });
  }, [showPdfModal, contactForm.active, pdfNumPages, showHelpSidebar, showProjectsModal]);

  const prompt = useMemo(() => `${USER_INFO.prompt}@${USER_INFO.host}:${cwd}$`, [cwd])
  const projectItems = useMemo(() =>
    Object.values(PROJECTS).map(p => ({ src: p.image, label: p.name, href: p.link })),
  [])

  function print(lines, type = 'line') {
    // Announce to screen readers for important messages
    if (type === 'error') {
      const message = Array.isArray(lines) ? lines.join(' ') : String(lines);
      announceToScreenReader(message, 'assertive');
    } else if (type === 'line' && !Array.isArray(lines) && typeof lines === 'string' && lines.startsWith('Command')) {
      announceToScreenReader(lines, 'polite');
    }
    
    setOutput((prev) => [
      ...prev,
      ...(Array.isArray(lines) 
        ? lines.map((l) => ({ 
            type, 
            content: l,
            animated: typewriterActive && type === 'line'
          })) 
        : [{ 
            type, 
            content: String(lines),
            animated: typewriterActive && type === 'line'
          }])
    ])
  }
  
  function printInteractive(content) {
    setOutput((prev) => [...prev, { type: 'interactive', content }])
  }

  function printCommand(command) {
    setOutput((prev) => [
      ...prev,
      { type: 'line', content: `${prompt} ${command}` },
    ])
  }

  function clearScreen() {
    setOutput([])
  }

  function handleCommand(raw) {
    const command = raw.trim()
    if (!command) return
    
    // If we're in contact form mode, handle input differently
    if (contactForm.active) {
      handleContactInput(command)
      return
    }

    printCommand(command)

    const [cmd, ...args] = command.split(/\s+/)
    switch (cmd) {
      case 'help':
        print(HELP_TEXT.split('\n'))
        break
      case 'ls': {
        const path = cwd
        const items = FILE_SYSTEM[path] || []
        
        if (path === '/projects') {
          // Enhanced project listing with clickable items
          print(['Available projects:'])
          items.forEach(project => {
            printInteractive(
              <div className="project-item">
                <span className="project-name">{project}</span>
                <button 
                  className="terminal-btn" 
                  onClick={() => handleProjectClick(project)}
                >
                  view details
                </button>
              </div>
            )
          })
        } else {
          print([items.join('  ')])
        }
        break
      }
      case 'cd': {
        const target = args[0]
        if (!target) {
          print(['Usage: cd <dir>'])
          break
        }
        if (target === '/' || target === '~') {
          setCwd('/')
          break
        }
        const newPath = target.startsWith('/') ? target : `${cwd === '/' ? '' : cwd}/${target}`
        if (FILE_SYSTEM[newPath]) {
          setCwd(newPath)
        } else {
          print([`cd: no such file or directory: ${target}`])
        }
        break
      }
      case 'cat': {
        const file = args[0]
        if (!file) {
          print(['Usage: cat <file>'])
          break
        }
        if (file === 'about.txt') {
          print(ABOUT_TEXT.split('\n'))
        } else {
          print([`cat: ${file}: No such file`])
        }
        break
      }
      case 'open': {
        const target = (args[0] || '').toLowerCase();
        if (target === 'resume' || target === 'resume.pdf') {
          print(['Opening resume in less-like viewer. Use j/k to navigate, q to close.'])
          setShowPdfModal(true)
          // Focus will be returned to input when modal is closed
        } else {
          print(['open: unsupported target'])
        }
        break
      }
      case 'video': {
        const mode = (args[0] || '').toLowerCase();
        if (mode === 'on') {
          setUseCanvasBackground(false);
          print(['Attempting to enable video background…']);
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.muted = true; // ensure autoplay-friendly
              videoRef.current.play().then(() => {
                console.log('[Video] play() success via command');
              }).catch((err) => {
                console.warn('[Video] play() failed, will require interaction:', err);
              });
            }
          }, 0);
        } else if (mode === 'off') {
          setUseCanvasBackground(true);
          print(['Using canvas background.']);
        } else {
          print(['Usage: video [on|off]']);
        }
        break;
      }
      case 'projects': {
        // Open holographic projects carousel modal
        setShowProjectsModal(true)
        print(['Opening projects gallery… Hover to brighten; click to visit. [Esc] to close.'])
        break
      }
      case 'contact': {
        if (args[0] === '--form') {
          print(['Starting contact form. Press Ctrl+C at any time to cancel.'])
          print(['What is your name?'])
          setContactForm({
            active: true,
            step: 0,
            data: { name: '', email: '', message: '' }
          })
        } else {
          print(['Usage: contact --form'])
        }
        break
      }
      case 'artifacts': {
        print(['Artifacts and creative work:'])
        ARTIFACTS.forEach(artifact => {
          printInteractive(
            <div className="artifact-item">
              <span className="artifact-name">{artifact.name}</span>
              <span className="artifact-desc"> - {artifact.description}</span>
              <a 
                href={artifact.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="artifact-link"
              >
                [visit]
              </a>
            </div>
          )
        })
        break
      }
      case 'history': {
        if (history.length === 0) print(['(empty)'])
        else history.slice(-20).forEach((h) => print([h]))
        break
      }
      case 'clear': {
        clearScreen()
        break
      }
      case 'toggle-sound': {
        const newSoundState = !soundEnabled
        setSoundEnabled(newSoundState)
        if (newSoundState) {
          soundEffects.init()
          soundEffects.enable()
          soundEffects.play('startup')
        } else {
          soundEffects.disable()
        }
        print([`Sound effects ${newSoundState ? 'enabled' : 'disabled'}.`])
        break
      }
      case 'toggle-typewriter': {
        setTypewriterActive(!typewriterActive)
        print([`Typewriter effect ${!typewriterActive ? 'enabled' : 'disabled'}.`])
        break
      }
      case 'toggle-glitch': {
        setGlitchActive(!glitchActive)
        print([`Glitch effect ${!glitchActive ? 'enabled' : 'disabled'}.`])
        break
      }
      case 'sudo': {
        if (args.join(' ') === 'make me a sandwich') {
          print(['Okay. You are now a sandwich. 🥪'])
        } else {
          print(['sudo: permission denied'])
        }
        break
      }
      case 'fortune': {
        const fortunes = [
          'The best way to predict the future is to create it.',
          'Code is like humor. When you have to explain it, it\'s bad.',
          'The only constant in software development is change.',
          'It\'s not a bug – it\'s an undocumented feature.',
          'Documentation is like a rare Pokémon. Hard to find but worth it.',
          'The best error message is the one that never shows up.',
          'If debugging is the process of removing software bugs, then programming is the process of putting them in.',
        ]
        const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)]
        print([randomFortune])
        break
      }
      case 'about': {
        print(ABOUT_TEXT.split('\n'))
        break
      }
      case 'skills': {
        print(['My Skills:'])
        
        // Frontend skills
        print(['\nFrontend:'])
        SKILLS.frontend.forEach(skill => {
          print([`  • ${skill}`])
        })
        
        // Backend skills
        print(['\nBackend:'])
        SKILLS.backend.forEach(skill => {
          print([`  • ${skill}`])
        })
        
        // DevOps skills
        print(['\nDevOps:'])
        SKILLS.devops.forEach(skill => {
          print([`  • ${skill}`])
        })
        
        // Tools
        print(['\nTools:'])
        SKILLS.tools.forEach(skill => {
          print([`  • ${skill}`])
        })
        
        break
      }
      default:
        // Check for easter eggs
        if (EASTER_EGGS[command]) {
          print([EASTER_EGGS[command]])
        } else {
          print([{ type: 'error', content: `Command not found: ${command}` }])
          if (soundEnabled) {
            soundEffects.play('error')
          }
        }
    }
  }
  
  function handleContactInput(value) {
    const { step, data } = contactForm
    
    // Don't add to command history
    setInput('')
    
    // Echo input but with a different prompt
    setOutput(prev => [...prev, { type: 'line', content: `> ${value}` }])
    
    let newData = { ...data }
    let newStep = step
    
    switch (step) {
      case 0: // Name
        newData.name = value
        print(['What is your email address?'])
        newStep = 1
        break
      case 1: // Email
        if (!value.includes('@') || !value.includes('.')) {
          print(['Please enter a valid email address.'])
          print(['What is your email address?'])
          return
        }
        newData.email = value
        print(['Please enter your message:'])
        newStep = 2
        break
      case 2: // Message
        newData.message = value
        print(['Thank you! Your message has been received. We will get back to you soon.'])
        print(['Summary of your submission:'])
        print([`Name: ${newData.name}`])
        print([`Email: ${newData.email}`])
        print([`Message: ${newData.message}`])
        
        // Reset form
        setContactForm({ active: false, step: 0, data: { name: '', email: '', message: '' } })
        return
    }
    
    setContactForm({ active: true, step: newStep, data: newData })
  }
  
  function handleProjectClick(projectId) {
    const project = PROJECTS[projectId]
    if (!project) {
      print([`Project ${projectId} not found.`])
      return
    }
    
    print([`\n# ${project.name}`])
    print([project.description])
    print([`\nTechnologies: ${project.tech.join(', ')}`])
    printInteractive(
      <div className="project-links">
        <a 
          href={project.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="project-link"
        >
          [Demo]
        </a>
        <a 
          href={project.github} 
          target="_blank" 
          rel="noopener noreferrer"
          className="project-link"
        >
          [GitHub]
        </a>
      </div>
    )
  }

  function onSubmit(e) {
    e.preventDefault()
    if (!input.trim()) return

    // Play sound effect if enabled
    if (soundEnabled) {
      soundEffects.play('enter')
    }

    handleCommand(input)
    setHistory((prev) => [...prev, input])
    setHistoryIndex(-1)
    setInput('')
  }

  function onKeyDown(e) {
    // Handle Ctrl+C to cancel contact form
    if (e.ctrlKey && e.key === 'c' && contactForm.active) {
      print(['Operation canceled.'])
      setContactForm({ active: false, step: 0, data: { name: '', email: '', message: '' } })
      return
    }
    
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0 || contactForm.active) return
      const nextIndex = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(nextIndex)
      setInput(history[nextIndex])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (history.length === 0 || contactForm.active) return
      const nextIndex = historyIndex < 0 ? -1 : Math.min(history.length - 1, historyIndex + 1)
      setHistoryIndex(nextIndex)
      setInput(nextIndex === -1 ? '' : history[nextIndex])
    }
  }

  return (
    <div 
      className="terminal" 
      onClick={() => inputRef.current?.focus()}
      role="application"
      aria-label="Terminal Portfolio Interface"
    >
      {/* Video background with canvas animation fallback */}
      <VideoBackground 
        videoRef={videoRef}
        canvasRef={canvasRef}
        useCanvasBackground={useCanvasBackground}
        onVideoError={() => {
          console.warn('[App] Switching to canvas due to video error');
          setUseCanvasBackground(true);
        }}
      />

      <div className="hud-overlay" aria-hidden>
        <AITastingWheelHUD
          size={560}
          sectors={[
            { label: 'Sweet', notes: ['vanillin', 'caramel', 'honey'] },
            { label: 'Sour', notes: ['citric', 'malic', 'lactic'] },
            { label: 'Salty', notes: ['NaCl', 'sea salt', 'salinity'] },
            { label: 'Bitter', notes: ['cocoa', 'quinine', 'polyphenols'] },
            { label: 'Umami', notes: ['glutamate', 'inosinate', 'guanylate'] },
            { label: 'Fat', notes: ['oleic', 'creaminess', 'butter'] },
            { label: 'Aroma', notes: ['terpenes', 'esters', 'aldehydes'] },
            { label: 'Texture', notes: ['viscosity', 'crunch', 'gelation'] },
          ]}
          spinSeconds={40}
          centerLabels={[
            'Vanilla',      // Sweet
            'Lemon Zest',   // Sour
            'Sea Salt',     // Salty
            'Cacao',        // Bitter
            'Miso Paste',   // Umami
            'Olive Oil',    // Fat
            'Basil',        // Aroma
            'Parmesan'      // Texture
          ]}
          centerRadiusRatio={0.6}
          centerFontSize={12}
        />
      </div>
      <div className="terminal-content">
      <div 
        className="boot" 
        data-text="Welcome to terminal-of-ideas. Type 'help' to begin."
        aria-hidden={output.length > 0} // Hide from screen readers after initial load
      >
        <GlitchEffect 
          text="Welcome to terminal-of-ideas. Type 'help' to begin." 
          intensity={3} 
          active={glitchActive} 
        />
      </div>
      <div 
        className="output" 
        role="log" 
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Terminal output"
      >
        {output.map((line, i) => (
          <div 
            key={i} 
            className={`line ${line.type}`}
            role={line.type === 'error' ? 'alert' : undefined}
            aria-atomic="true"
          >
            {line.type === 'interactive' ? (
              line.content
            ) : line.animated ? (
              <TypewriterText 
                text={line.content} 
                speed={20} 
                soundEnabled={soundEnabled}
                onComplete={() => {}} 
              />
            ) : (
              line.type === 'error' ? (
                <GlitchEffect 
                  text={line.content} 
                  intensity={5} 
                  active={glitchActive} 
                />
              ) : (
                line.content
              )
            )}
          </div>
        ))}
      </div>
      <form 
          className="prompt-row" 
          onSubmit={onSubmit}
          role="search"
          aria-label={contactForm.active ? "Contact form input" : "Terminal command input"}
        >
          <span 
            className="prompt"
            aria-hidden="true"
          >{contactForm.active ? '> ' : prompt + ' '}</span>
          <input
            aria-label={contactForm.active ? "Contact form field" : "Terminal command"}
            ref={inputRef}
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-autocomplete="list"
            aria-haspopup="true"
          />
          <span className="cursor" aria-hidden="true">█</span>
        </form>
      
      {/* PDF Modal for resume */}
      {showPdfModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowPdfModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-modal-title"
        >
          <div 
            className="pdf-modal" 
            onClick={(e) => e.stopPropagation()}
            tabIndex="0" // Make modal focusable for keyboard navigation
          >
            <div className="pdf-controls" role="toolbar" aria-label="PDF navigation">
              <button 
                onClick={() => setPdfPageNumber(prev => Math.max(1, prev - 1))}
                disabled={pdfPageNumber <= 1}
                aria-label="Previous page"
                title="Previous page (Left arrow)"
              >
                Previous
              </button>
              <span id="pdf-modal-title" aria-live="polite">
                Page {pdfPageNumber} of {pdfNumPages || '?'}
              </span>
              <button 
                onClick={() => setPdfPageNumber(prev => Math.min(pdfNumPages || 1, prev + 1))}
                disabled={pdfPageNumber >= (pdfNumPages || 1)}
                aria-label="Next page"
                title="Next page (Right arrow)"
              >
                Next
              </button>
              <button 
                onClick={() => setShowPdfModal(false)} 
                className="close-btn"
                aria-label="Close resume viewer"
                title="Close (Escape key)"
              >
                Close [Esc]
              </button>
            </div>
            <div 
              className="pdf-container"
              aria-busy={pdfNumPages === null}
            >
              <Document
                file="resume.pdf"
                onLoadSuccess={({ numPages }) => {
                  setPdfNumPages(numPages);
                  announceToScreenReader(`Resume PDF loaded with ${numPages} pages. Use arrow keys to navigate.`, 'polite');
                }}
                onLoadError={(error) => {
                  console.error('PDF Error:', error);
                  print(['Error loading PDF. Please try again.']);
                  announceToScreenReader('Error loading PDF. Please try again.', 'assertive');
                  setShowPdfModal(false);
                }}
                loading={<div aria-label="Loading PDF" role="status">Loading resume...</div>}
                noData={<div aria-label="PDF not found" role="alert">PDF not found</div>}
              >
                <Page 
                  pageNumber={pdfPageNumber} 
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  loading={<div aria-label="Loading page" role="status">Loading page {pdfPageNumber}...</div>}
                  error={<div aria-label="Error loading page" role="alert">Error loading page {pdfPageNumber}</div>}
                />
              </Document>
            </div>
          </div>
        </div>
      )}

      {/* Projects Modal */}
      {showProjectsModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowProjectsModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="projects-modal-title"
        >
          <div
            className="pdf-modal"
            onClick={(e) => e.stopPropagation()}
            tabIndex="0"
            aria-describedby="projects-modal-desc"
          >
            <div className="pdf-controls" role="toolbar" aria-label="Projects controls">
              <span id="projects-modal-title">Projects</span>
              <button 
                onClick={() => setShowProjectsModal(false)}
                className="close-btn"
                aria-label="Close projects gallery"
              >
                Close [Esc]
              </button>
            </div>
            <div id="projects-modal-desc" className="pdf-container" style={{display:'grid', placeItems:'center'}}>
              <HoloLogoCarousel 
                items={projectItems}
                size={560}
                cardW={180}
                cardH={110}
                radius={230}
                autoRotateSec={28}
                mode="ring"
                onItemClick={(item) => {
                  // If this is the car3d card, open Spline modal; otherwise open link in new tab
                  if (item.src === '/car3d.png') {
                    setSplineUrl('https://prod.spline.design/Vq7IxclyxrQXYwAT/scene.splinecode')
                    setShowSplineModal(true)
                  } else if (item.href) {
                    window.open(item.href, '_blank', 'noopener,noreferrer')
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Spline Viewer Modal (popup) */}
      {showSplineModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowSplineModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="spline-modal-title"
        >
          <div
            className="pdf-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '80vw', maxWidth: 1000, height: '70vh' }}
          >
            <div className="pdf-controls" role="toolbar" aria-label="3D viewer controls">
              <span id="spline-modal-title">3D Car Viewer</span>
              <button 
                onClick={() => setShowSplineModal(false)}
                className="close-btn"
                aria-label="Close 3D viewer"
              >
                Close [Esc]
              </button>
            </div>
            <div style={{ position:'relative', width:'100%', height:'100%' }}>
              <DynamicSplineViewer url={splineUrl} />
            </div>
          </div>
        </div>
      )}
      
      {/* Help Sidebar for easier navigation */}
      <HelpSidebar 
        isOpen={showHelpSidebar}
        onClose={() => setShowHelpSidebar(false)}
        onCommandClick={(command) => {
          setInput(command);
          handleCommand(command);
          setShowHelpSidebar(false);
        }}
        helpText={HELP_TEXT}
      />
      
      {/* Help button for mobile/mouse users */}
      <button 
        className="help-toggle-button" 
        onClick={() => setShowHelpSidebar(prev => !prev)}
        aria-label={showHelpSidebar ? "Close help sidebar" : "Open help sidebar"}
        title="Toggle Help (Shift+?)">
        {showHelpSidebar ? "×" : "?"}
      </button>
      </div>
    </div>
  )
}

// Wrap App with ErrorBoundary for better error handling
function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default AppWithErrorBoundary
