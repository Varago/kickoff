# Kickoff Sound Effects

This directory contains audio files for the Kickoff app. For now, placeholders are used, but these should be replaced with actual high-quality sound effects.

## Required Sound Files

### Core Sounds
- `whistle.mp3` - Match start/end whistle (2-3 seconds)
- `goal.mp3` - Goal celebration sound (1-2 seconds)
- `click.mp3` - Button press feedback (0.1-0.2 seconds)
- `timer-end.mp3` - Timer expiration alert (2-3 seconds)

### Additional Sounds (Future)
- `team-generated.mp3` - Teams successfully created
- `match-scheduled.mp3` - Schedule generated
- `notification.mp3` - General notification sound
- `error.mp3` - Error feedback
- `success.mp3` - Success feedback

## File Specifications

### Format Requirements
- **Format**: MP3 (for broad compatibility)
- **Quality**: 44.1kHz, 128kbps minimum
- **Size**: Keep under 100KB per file for fast loading
- **Compression**: Optimize for web delivery

### Audio Characteristics
- **whistle.mp3**: Sharp, clear whistle blow
- **goal.mp3**: Celebratory cheer or stadium roar
- **click.mp3**: Subtle, pleasant click/tap sound
- **timer-end.mp3**: Urgent but not jarring alert tone

## Implementation Notes

The sound system is designed to:
- Respect user preferences (can be disabled)
- Work offline (files are cached by service worker)
- Provide haptic feedback as alternative
- Degrade gracefully if files are missing

## Usage in Code

```typescript
import { useSound } from '../hooks/useSound';

const { play } = useSound('/sounds/whistle.mp3');
play(); // Plays the sound if enabled
```

## Placeholder Files

Currently using silent/minimal placeholder files. Replace with actual audio assets for production use.