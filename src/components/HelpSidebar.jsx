import React, { useState, useEffect } from 'react';
import './HelpSidebar.css';

/**
 * A user-friendly sidebar that provides quick access to commands and information
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the sidebar is open
 * @param {Function} props.onClose - Function to call when closing the sidebar
 * @param {Function} props.onCommandClick - Function to execute a command when clicked
 * @param {string} props.helpText - Help text content organized by category
 */
function HelpSidebar({ isOpen, onClose, onCommandClick, helpText }) {
  const [commandCategories, setCommandCategories] = useState({
    navigation: [],
    info: [],
    interaction: [],
    settings: [],
    other: []
  });

  // Common commands that users might want quick access to
  const quickCommands = [
    { label: 'About Me', command: 'about' },
    { label: 'My Skills', command: 'skills' },
    { label: 'Projects', command: 'projects' },
    { label: 'View Resume', command: 'open resume.pdf' },
    { label: 'Contact Me', command: 'contact' },
    { label: 'Clear Terminal', command: 'clear' }
  ];
  
  // Parse the help text to extract command categories
  useEffect(() => {
    if (!helpText) return;
    
    const newCategories = {
      navigation: [],
      info: [],
      interaction: [],
      settings: [],
      other: []
    };
    
    const lines = helpText.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      // Skip headers and empty lines
      if (line.startsWith('Available commands:') || !line.trim()) return;
      
      // Categorize commands based on keywords
      const command = line.trim();
      if (command.includes('ls') || command.includes('cd')) {
        newCategories.navigation.push(command);
      } else if (command.includes('about') || command.includes('skills') || command.includes('projects')) {
        newCategories.info.push(command);
      } else if (command.includes('open') || command.includes('contact')) {
        newCategories.interaction.push(command);
      } else if (command.includes('sound') || command.includes('typewriter') || command.includes('glitch')) {
        newCategories.settings.push(command);
      } else {
        newCategories.other.push(command);
      }
    });
    
    setCommandCategories(newCategories);
  }, [helpText]);
  
  if (!isOpen) return null;

  return (
    <div className="help-sidebar" role="complementary" aria-label="Command Help">
      <div className="help-sidebar-header">
        <h2>Terminal Portfolio Help</h2>
        <button 
          className="close-btn" 
          onClick={onClose}
          aria-label="Close help sidebar"
        >
          ×
        </button>
      </div>
      
      <div className="help-sidebar-content">
        <section className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="command-buttons">
            {quickCommands.map((cmd) => (
              <button
                key={cmd.command}
                className="command-button"
                onClick={() => onCommandClick(cmd.command)}
                aria-label={`Execute command: ${cmd.label}`}
              >
                {cmd.label}
              </button>
            ))}
          </div>
        </section>
        
        <section className="command-categories">
          <h3>Navigation Commands</h3>
          <ul className="command-list">
            {commandCategories.navigation.map((cmd, index) => (
              <li key={`nav-${index}`}>
                <button
                  className="command-chip"
                  onClick={() => onCommandClick(cmd.split('  ')[0])}
                  aria-label={`Execute command: ${cmd.split('  ')[0]}`}
                >
                  <code>{cmd.split('  ')[0]}</code>
                </button>
                <span>{cmd.split('  ')[1]}</span>
              </li>
            ))}
          </ul>
          
          <h3>Information Commands</h3>
          <ul className="command-list">
            {commandCategories.info.map((cmd, index) => (
              <li key={`info-${index}`}>
                <button
                  className="command-chip"
                  onClick={() => onCommandClick(cmd.split('  ')[0])}
                  aria-label={`Execute command: ${cmd.split('  ')[0]}`}
                >
                  <code>{cmd.split('  ')[0]}</code>
                </button>
                <span>{cmd.split('  ')[1]}</span>
              </li>
            ))}
          </ul>
          
          <h3>Interaction Commands</h3>
          <ul className="command-list">
            {commandCategories.interaction.map((cmd, index) => (
              <li key={`int-${index}`}>
                <button
                  className="command-chip"
                  onClick={() => onCommandClick(cmd.split('  ')[0])}
                  aria-label={`Execute command: ${cmd.split('  ')[0]}`}
                >
                  <code>{cmd.split('  ')[0]}</code>
                </button>
                <span>{cmd.split('  ')[1]}</span>
              </li>
            ))}
          </ul>
          
          <h3>Settings Commands</h3>
          <ul className="command-list">
            {commandCategories.settings.map((cmd, index) => (
              <li key={`set-${index}`}>
                <button
                  className="command-chip"
                  onClick={() => onCommandClick(cmd.split('  ')[0])}
                  aria-label={`Execute command: ${cmd.split('  ')[0]}`}
                >
                  <code>{cmd.split('  ')[0]}</code>
                </button>
                <span>{cmd.split('  ')[1]}</span>
              </li>
            ))}
          </ul>
          
          <h3>Other Commands</h3>
          <ul className="command-list">
            {commandCategories.other.map((cmd, index) => (
              <li key={`other-${index}`}>
                <button
                  className="command-chip"
                  onClick={() => onCommandClick(cmd.split('  ')[0])}
                  aria-label={`Execute command: ${cmd.split('  ')[0]}`}
                >
                  <code>{cmd.split('  ')[0]}</code>
                </button>
                <span>{cmd.split('  ')[1]}</span>
              </li>
            ))}
          </ul>
        </section>
        
        <section className="help-tips">
          <h3>Tips</h3>
          <ul>
            <li>Use <code>Tab</code> to autocomplete commands</li>
            <li>Press <code>↑</code> and <code>↓</code> to navigate command history</li>
            <li>Type <code>help</code> for a list of all commands</li>
            <li>Try <code>ls</code> and <code>cd</code> to explore the file system</li>
          </ul>
        </section>
      </div>
      
      <div className="help-sidebar-footer">
        <p>Press <code>?</code> to toggle this help sidebar</p>
      </div>
    </div>
  );
}

export default HelpSidebar;
