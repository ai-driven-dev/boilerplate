// Jest setup file for global test configuration
import 'jest';

// Mock console methods to reduce noise in test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  // Suppress console logs during tests unless they fail
  console.log = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  // Restore console methods after each test
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  
  // Clear all timers
  jest.clearAllTimers();
  jest.clearAllMocks();
});

// Clean up any async operations
afterAll(() => {
  // Force cleanup
  return new Promise(resolve => {
    setTimeout(resolve, 100);
  });
});