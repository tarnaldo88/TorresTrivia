# Implementation Plan

- [x] 1. Set up project structure and core interfaces





  - Initialize React Native project with TypeScript support
  - Create directory structure: components/, services/, utils/, types/, tests/
  - Define TypeScript interfaces for GameRound, GameItem, DeviceOrientation, and GameAction
  - Set up testing framework (Jest with fast-check for property-based testing)
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1_

- [x] 1.1 Set up SQLite database and initialize schema



  - Install react-native-sqlite-storage or expo-sqlite
  - Create database initialization utility
  - Create items table schema with id, text, and category columns
  - Implement database seeding with default word/phrase collection
  - _Requirements: 7.1, 7.2_

- [ ] 2. Implement ItemDatabase and item management
  - Create ItemDatabase class with SQLite connection
  - Implement random item selection logic using SQL queries
  - Implement item deduplication within a round
  - Implement item cycling when collection is exhausted
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 2.1 Write property test for item selection

  - **Feature: heads-up-game, Property 1: Round displays items**
  - **Validates: Requirements 1.1, 7.1, 7.2**

- [ ] 2.2 Write property test for item deduplication

  - **Feature: heads-up-game, Property 18: No item repetition within round**
  - **Validates: Requirements 7.3**

- [ ] 2.3 Write property test for item cycling

  - **Feature: heads-up-game, Property 19: Item cycling on exhaustion**
  - **Validates: Requirements 7.4**

- [ ] 3. Implement GameState manager
  - Create GameState class to manage round state (active, paused, ended)
  - Implement score tracking and increment logic
  - Implement round duration configuration with 60-second default
  - Implement state transition logic
  - _Requirements: 2.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.4_

- [ ] 3.1 Write property test for score increment

  - **Feature: heads-up-game, Property 5: Correct guess increments score**
  - **Validates: Requirements 2.2**

- [ ] 3.2 Write property test for skip preserves score

  - **Feature: heads-up-game, Property 7: Skip preserves score**
  - **Validates: Requirements 3.3**

- [ ] 3.3 Write property test for custom duration

  - **Feature: heads-up-game, Property 8: Custom duration is used**
  - **Validates: Requirements 4.2**

- [ ] 3.4 Write property test for default duration

  - **Feature: heads-up-game, Property 9: Default duration is 60 seconds**
  - **Validates: Requirements 4.3**

- [ ] 3.5 Write property test for score reset

  - **Feature: heads-up-game, Property 14: Score resets on new round**
  - **Validates: Requirements 5.4**

- [ ] 4. Implement OrientationDetector
  - Create OrientationDetector class to monitor device accelerometer/gyroscope
  - Implement downward rotation detection logic
  - Implement upward rotation detection logic
  - Implement debouncing to prevent rapid false triggers
  - Implement orientation change callbacks
  - _Requirements: 2.1, 3.1, 6.1, 6.3, 6.4_

- [ ] 4.1 Write property test for downward rotation detection

  - **Feature: heads-up-game, Property 4: Downward rotation registers correct guess**
  - **Validates: Requirements 2.1**

- [ ] 4.2 Write property test for upward rotation detection

  - **Feature: heads-up-game, Property 6: Upward rotation registers skip**
  - **Validates: Requirements 3.1**

- [ ] 4.3 Write property test for orientation detection latency

  - **Feature: heads-up-game, Property 15: Orientation detection latency**
  - **Validates: Requirements 6.1**

- [ ] 4.4 Write property test for ready after action

  - **Feature: heads-up-game, Property 17: Ready for next action after completion**
  - **Validates: Requirements 6.4**

- [ ] 5. Implement TimerManager
  - Create TimerManager class to track elapsed time
  - Implement countdown calculation logic
  - Implement round end trigger when time expires
  - Implement timer display update callbacks
  - _Requirements: 4.4, 5.1, 5.3_

- [ ] 5.1 Write property test for timer display

  - **Feature: heads-up-game, Property 10: Timer displays during active round**
  - **Validates: Requirements 4.4**

- [ ] 6. Implement FeedbackManager
  - Create FeedbackManager class for visual and audio feedback
  - Implement feedback generation for correct guess actions
  - Implement feedback generation for skip actions
  - Implement feedback timing coordination
  - _Requirements: 2.4, 3.4_

- [ ] 7. Implement GameScreen component
  - Create GameScreen React Native component
  - Implement word/phrase display with large, readable text
  - Integrate score display
  - Integrate timer display
  - Integrate orientation detection
  - Integrate feedback system
  - Wire GameState, OrientationDetector, TimerManager, and FeedbackManager together
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.3, 4.4, 5.1, 5.2, 6.2_

- [ ] 7.1 Write property test for item advancement

  - **Feature: heads-up-game, Property 2: Item advancement on action**
  - **Validates: Requirements 1.3, 2.3, 3.2**

- [ ] 7.2 Write property test for round end stops items

  - **Feature: heads-up-game, Property 3: Round end stops items**
  - **Validates: Requirements 1.4**

- [ ] 7.3 Write property test for score display update

  - **Feature: heads-up-game, Property 12: Score updates immediately**
  - **Validates: Requirements 5.2**

- [ ] 7.4 Write property test for final score display

  - **Feature: heads-up-game, Property 13: Final score displays on round end**
  - **Validates: Requirements 5.3**

- [ ] 7.5 Write property test for upright orientation display

  - **Feature: heads-up-game, Property 16: Upright orientation displays items**
  - **Validates: Requirements 6.2**

- [ ] 7.6 Write property test for score display during round

  - **Feature: heads-up-game, Property 11: Score displays during active round**
  - **Validates: Requirements 5.1**

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Create game initialization and round management
  - Implement game initialization logic
  - Implement round start/end lifecycle
  - Implement score reset between rounds
  - Wire all components together for complete game flow
  - _Requirements: 1.1, 4.1, 4.2, 4.3, 5.4_

- [ ] 9.1 Write integration tests for complete game flow

  - Test full round lifecycle from start to end
  - Test multiple rounds with score reset
  - Test item progression through a complete round

- [ ] 10. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

