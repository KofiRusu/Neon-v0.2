module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/packages/**/__tests__/**/*.test.ts',
    '<rootDir>/packages/**/?(*.)+(spec|test).ts',
    '<rootDir>/apps/**/__tests__/**/*.test.ts',
    '<rootDir>/apps/**/?(*.)+(spec|test).ts'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/dist/'
  ],
  collectCoverageFrom: [
    'packages/**/src/**/*.ts',
    'apps/**/src/**/*.ts',
    '!packages/**/src/**/*.d.ts',
    '!apps/**/src/**/*.d.ts',
    '!packages/**/src/**/*.test.ts',
    '!apps/**/src/**/*.test.ts',
    '!packages/**/src/**/*.spec.ts',
    '!apps/**/src/**/*.spec.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
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