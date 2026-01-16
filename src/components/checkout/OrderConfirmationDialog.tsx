import React from 'react';
import { CheckCircle, Copy, Clock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';

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
  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    toast.success('Order number copied!');
  };

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
      <DialogContent className="max-w-md bg-background border-border text-center p-8">
        <div className="flex flex-col items-center gap-6">
          {/* Success Icon */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center animate-scale-in">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <div className="absolute -inset-2 rounded-full border-2 border-green-500/30 animate-ping opacity-75" />
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h2 className="font-display text-2xl text-foreground">Order Confirmed!</h2>
            <p className="text-muted-foreground">Thank you for your order</p>
          </div>

          {/* Order Number */}
          <div className="w-full bg-secondary rounded-xl p-4 space-y-2">
            <p className="text-sm text-muted-foreground">Order Number</p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-xl font-bold text-gold tracking-wider">
                {orderNumber}
              </span>
              <button
                onClick={copyOrderNumber}
                className="p-2 rounded-lg bg-gold/10 hover:bg-gold/20 transition-colors"
                title="Copy order number"
              >
                <Copy className="w-4 h-4 text-gold" />
              </button>
            </div>
          </div>

          {/* Order Details */}
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Paid</span>
              <span className="font-semibold text-gold">₹{total}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Estimated: {getEstimatedTime()}</span>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="w-full bg-gold/10 rounded-xl p-4">
            <p className="text-sm text-gold">{getDeliveryMessage()}</p>
          </div>

          {/* Contact Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="w-3 h-3" />
            <span>We'll notify you via WhatsApp when ready</span>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            <Button
              variant="gold"
              size="lg"
              className="w-full"
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
