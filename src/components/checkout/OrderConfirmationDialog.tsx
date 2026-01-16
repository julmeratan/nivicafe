import React, { useEffect } from 'react';
import { CheckCircle, Copy, Clock, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { playSuccessSound, haptics } from '@/lib/sounds';
import { useNavigate } from 'react-router-dom';

interface OrderConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  total: number;
  deliveryType: 'dine_in' | 'takeaway' | 'delivery';
  tableNumber?: string;
}

const OrderConfirmationDialog: React.FC<OrderConfirmationDialogProps> = ({
  isOpen,
  onClose,
  orderNumber,
  total,
  deliveryType,
  tableNumber,
}) => {
  const navigate = useNavigate();

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    haptics.light();
    toast.success('Order number copied!');
  };

  const handleTrackOrder = () => {
    onClose();
    navigate(`/track-order?order=${orderNumber}`);
  };

  // Trigger confetti, sound, and haptic when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Play success sound and haptic
      playSuccessSound();
      haptics.success();

      // Fire confetti from both sides
      const fireConfetti = () => {
        // Left side burst
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { x: 0.1, y: 0.6 },
          colors: ['#D4AF37', '#FFD700', '#FFA500', '#22C55E', '#FBBF24'],
          ticks: 200,
        });
        
        // Right side burst
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { x: 0.9, y: 0.6 },
          colors: ['#D4AF37', '#FFD700', '#FFA500', '#22C55E', '#FBBF24'],
          ticks: 200,
        });
      };

      // Initial burst
      fireConfetti();

      // Second burst after a short delay
      const timeout = setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 100,
          origin: { x: 0.5, y: 0.4 },
          colors: ['#D4AF37', '#FFD700', '#FFA500', '#22C55E', '#FBBF24'],
          ticks: 150,
        });
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const getDeliveryMessage = () => {
    switch (deliveryType) {
      case 'dine_in':
        return tableNumber 
          ? `Your order will be served at Table ${tableNumber}` 
          : 'Your order will be served at your table';
      case 'takeaway':
        return 'Your order will be ready for pickup shortly';
      case 'delivery':
        return 'Your order will be delivered to your address';
      default:
        return '';
    }
  };

  const getEstimatedTime = () => {
    switch (deliveryType) {
      case 'dine_in':
        return '15-25 minutes';
      case 'takeaway':
        return '20-30 minutes';
      case 'delivery':
        return '30-45 minutes';
      default:
        return '20-30 minutes';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background border-border text-center p-8 overflow-hidden">
        <div className="flex flex-col items-center gap-6">
          {/* Success Icon with ripple effect */}
          <div className="relative">
            {/* Ripple circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-green-500/20 animate-ripple" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center" style={{ animationDelay: '0.2s' }}>
              <div className="w-20 h-20 rounded-full bg-green-500/10 animate-ripple stagger-2" />
            </div>
            
            {/* Main icon */}
            <div className="relative w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce-in animate-glow">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2 animate-slide-in-up stagger-1">
            <h2 className="font-display text-2xl text-foreground">Order Confirmed!</h2>
            <p className="text-muted-foreground">Thank you for your order</p>
          </div>

          {/* Order Number */}
          <div className="w-full bg-secondary rounded-xl p-4 space-y-2 animate-fade-in-scale stagger-2">
            <p className="text-sm text-muted-foreground">Order Number</p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-xl font-bold text-gold tracking-wider">
                {orderNumber}
              </span>
              <button
                onClick={copyOrderNumber}
                className="p-2 rounded-lg bg-gold/10 hover:bg-gold/20 transition-all hover:scale-110 active:scale-95"
                title="Copy order number"
              >
                <Copy className="w-4 h-4 text-gold" />
              </button>
            </div>
          </div>

          {/* Order Details */}
          <div className="w-full space-y-3 animate-slide-in-up stagger-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Paid</span>
              <span className="font-semibold text-gold text-lg">₹{total}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Estimated: {getEstimatedTime()}</span>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="w-full bg-gold/10 rounded-xl p-4 animate-fade-in-scale stagger-4">
            <p className="text-sm text-gold">{getDeliveryMessage()}</p>
          </div>

          {/* Contact Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground animate-slide-in-up stagger-5">
            <Phone className="w-3 h-3" />
            <span>We'll notify you via WhatsApp when ready</span>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3 animate-fade-in-scale stagger-6">
            <Button
              variant="gold"
              size="lg"
              className="w-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleTrackOrder}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Track Your Order
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={onClose}
            >
              Continue Browsing
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderConfirmationDialog;
