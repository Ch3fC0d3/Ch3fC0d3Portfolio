/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import App from '../App';

// Mock the PDF.js worker
jest.mock('react-pdf', () => ({
  Document: ({ children }) => <div data-testid="pdf-document">{children}</div>,
  Page: () => <div data-testid="pdf-page">PDF Page</div>,
  pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: null
    },
    version: '2.6.347'
  }
}));

// Mock sound effects
jest.mock('../utils/soundEffects', () => ({
  init: jest.fn(),
  enable: jest.fn(),
  disable: jest.fn(),
  play: jest.fn(),
  isEnabled: jest.fn().mockReturnValue(false)
}));

// Mock accessibility helper
jest.mock('../utils/accessibilityHelper', () => ({
  announceToScreenReader: jest.fn(),
  addKeyboardNavigation: jest.fn().mockReturnValue(() => {}),
  checkColorContrast: jest.fn().mockReturnValue({ ratio: '15.0', passesAA: true, passesAAA: true }),
  addScreenReaderOnlyStyles: jest.fn()
}));

describe('App Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock fetch for PDF
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob(['pdf content'], { type: 'application/pdf' }))
      })
    );
  });
  
  test('renders terminal interface with welcome message', () => {
    render(<App />);
    
    // Check for welcome message
    const welcomeElement = screen.getByText(/Welcome to terminal-of-ideas/i);
    expect(welcomeElement).toBeInTheDocument();
    
    // Check for terminal prompt
    const promptElement = screen.getByText(/username@terminal-of-ideas/i);
    expect(promptElement).toBeInTheDocument();
    
    // Check for input field
    const inputElement = screen.getByLabelText(/terminal command/i);
    expect(inputElement).toBeInTheDocument();
  });
  
  test('handles help command correctly', async () => {
    render(<App />);
    
    const inputElement = screen.getByLabelText(/terminal command/i);
    fireEvent.change(inputElement, { target: { value: 'help' } });
    fireEvent.submit(inputElement.closest('form'));
    
    // Wait for command output
    await waitFor(() => {
      const helpOutput = screen.getByText(/Available commands/i);
      expect(helpOutput).toBeInTheDocument();
    });
  });
  
  test('handles invalid command with error message', async () => {
    render(<App />);
    
    const inputElement = screen.getByLabelText(/terminal command/i);
    fireEvent.change(inputElement, { target: { value: 'invalid-command' } });
    fireEvent.submit(inputElement.closest('form'));
    
    // Wait for error message
    await waitFor(() => {
      const errorOutput = screen.getByText(/Command not found/i);
      expect(errorOutput).toBeInTheDocument();
    });
  });
  
  test('opens PDF modal when viewing resume', async () => {
    render(<App />);
    
    const inputElement = screen.getByLabelText(/terminal command/i);
    fireEvent.change(inputElement, { target: { value: 'open resume.pdf' } });
    fireEvent.submit(inputElement.closest('form'));
    
    // Wait for PDF modal to open
    await waitFor(() => {
      const pdfDocument = screen.getByTestId('pdf-document');
      expect(pdfDocument).toBeInTheDocument();
    });
    
    // Check for PDF controls
    const previousButton = screen.getByText(/Previous/i);
    const nextButton = screen.getByText(/Next/i);
    const closeButton = screen.getByText(/Close/i);
    
    expect(previousButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
    
    // Test closing the modal
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      const pdfDocument = screen.queryByTestId('pdf-document');
      expect(pdfDocument).not.toBeInTheDocument();
    });
  });
  
  test('toggles sound effects when using sound command', async () => {
    const soundEffects = require('../utils/soundEffects');
    
    // Mock isEnabled to return false initially, then true after enable is called
    let soundEnabled = false;
    soundEffects.isEnabled.mockImplementation(() => soundEnabled);
    soundEffects.enable.mockImplementation(() => { soundEnabled = true; });
    soundEffects.disable.mockImplementation(() => { soundEnabled = false; });
    
    render(<App />);
    
    const inputElement = screen.getByLabelText(/terminal command/i);
    fireEvent.change(inputElement, { target: { value: 'sound on' } });
    fireEvent.submit(inputElement.closest('form'));
    
    // Wait for command output
    await waitFor(() => {
      expect(soundEffects.enable).toHaveBeenCalled();
      expect(screen.getByText(/Sound effects enabled/i)).toBeInTheDocument();
    });
    
    // Toggle sound off
    fireEvent.change(inputElement, { target: { value: 'sound off' } });
    fireEvent.submit(inputElement.closest('form'));
    
    await waitFor(() => {
      expect(soundEffects.disable).toHaveBeenCalled();
      expect(screen.getByText(/Sound effects disabled/i)).toBeInTheDocument();
    });
  });
  
  test('toggles typewriter effect when using typewriter command', async () => {
    render(<App />);
    
    const inputElement = screen.getByLabelText(/terminal command/i);
    fireEvent.change(inputElement, { target: { value: 'typewriter off' } });
    fireEvent.submit(inputElement.closest('form'));
    
    // Wait for command output
    await waitFor(() => {
      expect(screen.getByText(/Typewriter effect disabled/i)).toBeInTheDocument();
    });
    
    // Toggle typewriter back on
    fireEvent.change(inputElement, { target: { value: 'typewriter on' } });
    fireEvent.submit(inputElement.closest('form'));
    
    await waitFor(() => {
      expect(screen.getByText(/Typewriter effect enabled/i)).toBeInTheDocument();
    });
  });
  
  test('toggles glitch effect when using glitch command', async () => {
    render(<App />);
    
    const inputElement = screen.getByLabelText(/terminal command/i);
    fireEvent.change(inputElement, { target: { value: 'glitch off' } });
    fireEvent.submit(inputElement.closest('form'));
    
    // Wait for command output
    await waitFor(() => {
      expect(screen.getByText(/Glitch effect disabled/i)).toBeInTheDocument();
    });
    
    // Toggle glitch back on
    fireEvent.change(inputElement, { target: { value: 'glitch on' } });
    fireEvent.submit(inputElement.closest('form'));
    
    await waitFor(() => {
      expect(screen.getByText(/Glitch effect enabled/i)).toBeInTheDocument();
    });
  });
  
  test('handles command history navigation with arrow keys', async () => {
    render(<App />);
    
    const inputElement = screen.getByLabelText(/terminal command/i);
    
    // Enter first command
    fireEvent.change(inputElement, { target: { value: 'help' } });
    fireEvent.submit(inputElement.closest('form'));
    
    // Enter second command
    await waitFor(() => {
      expect(inputElement.value).toBe('');
    });
    
    fireEvent.change(inputElement, { target: { value: 'ls' } });
    fireEvent.submit(inputElement.closest('form'));
    
    // Navigate history with arrow up
    await waitFor(() => {
      expect(inputElement.value).toBe('');
    });
    
    fireEvent.keyDown(inputElement, { key: 'ArrowUp' });
    expect(inputElement.value).toBe('ls');
    
    fireEvent.keyDown(inputElement, { key: 'ArrowUp' });
    expect(inputElement.value).toBe('help');
    
    // Navigate forward with arrow down
    fireEvent.keyDown(inputElement, { key: 'ArrowDown' });
    expect(inputElement.value).toBe('ls');
    
    fireEvent.keyDown(inputElement, { key: 'ArrowDown' });
    expect(inputElement.value).toBe('');
  });
  
  test('has proper accessibility attributes', () => {
    render(<App />);
    
    // Check for ARIA roles
    expect(screen.getByRole('application')).toBeInTheDocument();
    expect(screen.getByRole('log')).toBeInTheDocument();
    expect(screen.getByRole('search')).toBeInTheDocument();
    
    // Check for proper labels
    expect(screen.getByLabelText(/Terminal Portfolio Interface/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Terminal output/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Terminal command input/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Terminal command/i)).toBeInTheDocument();
  });
});
