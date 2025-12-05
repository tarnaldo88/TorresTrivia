export const Audio = {
  Sound: jest.fn(() => ({
    loadAsync: jest.fn(),
    playAsync: jest.fn(),
    pauseAsync: jest.fn(),
    stopAsync: jest.fn(),
    unloadAsync: jest.fn(),
    setVolumeAsync: jest.fn(),
    getStatusAsync: jest.fn(() => Promise.resolve({ isPlaying: false })),
  })),
};
