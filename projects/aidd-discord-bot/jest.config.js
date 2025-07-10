module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@octokit/rest$': '<rootDir>/src/__mocks__/@octokit/rest.ts',
    '^discord.js$': '<rootDir>/src/__mocks__/discord.js.ts',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@octokit|discord\\.js)/)'
  ],
  // Fix Jest hanging issue
  testTimeout: 10000,
  forceExit: true,
  detectOpenHandles: true,
  // Suppress console logs during tests unless there are failures
  silent: false,
};