import { useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { updateSoundSettings } from '@/lib/sounds';

// Component that syncs settings context with sounds module
const SettingsSyncer: React.FC = () => {
  const { soundEnabled, hapticEnabled } = useSettings();

  useEffect(() => {
    updateSoundSettings(soundEnabled, hapticEnabled);
  }, [soundEnabled, hapticEnabled]);

  return null;
};

export default SettingsSyncer;
