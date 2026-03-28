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
    'node_modules/(?!(expo-sensors|expo-av|expo-sqlite|@react-navigation|@react-native)/)',
  ],
  moduleNameMapper: {
    '^expo-sensors$': '<rootDir>/src/__mocks__/expo-sensors.ts',
    '^expo-av$': '<rootDir>/src/__mocks__/expo-av.ts',
    '^expo-sqlite$': '<rootDir>/src/__mocks__/expo-sqlite.ts',
    '^@react-navigation/native$': '<rootDir>/src/__mocks__/react-navigation.ts',
    '^@react-navigation/bottom-tabs$': '<rootDir>/src/__mocks__/react-navigation.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
};
