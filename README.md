# Torres Trivia 🎮

My family's parties and holidays we always play games, including trivia and heads up. Recently we have noticed these games filled with too many ads and paywalls. To counter this I have made a trivia game for all to use that includes no ads or paid features. Some of the sound effects will be recordings of family members to personalize and make the game more fun and memorable as the years pass and we still get to hear our children's voice clips in the game. This is a mobile party game application built with React Native and Expo that replicates the popular "Heads Up!" game. Players hold their phone to their forehead with the screen facing the audience and guess words, phrases, or answer trivia questions based on clues from other players.

## Features

### Game Modes

- **Heads Up Game**: Classic word/phrase guessing game with 155+ items across 9 categories
- **Trivia Mode**: Answer 75+ trivia questions across 5 difficulty levels and categories
- **Gesture Controls**: Intuitive accelerometer-based tilt detection for natural gameplay

### Game Mechanics

- **Downward Tilt** → Mark as Correct ✓
- **Upward Tilt** → Skip to Next Item ⊘
- **Real-time Score Tracking**: Live score updates during gameplay
- **Customizable Round Duration**: Default 60 seconds, adjustable per game
- **Debounced Gesture Detection**: 800ms debounce prevents accidental triggers
- **Offline-First**: All data stored locally with SQLite, no internet required

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

## Getting Started

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
│   ├── GameScreen.tsx          # Main Heads Up game screen
│   ├── TriviaScreen.tsx        # Trivia question screen
│   ├── HomeScreen.tsx          # Game mode selection
│   └── NotJeopardyScreen.tsx   # Additional game mode
├── services/
│   ├── database.ts             # SQLite database initialization
│   ├── databaseSeeder.ts       # Database seeding with default content
│   ├── itemDatabase.ts         # Item selection and deduplication
│   ├── triviaDatabase.ts       # Trivia question management
│   ├── orientationDetector.ts  # Accelerometer gesture detection
│   ├── gameState.ts            # Game state management
│   ├── timerManager.ts         # Round timer management
│   └── feedbackManager.ts      # Visual/audio feedback
├── types/
│   └── index.ts                # TypeScript interfaces
└── navigation/
    └── MainNavigator.tsx       # Navigation setup
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

## Testing

The project includes comprehensive property-based tests using fast-check:

```bash
npx jest --run
```

Test coverage includes:
- Gesture detection accuracy
- Score increment logic
- Item deduplication
- Round state transitions
- Database operations

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
