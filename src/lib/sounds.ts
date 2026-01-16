// Success sound generator using Web Audio API
// Creates a pleasant chime/ding sound for order confirmations

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const playSuccessSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Create a pleasant multi-tone chime
    const playTone = (frequency: number, startTime: number, duration: number, volume: number) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, startTime);

      // Smooth envelope for pleasant sound
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    // Play a harmonious success chord (C major arpeggio)
    // C5, E5, G5, C6 - ascending chime
    playTone(523.25, now, 0.4, 0.15);        // C5
    playTone(659.25, now + 0.08, 0.35, 0.12); // E5
    playTone(783.99, now + 0.16, 0.3, 0.10);  // G5
    playTone(1046.50, now + 0.24, 0.5, 0.08); // C6 (higher, longer)

  } catch (error) {
    // Silently fail if audio isn't supported
    console.log('Audio playback not supported');
  }
};

export const playCashRegisterSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Cash register "cha-ching" sound
    const playNoise = (startTime: number, duration: number, volume: number) => {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate filtered noise for metallic sound
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
      }

      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      source.buffer = buffer;
      filter.type = 'bandpass';
      filter.frequency.value = 4000;
      filter.Q.value = 2;

      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      source.start(startTime);
    };

    // Metallic ding
    const playBell = (frequency: number, startTime: number, duration: number, volume: number) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(frequency, startTime);

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    // Cha-ching sequence
    playNoise(now, 0.08, 0.1);
    playBell(2200, now + 0.05, 0.3, 0.15);
    playBell(2800, now + 0.1, 0.4, 0.12);

  } catch (error) {
    console.log('Audio playback not supported');
  }
};
