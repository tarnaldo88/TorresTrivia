# Audio Troubleshooting Guide

## Issue: Audio Not Playing

### Check 1: Device Volume
- Ensure your phone volume is turned UP
- Check that the device is not in silent/mute mode
- Look for volume controls on the side of the phone

### Check 2: Audio Files
- Verify files are in `assets/audio/` directory
- Check file names are exactly: `countdown1.mp3`, `countdown2.mp3`
- Ensure files are valid MP3 format
- Try playing the files on your computer to confirm they work

### Check 3: Console Logs
When you start a round, you should see:
```
CountdownManager: Selected audio clip 1 of 2
CountdownManager: Loading audio...
CountdownManager: Playing audio...
CountdownManager: Audio started playing
```

If you see errors instead, check the error message for details.

### Check 4: Expo Audio Permissions
On Android, the app needs audio permissions:
1. Go to Settings → Apps → Torres Trivia
2. Permissions → Audio
3. Allow audio access

### Check 5: Audio Format
- Ensure MP3 files are properly encoded
- Try converting files to MP3 using:
  - Audacity (free)
  - Online converters
  - FFmpeg command line

### Check 6: File Size
- Audio files should be reasonably sized (< 5MB each)
- Very large files may not load properly

## Issue: Infinite Console Logs

This should be fixed in the latest version. If you still see repeated logs:
1. Clear Expo cache: `expo start --clear`
2. Restart the app
3. Check console for error messages

## Issue: Audio Plays But Very Quietly

- Check device volume is at maximum
- Verify audio file volume levels are adequate
- Try re-encoding the audio file with higher volume

## Testing Audio

To test if audio is working:
1. Start a game round
2. Watch for the countdown (3-2-1-GO)
3. Listen for audio during countdown
4. Check console logs for any errors

## Audio File Recommendations

For best results:
- **Duration**: 3-4 seconds
- **Format**: MP3
- **Bitrate**: 128 kbps or higher
- **Sample Rate**: 44.1 kHz
- **Volume**: Normalized to -3dB to -6dB

## Creating Test Audio

Quick test using text-to-speech:
1. Go to https://ttsmp3.com/
2. Type "Three, two, one, go"
3. Download as MP3
4. Place in `assets/audio/countdown1.mp3`

## Still Not Working?

Check the console for specific error messages and:
1. Verify all file paths are correct
2. Ensure no typos in file names
3. Try with a different audio file
4. Restart Expo: `expo start --clear`
5. Reinstall the app on your device
