# Torres Trivia 🎮

My family's parties and holidays we always play games, including trivia and heads up. Recently we have noticed these games filled with too many ads and paywalls. To counter this I have made a trivia game for all to use that includes no ads or paid features. Some of the sound effects will be recordings of family members to personalize and make the game more fun and memorable as the years pass and we still get to hear our children's voice clips in the game. This is a mobile party game application built with React Native and Expo that replicates the popular "Heads Up!" game. Players hold their phone to their forehead with the screen facing the audience and guess words, phrases, or answer trivia questions based on clues from other players.

## Features

### Game Modes

- **Heads Up Game**: Classic word/phrase guessing game with 155+ items across 9 categories
- **Trivia Mode**: Answer 75+ trivia questions across 5 difficulty levels and categories
- **Jeopardy Mode**: Jeopardy-style trivia game with dollar amounts and player scoring
- **JeopTrivia**: Question-based trivia with customizable point values
- **Gesture Controls**: Intuitive accelerometer-based tilt detection for natural gameplay

### Game Mechanics

- **Downward Tilt** → Mark as Correct ✓
- **Upward Tilt** → Skip to Next Item ⊘
- **Real-time Score Tracking**: Live score updates during gameplay
- **Customizable Round Duration**: Default 60 seconds, adjustable per game
- **Debounced Gesture Detection**: 800ms debounce prevents accidental triggers
- **Offline-First**: All data stored locally with SQLite, no internet required
- **Player Profiles**: Personalized player selection with custom audio greetings
- **Team Management**: Create and manage custom teams for competitive play
- **Dynamic Sound Effects**: Context-aware audio feedback using family voice recordings
- **Theme Customization**: Create and apply custom visual themes throughout the app

### Content

**Heads Up Game Items (155 total):**
- Movies (20)
- TV Shows (20)
- Animals (20)
- Sports (20)
- Professions (20)
- Common Phrases (20)
- Celebrities (15)
- Food & Drinks (15)
- Countries (15)

**Trivia Questions (150 total):**
- Science (30)
- History (30)
- Geography (30)
- Literature (30)
- Sports (30)

**Custom Content Features:**
- **Question Pack Creator**: Build custom trivia packs with questions, answers, categories, and difficulty levels
- **Import/Export**: Share question packs via JSON or CSV formats
- **Question Editor**: Add, modify, and organize custom trivia questions
- **Pack Management**: Browse, edit, and delete custom question packs
- **Metadata Support**: Author information, tags, descriptions, and pack categories

## New Features ✨

### Player & Team Management
- **Player Profiles**: Select from predefined players (Megan, Emilio, Amaya, Kai, Nathan) with personalized audio greetings
- **Custom Teams**: Create and manage custom teams with unique names
- **Team Selection**: Choose between predefined teams (Shazam) or custom teams for competitive gameplay

### Advanced Customization
- **Theme Editor**: Create custom visual themes with personalized colors, fonts, and styling
- **Theme Management**: Save, load, and switch between multiple custom themes
- **Color Customization**: Fine-tune every aspect of the app's appearance with preset colors or custom hex values

### Content Creation & Sharing
- **Question Pack Creator**: Build comprehensive trivia packs with metadata
- **Question Editor**: Add, edit, and organize individual trivia questions
- **Import/Export System**: Share packs via JSON or CSV formats
- **Pack Browser**: Browse and manage your custom question pack library

### Enhanced Game Modes
- **Jeopardy Mode**: Full Jeopardy experience with dollar amounts, Double Jeopardy, and Daily Doubles
- **JeopTrivia**: Question-based trivia with customizable point values and scoring
- **Dynamic Audio**: Context-aware sound effects and family voice recordings

## Future Features
- Multiplayer support with real-time score synchronization
- Cloud sync for question packs and themes across devices
- Advanced analytics and gameplay statistics
- Voice recognition for hands-free gameplay
- Augmented reality features for enhanced gameplay
- Social features for sharing high scores and custom content

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator or Android Emulator (or Expo Go app on physical device)

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd TorresTrivia
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm start
   ```

4. Open in your preferred environment:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on physical device

## Project Structure

```
src/
├── components/
│   ├── GameScreen.tsx              # Main Heads Up game screen
│   ├── TriviaScreen.tsx            # Trivia question screen
│   ├── NotJeopardyScreen.tsx      # Jeopardy-style game screen
│   ├── JeopTriviaScreen.tsx        # Question-based trivia with points
│   ├── HomeScreen.tsx              # Game mode selection
│   ├── PlayerSelectScreen.tsx      # Player profile selection
│   ├── TeamSelectScreen.tsx        # Team creation and selection
│   ├── ThemeEditorScreen.tsx       # Custom theme creation
│   ├── CreateQuestionPackScreen.tsx # Custom question pack creator
│   ├── QuestionPackListScreen.tsx  # Browse question packs
│   ├── QuestionPackEditorScreen.tsx # Edit question packs
│   ├── AddTriviaQuestionScreen.tsx # Add individual questions
│   └── AlterTriviaQuestion.tsx    # Modify existing questions
├── services/
│   ├── database.ts                 # SQLite database initialization
│   ├── databaseSeeder.ts           # Database seeding with default content
│   ├── itemDatabase.ts             # Item selection and deduplication
│   ├── triviaDatabase.ts           # Trivia question management
│   ├── questionPackManager.ts      # Custom question pack management
│   ├── packImportExport.ts         # Import/export functionality
│   ├── themeService.ts             # Theme persistence and management
│   ├── orientationDetector.ts      # Accelerometer gesture detection
│   ├── gameState.ts                # Game state management
│   ├── timerManager.ts             # Round timer management
│   ├── feedbackManager.ts          # Visual/audio feedback
│   ├── scoreManager.ts             # Score tracking and persistence
│   ├── countdownManager.ts         # Countdown timer functionality
│   ├── gameManager.ts              # Game flow coordination
│   └── UseDynamicSound.ts          # Dynamic sound effect management
├── context/
│   ├── ThemeContext.tsx            # Theme state management
│   └── TeamContext.tsx             # Team state management
├── types/
│   ├── index.ts                    # Core TypeScript interfaces
│   └── theme.ts                    # Theme-related type definitions
└── navigation/
    └── MainNavigator.tsx           # Navigation setup
```

## How to Play

### Heads Up Game

1. Select "Heads Up Game" from the home screen
2. One player holds the phone to their forehead with screen facing the audience
3. The audience gives clues about the displayed word/phrase
4. Player tilts phone **downward** when they guess correctly
5. Player tilts phone **upward** to skip to the next item
6. Score increases with each correct guess
7. Game ends when time runs out
8. Final score is displayed

### Trivia Mode

1. Select "Trivia" from the home screen
2. Read the trivia question displayed on screen
3. Tap "Show Answer" to reveal the answer
4. Tap "Next Question" to move to the next question
5. Questions are randomly selected without repetition within a round

### Jeopardy Mode

1. Select "Jeopardy" from the home screen
2. Choose a dollar amount from the grid ($200-$1000)
3. Select which player is answering the question
4. Read the question and determine if the answer is correct
5. Press "CORRECT!" to add points or "WRONG!" to subtract points
6. Enable "Double Jeopardy" for round 2 with doubled point values
7. Use "Daily Double" feature for custom wager amounts

### JeopTrivia Mode

1. Select "JeopTrivia" from the home screen
2. Choose a dollar amount for the current question
3. Answer the trivia question
4. Points are awarded based on the selected amount
5. Continue with questions until the round ends

### Player & Team Setup

1. Access "Player Select" to choose from predefined players
2. Each player has personalized audio greetings
3. Access "Team Select" to create custom teams
4. Choose between predefined teams or create your own
5. Teams are used for competitive gameplay modes

## Architecture

### Core Components

**OrientationDetector**
- Monitors device accelerometer data
- Detects upward/downward tilts using z-axis acceleration
- Implements debouncing to prevent false triggers
- Configurable thresholds and debounce windows

**ItemDatabase**
- Manages word/phrase selection
- Prevents item repetition within a round
- Cycles through collection when exhausted
- Supports category-based filtering

**TriviaDatabase**
- Manages trivia question selection
- Prevents question repetition within a round
- Supports filtering by category and difficulty
- Cycles through questions when exhausted

**GameState**
- Tracks current score
- Manages round state (active, paused, ended)
- Handles score increment logic
- Manages round duration configuration

**Database**
- SQLite-based local storage
- Persistent data between sessions
- Indexed queries for performance
- Transaction support for data integrity

## Testing 🧪

The project includes comprehensive test suites for both Heads Up and Trivia games using Jest and property-based testing with fast-check.

### Test Structure

```
src/tests/
├── utils/
│   └── testUtils.ts           # Shared test utilities and mocks
├── headsUp/
│   ├── gameLogic.test.ts      # Heads Up game state and logic
│   ├── gameScreen.test.tsx   # Heads Up UI component tests
│   ├── timer.test.ts          # Timer functionality tests
│   ├── scoreTracking.test.ts  # Score management tests
│   ├── gestureControls.test.ts # Gesture detection tests
│   ├── soundIntegration.test.ts # Audio and haptic feedback tests
│   └── databaseIntegration.test.ts # Database operations tests
├── trivia/
│   ├── triviaGameLogic.test.ts # Trivia question management
│   ├── triviaScreen.test.tsx   # Trivia UI component tests
│   └── triviaIntegration.test.ts # End-to-end trivia tests
├── gameScreenIntegration.test.ts # Existing integration tests
└── setup.test.ts              # Test framework validation
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm test -- --coverage

# Run specific test suites
npm test -- headsUp/
npm test -- trivia/
npm test -- gameLogic.test.ts

# Run property-based tests with increased iterations
FAST_CHECK_RUNS=200 npm test

# Run tests in watch mode
npm test -- --watch

# Run performance-focused tests
npm test -- --testNamePattern="Performance"
```

### Test Coverage

#### Heads Up Game Tests
- ✅ **Game Logic**: Round lifecycle, score tracking, item management
- ✅ **UI Components**: Component rendering, user interactions, state management
- ✅ **Timer Functionality**: Countdown accuracy, pause/resume, callbacks
- ✅ **Score Tracking**: High scores, persistence, team scoring
- ✅ **Gesture Controls**: Accelerometer detection, debouncing, error handling
- ✅ **Sound Integration**: Audio feedback, haptic feedback, event sequences
- ✅ **Database Integration**: CRUD operations, data integrity, performance

#### Trivia Game Tests
- ✅ **Question Management**: Random selection, categorization, deduplication
- ✅ **UI Components**: Question display, answer toggle, navigation
- ✅ **Database Operations**: Question CRUD, filtering, performance
- ✅ **Integration**: Complete trivia sessions, score tracking
- ✅ **Real-World Scenarios**: Tournament mode, difficulty challenges, time-based sessions

### Advanced Testing Features

#### Property-Based Testing
```typescript
// Randomized testing with fast-check
fc.assert(
  fc.asyncProperty(
    fc.array(fc.constantFrom('CORRECT', 'SKIP')),
    async (actions) => {
      // Test random action sequences
    }
  )
);
```

#### Mock Classes
- **MockTimerManager**: Simulates timer with controllable time progression
- **MockOrientationDetector**: Simulates device orientation changes
- **MockFeedbackManager**: Tracks audio/haptic feedback calls
- **MockItemDatabase**: Simulates item database with test data
- **MockTriviaDatabase**: Simulates trivia question database
- **MockTriviaQuestionFactory**: Creates categorized and difficulty-based test questions

#### Performance Testing
```typescript
// Benchmarking utilities
const startTime = performance.now();
for (let i = 0; i < 1000; i++) {
  await operation();
}
const duration = endTime - startTime;
expect(duration).toBeLessThan(100);
```

### Test Quality Metrics

#### Coverage Targets
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

#### Performance Benchmarks
- **Timer Operations**: < 50ms for 1000 operations
- **Score Updates**: < 100ms for bulk operations
- **Gesture Detection**: < 100ms for 2000 events
- **Database Queries**: < 1000ms for 100 retrievals

### Real-World Test Scenarios

#### Heads Up Game
- **Complete Game Flow**: Start to finish 60-second rounds
- **Gesture Testing**: Tilt detection accuracy and debouncing
- **Score Persistence**: High score tracking across sessions
- **Error Recovery**: Database errors, sensor failures

#### Trivia Game
- **Tournament Mode**: Multi-category competition simulation
- **Difficulty Progression**: Easy → Medium → Hard question flow
- **Time Challenge**: Duration-limited trivia sessions
- **Category Specialization**: Science-only, History-only rounds

### Test Configuration

#### Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleNameMapper: {
    'expo-sensors$': '<rootDir>/src/__mocks__/expo-sensors.ts',
    'expo-av$': '<rootDir>/src/__mocks__/expo-av.ts',
    'expo-sqlite$': '<rootDir>/src/__mocks__/expo-sqlite.ts',
  },
};
```

### Continuous Integration

#### GitHub Actions
```yaml
- name: Run Tests
  run: npm test -- --coverage
- name: Upload Coverage
  uses: codecov/codecov-action@v1
```

### Debugging Tests

#### Common Issues
1. **Async Test Timeouts**: Increase with `jest.setTimeout(10000)`
2. **Mock State**: Ensure mocks are reset in `beforeEach`
3. **Database Cleanup**: Verify test isolation
4. **Timer Precision**: Allow small timing tolerances

#### Test Utilities
```typescript
// Test helpers
const { TestHelpers } = require('./utils/testUtils');
const mockNavigation = TestHelpers.createMockNavigation();
const mockGameItems = MockGameItemFactory.createMockItems(10);
```

### Benefits

#### Quality Assurance
- **Bug Prevention**: Early detection of issues
- **Regression Testing**: Prevent breaking changes
- **Performance Monitoring**: Optimization opportunities
- **Documentation**: Living specification of behavior

#### Development Efficiency
- **Rapid Feedback**: Immediate test results
- **Confident Refactoring**: Safe code changes
- **Clear Requirements**: Test-driven development
- **Debugging Support**: Isolated issue identification

This comprehensive test suite ensures both Heads Up and Trivia games maintain high quality, reliability, and performance across all components and user interactions.

## Configuration

### Gesture Sensitivity

Adjust accelerometer thresholds in `OrientationDetector`:

```typescript
setDownwardThreshold(threshold: number)  // Default: 5
setUpwardThreshold(threshold: number)    // Default: -5
setDebounceMs(ms: number)                // Default: 800ms
```

### Round Duration

Set custom duration when starting a game:

```typescript
const gameState = new GameState(120); // 120 seconds
```

### Update Interval

Accelerometer update frequency (in `OrientationDetector`):

```typescript
Accelerometer.setUpdateInterval(100); // 100ms
```

## Dependencies

### Core
- `react-native`: Mobile app framework
- `expo`: Development platform
- `@react-navigation`: Navigation library
- `expo-sqlite`: Local database
- `expo-sensors`: Accelerometer access

### Development
- `typescript`: Type safety
- `jest`: Testing framework
- `fast-check`: Property-based testing
- `ts-jest`: TypeScript support for Jest

## Performance Considerations

- **Debouncing**: 800ms debounce prevents rapid false triggers
- **Database Indexing**: Indexed queries for fast item/question retrieval
- **Lazy Loading**: Items and questions loaded on-demand
- **Memory Efficient**: Used items tracked in Set for O(1) lookup

## Known Limitations

- Accelerometer accuracy varies by device
- Gesture detection requires sufficient motion
- SQLite database limited to device storage
- No cloud sync or multiplayer features

## Future Enhancements

- Custom content creation and sharing
- Multiplayer support with score tracking
- Additional game modes
- Sound effects and haptic feedback
- Leaderboards and statistics
- Theme customization
- Difficulty levels for Heads Up game

## Troubleshooting

### Gestures Not Detecting

1. Ensure accelerometer permissions are granted
2. Increase debounce window if getting false triggers
3. Adjust thresholds if device is too sensitive
4. Check that phone is in landscape orientation

### Database Issues

1. Clear app cache and reinstall
2. Check device storage space
3. Verify database permissions

### Performance Issues

1. Reduce accelerometer update interval
2. Clear unused items from database
3. Restart the app

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Create a feature branch
2. Make your changes
3. Add tests for new functionality
4. Submit a pull request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on the project repository.

## Acknowledgments

- Built with [Expo](https://expo.dev)
- Inspired by the popular "Heads Up!" party game
- Uses [fast-check](https://github.com/dubzzz/fast-check) for property-based testing
