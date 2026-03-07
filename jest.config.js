module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', '**/?(*.)+(spec|test).ts', '**/?(*.)+(spec|test).tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(expo-sensors|expo-av|expo-sqlite)/)',
  ],
  moduleNameMapper: {
    '^expo-sensors$': '<rootDir>/src/__mocks__/expo-sensors.ts',
    '^expo-av$': '<rootDir>/src/__mocks__/expo-av.ts',
    '^expo-sqlite$': '<rootDir>/src/__mocks__/expo-sqlite.ts',
  },
};
