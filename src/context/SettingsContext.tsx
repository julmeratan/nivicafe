import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SettingsContextType {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  toggleSound: () => void;
  toggleHaptic: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'nivi-cafe-settings';

interface StoredSettings {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

const getStoredSettings = (): StoredSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  return { soundEnabled: true, hapticEnabled: true };
};

const storeSettings = (settings: StoredSettings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    // Ignore localStorage errors
  }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabledState] = useState(() => getStoredSettings().soundEnabled);
  const [hapticEnabled, setHapticEnabledState] = useState(() => getStoredSettings().hapticEnabled);

  // Persist settings when they change
  useEffect(() => {
    storeSettings({ soundEnabled, hapticEnabled });
  }, [soundEnabled, hapticEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabledState(prev => !prev);
  }, []);

  const toggleHaptic = useCallback(() => {
    setHapticEnabledState(prev => !prev);
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
  }, []);

  const setHapticEnabled = useCallback((enabled: boolean) => {
    setHapticEnabledState(enabled);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        soundEnabled,
        hapticEnabled,
        toggleSound,
        toggleHaptic,
        setSoundEnabled,
        setHapticEnabled,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
