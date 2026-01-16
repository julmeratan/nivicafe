import React from 'react';
import { Settings, Volume2, VolumeX, Vibrate, SmartphoneNfc } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/context/SettingsContext';
import { haptics } from '@/lib/sounds';

const SettingsSheet: React.FC = () => {
  const { soundEnabled, hapticEnabled, toggleSound, toggleHaptic } = useSettings();

  const handleSoundToggle = () => {
    toggleSound();
    if (!soundEnabled) {
      // Play a quick sound to confirm it's enabled
      haptics.light();
    }
  };

  const handleHapticToggle = () => {
    toggleHaptic();
    if (!hapticEnabled) {
      // Give haptic feedback to confirm it's enabled
      setTimeout(() => haptics.medium(), 100);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-background border-border w-80">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">Settings</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Sound Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Feedback
            </h3>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-gold" />
                ) : (
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">Sound Effects</p>
                  <p className="text-sm text-muted-foreground">
                    Play sounds for actions
                  </p>
                </div>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={handleSoundToggle}
                className="data-[state=checked]:bg-gold"
              />
            </div>

            {/* Haptic Toggle */}
            <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
              <div className="flex items-center gap-3">
                {hapticEnabled ? (
                  <Vibrate className="w-5 h-5 text-gold" />
                ) : (
                  <SmartphoneNfc className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">Haptic Feedback</p>
                  <p className="text-sm text-muted-foreground">
                    Vibration on mobile
                  </p>
                </div>
              </div>
              <Switch
                checked={hapticEnabled}
                onCheckedChange={handleHapticToggle}
                className="data-[state=checked]:bg-gold"
              />
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-gold/10 rounded-xl">
            <p className="text-xs text-gold">
              💡 Haptic feedback works on supported mobile devices only.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSheet;
