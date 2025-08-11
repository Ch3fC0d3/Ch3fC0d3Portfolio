export default {
  // Test environment for React components
  testEnvironment: 'jsdom',
  
  // File extensions to be processed by Jest
  moduleFileExtensions: ['js', 'jsx'],
  
  // Transform files with babel-jest
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // Mock file imports and CSS modules
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/components/__tests__/mocks/styleMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg|pdf)$': '<rootDir>/src/components/__tests__/mocks/fileMock.js',
  },
  
  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/src/components/__tests__/setup.js'],
  
  // Directories to search for tests
  testMatch: ['**/__tests__/**/*.test.js'],
  
  // Coverage reporting
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.d.ts',
    '!src/main.jsx',
    '!src/vite-env.d.ts',
  ],
  
  // Test coverage thresholds
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
};
