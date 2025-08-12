# Terminal Portfolio

An interactive terminal-themed portfolio website built with React and Vite. This project emulates a Linux terminal interface with various interactive commands, visual effects, and sound feedback.

## Features

- **Terminal UI**: Black background, green text, monospaced font, and blinking cursor
- **Interactive Commands**: `ls`, `cd`, `cat`, `open resume`, `contact --form`, `artifacts`, `help`, etc.
- **Visual Effects**:
  - Typewriter text animation with configurable speed
  - Glitch effects for error messages and terminal header
  - Smooth scrolling and cursor blinking
- **Sound Effects**: Programmatically generated using Web Audio API
  - Typing sounds
  - Enter key feedback
  - Error sounds
  - Startup sound
  - Click sounds
- **Interactive Features**:
  - PDF resume viewer
  - CLI-styled contact form
  - Project explorer
  - Command history navigation

## Commands

- `ls` - List files in current directory
- `cd <directory>` - Change directory
- `cat <file>` - Display file contents
- `open resume` - Open resume PDF
- `contact --form` - Open contact form
- `artifacts` - Show creative artifacts
- `history` - Show command history
- `clear` - Clear the screen
- `toggle-sound` - Toggle sound effects
- `toggle-typewriter` - Toggle typewriter animation
- `toggle-glitch` - Toggle glitch effects
- `sudo make me a sandwich` - Easter egg
- `fortune` - Get a random fortune
- `help` - Show help message

## Technology Stack

- **React**: UI framework
- **Vite**: Build tool
- **Web Audio API**: Programmatic sound generation
- **React PDF**: PDF rendering

## Getting Started

### Prerequisites

- Node.js 18+ (Vite 6.x compatibility)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd terminal-portfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
npm run build
```

## Customization

To customize the portfolio with your own information:

1. Update the project data in `App.jsx` (PROJECTS, ARTIFACTS, ABOUT_TEXT)
2. Replace `public/resume.pdf` with your own resume
3. Adjust colors in `App.css` by modifying the CSS variables in `:root`

## Accessibility

The terminal interface includes accessibility features:

- ARIA live regions for screen readers
- Keyboard navigation support
- Focus management

## License

MIT
# Ch3fC0d3Portfolio
Deployment
trigger
Workflow
pin
test
Redeploy
trigger
Deploy
run
at
%DATE%
%TIME%
Another
deploy
trigger
Deployment trigger: 2025-08-11T17:03:19.8304173-05:00
Deployment trigger after FTP_PATH update: 2025-08-11T17:23:22.7676142-05:00
Deployment trigger to domain root: 2025-08-11T17:35:23.5071807-05:00
Deploy trigger to /public_html: 2025-08-11T17:51:06.9393854-05:00
Deploy trigger to root: 2025-08-11T18:48:07.0950714-05:00
Redeploy after root FTP secrets confirmed: 2025-08-11T18:59:41.2512264-05:00
Redeploy with cPanel credentials: 2025-08-12T11:29:28.7133446-05:00
Redeploy with FTPS protocol: 2025-08-12T11:44:04.2243985-05:00
