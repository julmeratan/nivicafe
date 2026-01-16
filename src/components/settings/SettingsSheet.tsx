import React from 'react';
import { Volume2, VolumeX, Vibrate, SmartphoneNfc, Sun, Moon, Monitor, Globe } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from 'next-themes';
import { haptics } from '@/lib/sounds';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language, languageNames, languageFlags } from '@/lib/translations';

const languages: Language[] = ['en', 'hi', 'es', 'fr'];

const SettingsSheet: React.FC = () => {
  const { soundEnabled, hapticEnabled, toggleSound, toggleHaptic } = useSettings();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const handleSoundToggle = () => {
    toggleSound();
    if (!soundEnabled) {
      haptics.light();
    }
  };

  const handleHapticToggle = () => {
    toggleHaptic();
    if (!hapticEnabled) {
      setTimeout(() => haptics.medium(), 100);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    haptics.light();
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    haptics.light();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          aria-label={t.settings}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-background border-border w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">{t.settings}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Language Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {t.language}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl border-2 transition-all",
                    language === lang
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border bg-secondary text-muted-foreground hover:border-gold/50"
                  )}
                >
                  <span className="text-lg">{languageFlags[lang]}</span>
                  <span className="text-sm font-medium">{languageNames[lang]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t.appearance}
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleThemeChange('light')}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                  theme === 'light'
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border bg-secondary text-muted-foreground hover:border-gold/50"
                )}
              >
                <Sun className="w-5 h-5" />
                <span className="text-xs font-medium">{t.light}</span>
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                  theme === 'dark'
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border bg-secondary text-muted-foreground hover:border-gold/50"
                )}
              >
                <Moon className="w-5 h-5" />
                <span className="text-xs font-medium">{t.dark}</span>
              </button>
              <button
                onClick={() => handleThemeChange('system')}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                  theme === 'system'
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border bg-secondary text-muted-foreground hover:border-gold/50"
                )}
              >
                <Monitor className="w-5 h-5" />
                <span className="text-xs font-medium">{t.auto}</span>
              </button>
            </div>
          </div>

          {/* Sound Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t.feedback}
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
                  <p className="font-medium">{t.soundEffects}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.playSoundsForActions}
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
                  <p className="font-medium">{t.hapticFeedback}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.vibrationOnMobile}
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
              {t.hapticInfo}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSheet;
