module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/packages/**/__tests__/**/*.test.ts',
    '<rootDir>/packages/**/?(*.)+(spec|test).ts'
  ],
  collectCoverageFrom: [
    'packages/**/src/**/*.ts',
    '!packages/**/src/**/*.d.ts',
    '!packages/**/src/**/*.test.ts',
    '!packages/**/src/**/*.spec.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 40, // Gradually increase: 40% -> 60% -> 80%
      functions: 40,
      lines: 40,
      statements: 40
    },
    'packages/core-agents/src/**/*.ts': {
      branches: 50, // Higher standard for core agents
      functions: 50,
      lines: 50,
      statements: 50,
    },
    'packages/utils/src/**/*.ts': {
      branches: 80, // Utils should have high coverage
      functions: 80,
      lines: 80,
      statements: 80,
    }
  },
  moduleNameMapper: {
    '^@/types$': '<rootDir>/packages/types/src',
    '^@/utils$': '<rootDir>/packages/utils/src',
    '^@/core$': '<rootDir>/packages/core/src'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 10000,
  verbose: true,
  clearMocks: true,
  restoreMocks: true
}; 