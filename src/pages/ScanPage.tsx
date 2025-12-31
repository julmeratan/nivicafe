import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroBiryani from '@/assets/hero-biryani.jpg';

const ScanPage: React.FC = () => {
  const navigate = useNavigate();

  const handleScanComplete = () => {
    navigate('/menu');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBiryani}
          alt="Delicious food"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-end pb-16 px-6">
        <div className="text-center max-w-md mx-auto animate-slide-up">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gold to-gold-dark rounded-2xl flex items-center justify-center shadow-lg shadow-gold/30 mb-4">
              <Utensils className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="font-display text-4xl font-bold text-gradient-gold mb-2">
              Nivi Cafe and Restro
            </h1>
            <p className="text-muted-foreground">Fine Dining Experience</p>
          </div>

          {/* QR Scan Area */}
          <div className="glass-card rounded-3xl p-8 mb-8 animate-slide-up stagger-2">
            <div className="w-32 h-32 mx-auto border-2 border-dashed border-gold/50 rounded-2xl flex items-center justify-center mb-4 animate-pulse-gold">
              <QrCode className="w-16 h-16 text-gold" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              Scan QR code at your table
            </p>
            <p className="text-xs text-muted-foreground/70">
              or tap below to browse our menu
            </p>
          </div>

          {/* CTA Button */}
          <Button
            variant="gold"
            size="xl"
            className="w-full animate-slide-up stagger-3"
            onClick={handleScanComplete}
          >
            View Menu
          </Button>

          <p className="text-xs text-muted-foreground mt-6 animate-fade-in stagger-4">
            Experience authentic flavors crafted with love
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScanPage;
