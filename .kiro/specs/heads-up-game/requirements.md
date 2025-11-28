# Requirements Document

## Introduction

The Heads Up Game is a mobile game application that replicates the popular party game where a player holds a phone to their forehead with the screen facing the audience. The app displays words or phrases that the phone holder must guess based on clues from the audience. The phone holder rotates the phone downward to indicate a correct guess (earning a point) or upward to skip (no points awarded). Each round lasts a customizable duration (default 60 seconds), and the game tracks the phone holder's score throughout gameplay.

## Glossary

- **Phone Holder**: The player holding the phone to their forehead, attempting to guess the word/phrase
- **Audience**: The other players providing clues to help the phone holder guess
- **Round**: A single gameplay session with a fixed time duration
- **Word/Phrase**: The item displayed on screen that the phone holder must guess based on audience clues
- **Correct Guess**: When the phone holder rotates the phone downward, indicating they guessed the word/phrase correctly
- **Skip**: When the phone holder rotates the phone upward, indicating they want to move to the next word/phrase without scoring
- **Score**: The number of correct guesses accumulated by the phone holder during a round
- **Device Orientation**: The physical rotation state of the mobile device (upright, downward, upward)
- **Round Duration**: The customizable time limit for a single round (in seconds)

## Requirements

### Requirement 1

**User Story:** As the phone holder, I want to see words or phrases displayed on the screen, so that I can attempt to guess them based on audience clues.

#### Acceptance Criteria

1. WHEN a round starts THEN the system SHALL display a word or phrase on the screen
2. WHEN a word or phrase is displayed THEN the system SHALL present it in a clear, readable format that is visible to the phone holder
3. WHEN the phone holder skips or guesses correctly THEN the system SHALL display the next word or phrase
4. WHEN a round ends THEN the system SHALL stop displaying new words or phrases

### Requirement 2

**User Story:** As the phone holder, I want to indicate a correct guess by rotating the phone downward, so that I can score points for correct answers.

#### Acceptance Criteria

1. WHEN the device is rotated downward THEN the system SHALL register a correct guess
2. WHEN a correct guess is registered THEN the system SHALL increment the phone holder's score by one
3. WHEN a correct guess is registered THEN the system SHALL display the next word or phrase
4. WHEN a correct guess is registered THEN the system SHALL provide visual or audio feedback to confirm the action

### Requirement 3

**User Story:** As the phone holder, I want to skip a word or phrase by rotating the phone upward, so that I can move to the next item without scoring.

#### Acceptance Criteria

1. WHEN the device is rotated upward THEN the system SHALL register a skip action
2. WHEN a skip is registered THEN the system SHALL display the next word or phrase
3. WHEN a skip is registered THEN the system SHALL not modify the phone holder's score
4. WHEN a skip is registered THEN the system SHALL provide visual or audio feedback to confirm the action

### Requirement 4

**User Story:** As a game organizer, I want to customize the round duration, so that I can adjust gameplay to fit different scenarios.

#### Acceptance Criteria

1. WHEN the game is configured THEN the system SHALL allow setting a custom round duration in seconds
2. WHEN a custom duration is set THEN the system SHALL use that duration for the current round
3. WHEN a round duration is not specified THEN the system SHALL default to 60 seconds
4. WHEN a round starts THEN the system SHALL display a countdown timer showing remaining time

### Requirement 5

**User Story:** As the phone holder, I want to see my current score during gameplay, so that I can track my performance.

#### Acceptance Criteria

1. WHEN a round is active THEN the system SHALL display the current score on the screen
2. WHEN a correct guess is registered THEN the system SHALL update the displayed score immediately
3. WHEN a round ends THEN the system SHALL display the final score
4. WHEN a new round starts THEN the system SHALL reset the score to zero

### Requirement 6

**User Story:** As the phone holder, I want the game to respond to device orientation changes, so that the gameplay feels natural and responsive.

#### Acceptance Criteria

1. WHEN the device orientation changes THEN the system SHALL detect the change within 100 milliseconds
2. WHEN the device is held upright THEN the system SHALL display the current word or phrase normally
3. WHEN the device is rotated downward or upward THEN the system SHALL register the action and respond appropriately
4. WHEN the device returns to upright position THEN the system SHALL be ready to detect the next orientation change

### Requirement 7

**User Story:** As a game organizer, I want the game to have a word or phrase database, so that there is variety in gameplay.

#### Acceptance Criteria

1. WHEN a round starts THEN the system SHALL have access to a collection of words or phrases
2. WHEN a word or phrase is displayed THEN the system SHALL select it from the available collection
3. WHEN words or phrases are displayed during a round THEN the system SHALL not repeat the same item within the same round
4. WHEN the system runs out of items THEN the system SHALL cycle back to the beginning of the collection or generate new items

