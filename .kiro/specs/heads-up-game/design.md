# Design Document

## Overview

The Heads Up Game is a mobile application built with React Native to support iOS and Android platforms. The application manages game state, detects device orientation changes, displays words/phrases from a database, tracks scores, and provides real-time feedback to the player. The core gameplay loop involves displaying items, detecting orientation gestures (downward for correct, upward for skip), updating scores, and managing round timing.

## Architecture

The application follows a layered architecture:

- **Presentation Layer**: React Native components for UI rendering, including the game screen, score display, timer, and feedback animations
- **Game Logic Layer**: Core game state management, score tracking, round management, and item sequencing
- **Sensor Layer**: Device orientation detection and gesture recognition
- **Data Layer**: Word/phrase database management and item selection
- **Utilities Layer**: Timer management, feedback generation, and configuration handling

## Components and Interfaces

### GameScreen Component
- Displays the current word/phrase in large, readable text
- Shows the current score and remaining time
- Handles device orientation events
- Provides visual/audio feedback for actions

### GameState Manager
- Manages current round state (active, paused, ended)
- Tracks current score
- Manages item queue and selection
- Handles round duration configuration

### OrientationDetector
- Monitors device accelerometer/gyroscope data
- Detects downward rotation (correct guess)
- Detects upward rotation (skip)
- Debounces rapid orientation changes
- Provides orientation change callbacks

### ItemDatabase
- Stores collection of words/phrases
- Provides random item selection
- Tracks used items within a round
- Prevents repetition within a round

### TimerManager
- Tracks elapsed time in current round
- Triggers round end when time expires
- Provides countdown display updates
- Supports customizable round duration

### FeedbackManager
- Generates visual feedback (animations, color changes)
- Generates audio feedback (sounds)
- Coordinates feedback timing with game events

## Data Models

### GameRound
```
{
  id: string
  duration: number (seconds)
  startTime: timestamp
  currentScore: number
  isActive: boolean
  itemsUsed: string[]
}
```

### GameItem
```
{
  id: string
  text: string
  category?: string
}
```

### DeviceOrientation
```
{
  x: number (pitch)
  y: number (roll)
  z: number (yaw)
  timestamp: number
}
```

### GameAction
```
{
  type: 'CORRECT' | 'SKIP'
  timestamp: number
  itemId: string
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Round displays items
*For any* active round, the system should display a word or phrase from the available collection on the screen.
**Validates: Requirements 1.1, 7.1, 7.2**

### Property 2: Item advancement on action
*For any* active round with multiple items, when a phone holder performs either a correct guess or skip action, the displayed item should change to a different item from the collection.
**Validates: Requirements 1.3, 2.3, 3.2**

### Property 3: Round end stops items
*For any* ended round, the system should not display new items even if orientation changes are detected.
**Validates: Requirements 1.4**

### Property 4: Downward rotation registers correct guess
*For any* active round, when the device is rotated downward, the system should register a correct guess action.
**Validates: Requirements 2.1**

### Property 5: Correct guess increments score
*For any* active round with a starting score, when a correct guess is registered, the score should increase by exactly one.
**Validates: Requirements 2.2**

### Property 6: Upward rotation registers skip
*For any* active round, when the device is rotated upward, the system should register a skip action.
**Validates: Requirements 3.1**

### Property 7: Skip preserves score
*For any* active round with a starting score, when a skip action is registered, the score should remain unchanged.
**Validates: Requirements 3.3**

### Property 8: Custom duration is used
*For any* round configured with a custom duration value, the round should use that duration as the time limit.
**Validates: Requirements 4.2**

### Property 9: Default duration is 60 seconds
*For any* round started without an explicit duration configuration, the round should default to a 60-second duration.
**Validates: Requirements 4.3**

### Property 10: Timer displays during active round
*For any* active round, the system should display a countdown timer showing the remaining time.
**Validates: Requirements 4.4**

### Property 11: Score displays during active round
*For any* active round, the system should display the current score on the screen.
**Validates: Requirements 5.1**

### Property 12: Score updates immediately
*For any* active round, when a correct guess is registered, the displayed score should update immediately to reflect the new value.
**Validates: Requirements 5.2**

### Property 13: Final score displays on round end
*For any* ended round, the system should display the final score to the player.
**Validates: Requirements 5.3**

### Property 14: Score resets on new round
*For any* new round started after a previous round, the score should be reset to zero.
**Validates: Requirements 5.4**

### Property 15: Orientation detection latency
*For any* device orientation change, the system should detect and register the change within 100 milliseconds.
**Validates: Requirements 6.1**

### Property 16: Upright orientation displays items
*For any* active round with the device held in upright position, the system should display the current word or phrase normally.
**Validates: Requirements 6.2**

### Property 17: Ready for next action after completion
*For any* completed action (correct guess or skip) followed by device return to upright position, the system should be ready to detect and register the next orientation change.
**Validates: Requirements 6.4**

### Property 18: No item repetition within round
*For any* active round, when multiple items are displayed sequentially, no item should appear more than once within the same round.
**Validates: Requirements 7.3**

### Property 19: Item cycling on exhaustion
*For any* round where all items in the collection have been displayed, the system should either cycle back to the beginning of the collection or provide new items to continue gameplay.
**Validates: Requirements 7.4**

## Error Handling

- **Invalid Round Duration**: If duration is not a positive number, default to 60 seconds
- **Empty Item Database**: If no items are available, provide a default set or error message
- **Orientation Detection Failure**: If device orientation cannot be detected, display a warning and allow manual button controls as fallback
- **Timer Expiration**: When round time expires, immediately end the round and display final score
- **Rapid Orientation Changes**: Debounce orientation events to prevent accidental double-triggers

## Testing Strategy

### Unit Testing
- Test score increment logic with various inputs
- Test item selection and deduplication within rounds
- Test timer countdown calculations
- Test orientation threshold detection
- Test round state transitions

### Property-Based Testing
- Use a property-based testing framework (e.g., fast-check for JavaScript/TypeScript)
- Configure tests to run minimum 100 iterations
- Each property test will be tagged with the corresponding correctness property from the design
- Test universal properties across randomized inputs

