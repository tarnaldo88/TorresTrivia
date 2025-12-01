# Audio Files

This directory contains audio files for the Torres Trivia game.

## Required Files

Place the following MP3 files in this directory:

- `countdown1.mp3` - First countdown audio clip
- `countdown2.mp3` - Second countdown audio clip  
- `countdown3.mp3` - Third countdown audio clip

## How to Add Audio Files

1. Create or download three countdown audio clips (MP3 format)
2. Name them `countdown1.mp3`, `countdown2.mp3`, and `countdown3.mp3`
3. Place them in this `assets/audio/` directory
4. Restart the Expo app

## Audio Specifications

- **Format**: MP3
- **Duration**: 3-4 seconds (to match the countdown)
- **Sample Rate**: 44.1 kHz or higher
- **Channels**: Mono or Stereo

## What Happens Without Audio Files

If audio files are not present:
- The countdown will still display visually (3-2-1-GO)
- No audio will play
- The game will function normally
- Console will show warnings about missing files

## Creating Custom Audio

You can create countdown audio using:
- Audacity (free, open-source)
- GarageBand (macOS/iOS)
- Online audio editors
- Text-to-speech services

Example content:
- "Three, two, one, go!"
- "Ready, set, go!"
- Sound effects (beeps, horns, etc.)

## Notes

- The app will randomly select one of the three audio clips each round
- Audio files are optional - the game works without them
- Ensure files are valid MP3 format
- Check device volume is not muted when testing
