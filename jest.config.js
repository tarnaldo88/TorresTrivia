module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
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
