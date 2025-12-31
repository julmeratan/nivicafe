import React, { useState } from 'react';
import { Smartphone, CreditCard, Wallet, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  onPaymentComplete: () => void;
}

type PaymentMethod = 'upi' | 'card' | 'wallet';

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  onClose,
  orderId,
  amount,
  onPaymentComplete,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const paymentMethods = [
    { 
      type: 'upi' as const, 
      label: 'UPI', 
      icon: Smartphone, 
      description: 'GPay, PhonePe, Paytm' 
    },
    { 
      type: 'card' as const, 
      label: 'Card', 
      icon: CreditCard, 
      description: 'Debit/Credit Card' 
    },
    { 
      type: 'wallet' as const, 
      label: 'Wallet', 
      icon: Wallet, 
      description: 'Paytm, Amazon Pay' 
    },
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: orderId,
          amount: amount,
          payment_method: selectedMethod,
          transaction_id: `TXN-${Date.now()}`,
          status: 'completed' as const,
        });

      if (paymentError) throw paymentError;

      // Update order payment status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ payment_status: 'completed' as const })
        .eq('id', orderId);

      if (orderError) throw orderError;

      setPaymentComplete(true);
      toast.success('Payment successful!');
      
      setTimeout(() => {
        onPaymentComplete();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            {paymentComplete ? (
              <>
                <Check className="w-6 h-6 text-green-500" />
                Payment Complete
              </>
            ) : (
              'Pay Bill'
            )}
          </DialogTitle>
        </DialogHeader>

        {paymentComplete ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
            <p className="text-muted-foreground">Your payment of ₹{amount} was successful</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Amount Display */}
            <div className="text-center py-4 bg-secondary rounded-xl">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-4xl font-bold text-gold">₹{amount}</p>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                {paymentMethods.map(({ type, label, icon: Icon, description }) => (
                  <button
                    key={type}
                    onClick={() => setSelectedMethod(type)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      selectedMethod === type
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-border bg-secondary text-muted-foreground hover:border-gold/50"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-xs opacity-70">{description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* UPI Apps */}
            {selectedMethod === 'upi' && (
              <div className="space-y-3 animate-fade-in">
                <label className="text-sm font-medium">Select UPI App</label>
                <div className="grid grid-cols-4 gap-3">
                  {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                    <button
                      key={app}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary border border-border hover:border-gold/50 transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
                        {app[0]}
                      </div>
                      <span className="text-xs">{app}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pay Button */}
            <Button
              variant="gold"
              size="xl"
              className="w-full"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ₹${amount}`
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
