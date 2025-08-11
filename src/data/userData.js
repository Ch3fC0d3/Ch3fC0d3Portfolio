/**
 * User data for the terminal portfolio
 * This file contains all the personal information displayed in the terminal
 */

// Basic user information
export const USER_INFO = {
  name: 'Gabriel Pellegrini',
  title: 'Creative Technologist',
  email: '',
  github: 'https://github.com/Ch3fC0d3',
  linkedin: 'https://linkedin.com/in/johndoe',
  location: 'San Francisco, CA',
  prompt: 'Ch3fC0d3',
  host: 'terminal-portfolio'
};

// File system structure
export const FILE_SYSTEM = {
  '/': ['projects', 'about_me', 'resume.pdf', 'gallery', 'contact', 'about.txt', 'skills.txt'],
  '/projects': ['project-alpha', 'project-beta', 'project-gamma', 'project-delta', 'project-epsilon'],
  '/skills': ['frontend', 'backend', 'devops', 'tools']
};

// Projects information
export const PROJECTS = {
  'project-alpha': {
    name: 'Neural Recipe Generator',
    description: 'An AI-powered tool that generates creative recipes from ingredients you have on hand.',
    tech: ['React', 'TensorFlow.js', 'Node.js', 'Express', 'MongoDB'],
    link: 'https://recipe-generator.example.com',
    github: 'https://github.com/johndoe/neural-recipe-generator',
    image: '/Foodai.png'
  },
  'project-beta': {
    name: 'Climate Viz Dashboard',
    description: 'Interactive data visualization dashboard for climate change metrics with real-time updates.',
    tech: ['D3.js', 'Vue', 'Python', 'Flask', 'PostgreSQL', 'Redis'],
    link: 'https://acttogether.us/',
    github: 'https://github.com/johndoe/climate-viz',
    image: '/act.png'
  },
  'project-gamma': {
    name: 'AR Art Experience',
    description: 'Augmented reality mural that comes alive when viewed through a mobile app, featuring interactive elements.',
    tech: ['Unity', 'ARKit', 'ARCore', 'Blender', 'C#'],
    link: 'https://myfreshshare.com/',
    github: 'https://github.com/johndoe/ar-art-experience',
    image: '/fresh.png'
  },
  'project-delta': {
    name: 'Terminal Portfolio',
    description: 'This very website - an interactive terminal-style portfolio with accessibility features.',
    tech: ['React', 'Vite', 'CSS', 'Jest', 'Web Audio API'],
    link: 'https://splat.life/',
    github: 'https://github.com/johndoe/terminal-portfolio',
    image: '/splat.png'
  }
,
  'project-epsilon': {
    name: '3D Car Viewer',
    description: 'Interactive WebGL car model viewer rendered in the browser.',
    tech: ['Three.js', 'React Three Fiber', 'Vite'],
    link: '#',
    github: '#',
    image: '/car3d.png'
  }
};

// Artifacts/gallery items
export const ARTIFACTS = [
  { 
    name: 'Neural Recipe Generator', 
    description: 'AI-powered recipe creation tool', 
    url: 'https://recipe-generator.example.com',
    image: '/artifacts/recipe-generator.jpg'
  },
  { 
    name: 'Climate Viz Dashboard', 
    description: 'Interactive climate data visualization', 
    url: 'https://climate-viz.example.com',
    image: '/artifacts/climate-viz.jpg'
  },
  { 
    name: 'AR Art Experience', 
    description: 'Interactive augmented reality mural', 
    url: 'https://ar-mural.example.com',
    image: '/artifacts/ar-mural.jpg'
  },
  { 
    name: 'Tech Blog', 
    description: 'Articles on creative coding and technology', 
    url: 'https://blog.example.com',
    image: '/artifacts/tech-blog.jpg'
  },
  { 
    name: 'Open Source Contributions', 
    description: 'Various contributions to open source projects', 
    url: 'https://github.com/johndoe',
    image: '/artifacts/open-source.jpg'
  }
];

// About text content
export const ABOUT_TEXT = `
Hi, I’m Gabriel Pellegrini — a Creative Technologist working at the intersection of 
immersive media, artificial intelligence, and culinary innovation.

I design AR/VR experiences, interactive data visualizations, and creative coding projects 
that merge technical depth with sensory storytelling. My work in computational gastronomy 
centers on **FoodAI** — a modular AI platform that uses deep semantic embeddings, chemical 
and sensory data, and context-aware machine learning to generate entirely new ingredient 
pairings, recipes, and food concepts.

These systems don’t just suggest flavors — they simulate texture, balance nutrition, and 
optimize for creativity, producing edible concepts that could only exist through computation.  
From **algorithmically generated flavor wheels** to **AI-driven culinary installations** that 
respond to audience input, I treat AI as both a collaborator and a creative provocateur.

When I’m not building, you’ll find me experimenting with neural network–driven art, prototyping 
new interaction models, or crafting experiences where the boundaries between the physical and 
digital worlds dissolve.

Type 'help' to see available commands and start exploring this terminal portfolio.
`;

// Welcome ASCII banner
export const WELCOME_ASCII = `__        __   _                            _ 
\\ \\      / /__| | ___ ___  _ __ ___   ___  | |
 \\ \\ /\\ / / _ \\ |/ __/ _ \\| '_ \` _ \\ / _ \\ | |
  \\ V  V /  __/ | (_| (_) | | | | | |  __/ |_|
   \\_/\\_/ \\___|_|\\___\\___/|_| |_| |_|\\___| (_)`;

// Skills information
export const SKILLS = {
  frontend: [
    'JavaScript/TypeScript',
    'React',
    'Vue.js',
    'HTML5/CSS3',
    'SASS/SCSS',
    'Responsive Design',
    'Accessibility (WCAG)',
    'D3.js',
    'WebGL'
  ],
  backend: [
    'Node.js',
    'Express',
    'Python',
    'Flask',
    'Django',
    'RESTful APIs',
    'GraphQL',
    'MongoDB',
    'PostgreSQL',
    'Redis'
  ],
  devops: [
    'Docker',
    'Kubernetes',
    'AWS',
    'CI/CD',
    'GitHub Actions',
    'Terraform',
    'Linux'
  ],
  tools: [
    'Git',
    'Jest',
    'React Testing Library',
    'Webpack',
    'Vite',
    'Figma',
    'Adobe Creative Suite',
    'VS Code',
    'Bash/Shell'
  ]
};

// Contact form configuration
export const CONTACT_CONFIG = {
  emailService: 'https://formspree.io/f/your-form-id',
  requiredFields: ['name', 'email', 'message'],
  successMessage: 'Thanks for reaching out! I\'ll get back to you soon.',
  errorMessage: 'There was an error sending your message. Please try again or email me directly.'
};

// Resume PDF path
export const RESUME_PATH = '/resume.pdf';

// Easter eggs
export const EASTER_EGGS = {
  'sudo make me a sandwich': 'Okay, here\'s your sandwich 🥪',
  'do a barrel roll': '🔄 Wheeeee! *terminal spins*',
  'konami code': '⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️ - Cheat mode activated!',
  'hello world': 'Hello to you too! 👋 Welcome to my terminal.',
  'exit': 'Nice try! This is a browser, not a real terminal. 😉',
  'rm -rf /': 'Nice try! 😅 System files are protected.',
  'help me': 'I\'m here to help! Try typing \'help\' for a list of commands.'
};

// Command help text
export const HELP_TEXT = `
Available commands:

help                    Show this help message
clear                   Clear the terminal screen
ls                      List files in current directory
cd [directory]          Change directory
cat [file]              Display file contents
open resume.pdf         Open resume in PDF viewer
projects                List all projects
projects [project-id]   Show project details
artifacts               Show gallery of work/artifacts
contact                 Open contact form
sound [on|off]          Toggle sound effects
typewriter [on|off]     Toggle typewriter effect
glitch [on|off]         Toggle glitch effects
about                   Display about information
skills                  Display skills information

Try exploring the file system with ls and cd commands!
`;
