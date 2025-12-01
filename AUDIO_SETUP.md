# Audio Setup Guide

## Countdown Audio Files

The game requires audio files for the countdown sequence. Place the following files in the `assets/audio/` directory:

### Required Files

1. **countdown1.mp3** - First countdown audio clip (e.g., "3-2-1-GO" or similar)
2. **countdown2.mp3** - Second countdown audio clip (alternative version)
3. **countdown3.mp3** - Third countdown audio clip (alternative version)

### Directory Structure

```
assets/
└── audio/
    ├── countdown1.mp3
    ├── countdown2.mp3
    └── countdown3.mp3
```

## How It Works

- When a game round begins, the `CountdownManager` randomly selects one of the three audio clips
- The selected clip plays while displaying the 3-2-1-GO countdown
- Each time a new round starts, a different clip may be randomly selected
- This adds variety to the gameplay experience

## Audio Specifications

- **Format**: MP3 (or any format supported by Expo Audio)
- **Duration**: Approximately 3-4 seconds (to match the countdown)
- **Sample Rate**: 44.1 kHz or higher
- **Channels**: Mono or Stereo

## Creating Your Own Audio

You can create custom countdown audio using:
- Audacity (free, open-source)
- GarageBand (macOS/iOS)
- Online audio editors
- Text-to-speech services

### Example Audio Content

- "Three, two, one, go!"
- "Ready, set, go!"
- "Let's go!"
- Sound effects (beeps, horns, etc.)

## Troubleshooting

If audio doesn't play:
1. Verify files are in `assets/audio/` directory
2. Check file names match exactly (case-sensitive)
3. Ensure files are valid MP3 format
4. Check device volume is not muted
5. Verify app has audio permissions

## Notes

- The app will still function without audio files, but will log errors
- Audio playback requires device audio permissions
- On iOS, ensure audio session is configured correctly
- On Android, check app has RECORD_AUDIO permission if needed
