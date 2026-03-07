export const openDatabaseAsync = jest.fn(() => ({
  execAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  runAsync: jest.fn(),
  closeAsync: jest.fn(),
}));
