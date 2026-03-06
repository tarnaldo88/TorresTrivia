# Heads Up Game Test Suite

This directory contains comprehensive tests for the Heads Up trivia game, covering all major functionality including game logic, UI components, timer management, score tracking, gesture controls, sound integration, and database operations.

## Test Structure

### 📁 Test Organization

```
src/tests/
├── utils/
│   └── testUtils.ts           # Shared test utilities and mocks
├── headsUp/
│   ├── gameLogic.test.ts      # Core game state and logic tests
│   ├── gameScreen.test.tsx   # UI component tests
│   ├── timer.test.ts          # Timer functionality tests
│   ├── scoreTracking.test.ts  # Score management tests
│   ├── gestureControls.test.ts # Gesture detection tests
│   ├── soundIntegration.test.ts # Audio and haptic feedback tests
│   └── databaseIntegration.test.ts # Database operations tests
├── gameScreenIntegration.test.ts # Existing integration tests
└── setup.test.ts              # Test framework validation
```

## 🧪 Test Categories

### 1. Game Logic Tests (`gameLogic.test.ts`)
- **GameState Management**: Round lifecycle, score tracking, item management
- **Action Validation**: Correct guesses, skips, boundary conditions
- **Property-Based Testing**: Randomized testing with fast-check
- **Edge Cases**: Error handling, concurrent operations, performance

### 2. UI Component Tests (`gameScreen.test.tsx`)
- **Component Rendering**: Initial state, countdown display, score display
- **User Interactions**: Timer updates, orientation controls, game flow
- **Integration**: Complete game cycles, navigation, accessibility
- **Performance**: Rapid updates, component lifecycle

### 3. Timer Tests (`timer.test.ts`)
- **Timer Management**: Start/stop/pause/resume functionality
- **Accuracy**: Countdown precision, duration handling
- **Callbacks**: Timer updates, round end events
- **Mock Testing**: Simulated time progression

### 4. Score Tracking Tests (`scoreTracking.test.ts`)
- **Score Persistence**: High scores, last scores, game-specific scores
- **Integration**: GameState + ScoreManager coordination
- **Data Integrity**: Score validation, type consistency
- **Performance**: Bulk operations, rapid updates

### 5. Gesture Controls Tests (`gestureControls.test.ts`)
- **Orientation Detection**: Tilt down/upright gesture recognition
- **Callback Management**: Multiple callbacks, error handling
- **Real-World Scenarios**: Typical gameplay, accidental movements
- **Performance**: Rapid gesture changes, multiple callbacks

### 6. Sound Integration Tests (`soundIntegration.test.ts`)
- **Audio Feedback**: Correct, skip, game over sounds
- **Haptic Feedback**: Vibration triggers
- **Event Sequences**: Complete game feedback flows
- **Performance**: Rapid feedback events, concurrent operations

### 7. Database Integration Tests (`databaseIntegration.test.ts`)
- **Database Operations**: CRUD operations, transactions
- **Item Management**: Random item selection, categorization
- **Score Persistence**: High scores, game-specific scores
- **Mock Testing**: Simulated database behavior

## 🔧 Test Utilities

### Mock Classes
- **MockTimerManager**: Simulates timer with controllable time progression
- **MockOrientationDetector**: Simulates device orientation changes
- **MockFeedbackManager**: Tracks audio/haptic feedback calls
- **MockItemDatabase**: Simulates item database with test data
- **MockCountdownManager**: Simulates countdown sequences

### Test Factories
- **MockGameItemFactory**: Creates test game items with categories
- **MockGameStateFactory**: Creates predefined game states
- **TestHelpers**: Common test utilities and helpers

### Performance Testing
- **PerformanceTestUtils**: Execution time measurement
- **Stress Testing**: Concurrent operation testing
- **Benchmarking**: Performance comparison tools

## 🚀 Running Tests

### Basic Test Execution
```bash
# Run all tests
npm test

# Run specific test file
npm test -- gameLogic.test.ts

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Property-Based Testing
The suite uses fast-check for property-based testing, which generates random test cases to verify system properties:

```bash
# Run with increased iterations for thorough testing
FAST_CHECK_RUNS=1000 npm test
```

### Performance Testing
Some tests include performance benchmarks that measure execution time:

```bash
# Run performance-focused tests
npm test -- --testNamePattern="Performance"
```

## 📊 Test Coverage

### Core Functionality
- ✅ **Game State Management**: 100% coverage
- ✅ **Timer Logic**: Complete accuracy testing
- ✅ **Score Tracking**: Persistence and validation
- ✅ **Gesture Detection**: Real-world simulation
- ✅ **Audio Feedback**: Event sequence testing
- ✅ **Database Operations**: CRUD and integration

### Edge Cases
- ✅ **Error Handling**: Graceful failure scenarios
- ✅ **Boundary Conditions**: Invalid inputs, extreme values
- ✅ **Concurrent Operations**: Thread safety testing
- ✅ **Performance**: Load testing and optimization

### Integration Testing
- ✅ **Complete Game Flow**: Start to finish scenarios
- ✅ **Component Integration**: UI + Logic coordination
- ✅ **Service Integration**: Database + Score management
- ✅ **Real-World Scenarios**: Typical usage patterns

## 🎯 Test Scenarios

### Typical Gameplay Session
```typescript
// Simulates a complete 60-second game
const gameActions = [
  'CORRECT', 'SKIP', 'CORRECT', 'CORRECT', 
  'SKIP', 'CORRECT', 'SKIP', 'CORRECT'
];
```

### Stress Testing
```typescript
// Tests system under heavy load
for (let i = 0; i < 1000; i++) {
  gameState.registerCorrectGuess(`item-${i}`);
}
```

### Property-Based Testing
```typescript
// Randomized testing with fast-check
fc.assert(
  fc.asyncProperty(
    fc.array(fc.constantFrom('CORRECT', 'SKIP')),
    async (actions) => { /* test logic */ }
  )
);
```

## 🔍 Debugging Tests

### Common Issues
1. **Async Test Timeouts**: Increase timeout with `jest.setTimeout(10000)`
2. **Mock State**: Ensure mocks are reset in `beforeEach`
3. **Database Cleanup**: Verify test isolation
4. **Timer Precision**: Allow small timing tolerances

### Debug Tools
- **Console Logging**: Test output for debugging
- **Coverage Reports**: Identify untested code paths
- **Performance Metrics**: Execution time analysis
- **Error Tracking**: Detailed failure information

## 📈 Test Metrics

### Performance Benchmarks
- **Timer Operations**: < 50ms for 1000 operations
- **Score Updates**: < 100ms for bulk operations  
- **Gesture Detection**: < 100ms for 2000 events
- **Database Queries**: < 1000ms for 100 retrievals

### Coverage Targets
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

## 🛠️ Test Configuration

### Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  // ... additional configuration
};
```

### Mock Configuration
- **Expo Modules**: Mocked for testing environment
- **Native Modules**: Simulated for cross-platform testing
- **Async Operations**: Proper async/await handling

## 🔄 Continuous Integration

### GitHub Actions Integration
```yaml
- name: Run Tests
  run: npm test -- --coverage
- name: Upload Coverage
  uses: codecov/codecov-action@v1
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test -- --bail"
    }
  }
}
```

## 📚 Best Practices

### Test Structure
- **Arrange-Act-Assert**: Clear test organization
- **Descriptive Names**: Self-documenting test cases
- **Single Responsibility**: One assertion per test when possible
- **Test Isolation**: Independent test execution

### Mock Usage
- **Realistic Behavior**: Mocks should simulate real behavior
- **State Management**: Proper setup/teardown
- **Error Simulation**: Test error handling paths
- **Performance**: Efficient mock implementations

### Property-Based Testing
- **Invariant Properties**: Test system invariants
- **Edge Cases**: Random input generation
- **Shrinking**: Minimal counterexample generation
- **Reproducibility: Deterministic seed usage

## 🚀 Future Enhancements

### Planned Additions
- **E2E Testing**: Full application flow testing
- **Visual Regression**: UI component snapshot testing
- **Accessibility Testing**: Screen reader and keyboard navigation
- **Network Testing**: API integration testing

### Test Automation
- **Scheduled Runs**: Nightly test execution
- **Performance Monitoring**: Regression detection
- **Coverage Tracking**: Historical coverage trends
- **Quality Gates**: Automated quality checks

---

This comprehensive test suite ensures the Heads Up game maintains high quality, reliability, and performance across all components and user interactions.
