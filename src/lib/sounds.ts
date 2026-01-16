// Sound effects and haptic feedback
// Creates pleasant UI sounds and vibrations for interactions

let audioContext: AudioContext | null = null;

// Settings state (will be synced from SettingsContext)
let soundEnabled = true;
let hapticEnabled = true;

// Sync settings from context
export const updateSoundSettings = (sound: boolean, haptic: boolean) => {
  soundEnabled = sound;
  hapticEnabled = haptic;
};

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Check if vibration is supported
const canVibrate = (): boolean => {
  return 'vibrate' in navigator && hapticEnabled;
};

// Haptic feedback patterns
export const haptics = {
  // Light tap - for adding items
  light: () => {
    if (canVibrate()) {
      navigator.vibrate(10);
    }
  },
  
  // Medium tap - for confirmations
  medium: () => {
    if (canVibrate()) {
      navigator.vibrate(25);
    }
  },
  
  // Success pattern - for order confirmation
  success: () => {
    if (canVibrate()) {
      navigator.vibrate([30, 50, 30, 50, 50]);
    }
  },
  
  // Error/warning pattern
  error: () => {
    if (canVibrate()) {
      navigator.vibrate([50, 30, 50]);
    }
  },
  
  // Double tap - for removal
  double: () => {
    if (canVibrate()) {
      navigator.vibrate([15, 30, 15]);
    }
  },
  
  // Soft pulse - for quantity changes
  pulse: () => {
    if (canVibrate()) {
      navigator.vibrate(8);
    }
  },
};

// Subtle pop/click sound for adding items
export const playAddToCartSound = () => {
  if (!soundEnabled) return;
  
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Create a soft "pop" sound
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.08);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    oscillator.start(now);
    oscillator.stop(now + 0.1);

  } catch (error) {
    // Silently fail if audio isn't supported
  }
};

// Soft removal sound
export const playRemoveSound = () => {
  if (!soundEnabled) return;
  
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.1);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    oscillator.start(now);
    oscillator.stop(now + 0.12);

  } catch (error) {
    // Silently fail
  }
};

export const playSuccessSound = () => {
  if (!soundEnabled) return;
  
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
  }
};

export const playCashRegisterSound = () => {
  if (!soundEnabled) return;
  
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
    // Silently fail
  }
};
