export const useNavigation = jest.fn();
export const NativeStackNavigationProp = jest.fn();

// Mock navigation object
export const createMockNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(() => jest.fn()),
});
