// Audio Generator for creating high-quality sound effects using Web Audio API
// This generates actual audio data instead of relying on external files

interface AudioConfig {
  duration: number;
  sampleRate: number;
  channels: number;
}

const DEFAULT_CONFIG: AudioConfig = {
  duration: 1,
  sampleRate: 44100,
  channels: 1
};

class AudioGenerator {
  private context: AudioContext;

  constructor() {
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  // Generate whistle sound (for match start/end)
  generateWhistle(): Promise<AudioBuffer> {
    const config = { ...DEFAULT_CONFIG, duration: 1.5 };
    const buffer = this.context.createBuffer(config.channels, config.duration * config.sampleRate, config.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / config.sampleRate;

      // Create whistle with frequency sweep
      const frequency = 2000 + Math.sin(t * 8) * 300; // Vibrato effect
      const envelope = Math.exp(-t * 3) * (t < 0.1 ? t * 10 : 1); // Attack and decay

      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }

    return Promise.resolve(buffer);
  }

  // Generate goal celebration sound
  generateGoal(): Promise<AudioBuffer> {
    const config = { ...DEFAULT_CONFIG, duration: 2 };
    const buffer = this.context.createBuffer(config.channels, config.duration * config.sampleRate, config.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / config.sampleRate;

      // Ascending chord progression
      const freq1 = 220 * Math.pow(2, Math.floor(t * 4) / 12); // Root
      const freq2 = 220 * Math.pow(2, (Math.floor(t * 4) + 4) / 12); // Third
      const freq3 = 220 * Math.pow(2, (Math.floor(t * 4) + 7) / 12); // Fifth

      const envelope = Math.exp(-t * 1.5) * (1 - t / config.duration);
      const wave = (Math.sin(2 * Math.PI * freq1 * t) +
                   Math.sin(2 * Math.PI * freq2 * t) * 0.7 +
                   Math.sin(2 * Math.PI * freq3 * t) * 0.5) / 3;

      data[i] = wave * envelope * 0.4;
    }

    return Promise.resolve(buffer);
  }

  // Generate button click sound
  generateClick(): Promise<AudioBuffer> {
    const config = { ...DEFAULT_CONFIG, duration: 0.1 };
    const buffer = this.context.createBuffer(config.channels, config.duration * config.sampleRate, config.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / config.sampleRate;

      // Short, crisp click
      const frequency = 800;
      const envelope = Math.exp(-t * 50);

      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.2;
    }

    return Promise.resolve(buffer);
  }

  // Generate timer end alert
  generateTimerEnd(): Promise<AudioBuffer> {
    const config = { ...DEFAULT_CONFIG, duration: 2.5 };
    const buffer = this.context.createBuffer(config.channels, config.duration * config.sampleRate, config.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / config.sampleRate;

      // Urgent beeping pattern
      const beepFreq = 1000;
      const beepPattern = Math.floor(t * 8) % 2; // 4 Hz beeping
      const envelope = beepPattern * Math.exp(-t * 0.5);

      data[i] = Math.sin(2 * Math.PI * beepFreq * t) * envelope * 0.3;
    }

    return Promise.resolve(buffer);
  }

  // Generate success sound
  generateSuccess(): Promise<AudioBuffer> {
    const config = { ...DEFAULT_CONFIG, duration: 1 };
    const buffer = this.context.createBuffer(config.channels, config.duration * config.sampleRate, config.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / config.sampleRate;

      // Pleasant ascending arpeggio
      const notes = [261.63, 329.63, 392.00, 523.25]; // C major chord
      const noteIndex = Math.floor(t * 4) % notes.length;
      const frequency = notes[noteIndex];

      const envelope = Math.exp(-t * 2) * (1 - t);

      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.25;
    }

    return Promise.resolve(buffer);
  }

  // Generate error sound
  generateError(): Promise<AudioBuffer> {
    const config = { ...DEFAULT_CONFIG, duration: 0.5 };
    const buffer = this.context.createBuffer(config.channels, config.duration * config.sampleRate, config.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / config.sampleRate;

      // Descending minor chord (dissonant)
      const freq1 = 200;
      const freq2 = 150;
      const envelope = Math.exp(-t * 8);

      data[i] = (Math.sin(2 * Math.PI * freq1 * t) +
                Math.sin(2 * Math.PI * freq2 * t)) * envelope * 0.15;
    }

    return Promise.resolve(buffer);
  }

  // Generate notification sound
  generateNotification(): Promise<AudioBuffer> {
    const config = { ...DEFAULT_CONFIG, duration: 0.8 };
    const buffer = this.context.createBuffer(config.channels, config.duration * config.sampleRate, config.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / config.sampleRate;

      // Two-tone notification
      const freq1 = 800;
      const freq2 = 600;
      const switchTime = 0.4;
      const frequency = t < switchTime ? freq1 : freq2;

      const envelope = t < switchTime ?
        Math.exp(-t * 5) :
        Math.exp(-(t - switchTime) * 5);

      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.2;
    }

    return Promise.resolve(buffer);
  }

  // Convert AudioBuffer to Blob for storage
  audioBufferToBlob(buffer: AudioBuffer): Promise<Blob> {
    return new Promise((resolve) => {
      const offlineContext = new OfflineAudioContext(
        buffer.numberOfChannels,
        buffer.length,
        buffer.sampleRate
      );

      const source = offlineContext.createBufferSource();
      source.buffer = buffer;
      source.connect(offlineContext.destination);
      source.start();

      offlineContext.startRendering().then((renderedBuffer) => {
        const wav = this.audioBufferToWav(renderedBuffer);
        const blob = new Blob([wav], { type: 'audio/wav' });
        resolve(blob);
      });
    });
  }

  // Convert AudioBuffer to WAV format
  private audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);

    // Convert to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return arrayBuffer;
  }
}

export default AudioGenerator;