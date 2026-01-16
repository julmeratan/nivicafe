import React, { useState } from 'react';
import { MapPin, Phone, MessageSquare, Truck, UtensilsCrossed, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { checkoutFormSchema, sanitizePhone, sanitizeText } from '@/lib/validation';
import OrderConfirmationDialog from './OrderConfirmationDialog';

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (orderId: string, total: number) => void;
  tableNumber?: string;
}

type DeliveryType = 'dine_in' | 'takeaway' | 'delivery';

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({ isOpen, onClose, onComplete, tableNumber: initialTableNumber }) => {
  const { items, totalPrice, clearCart } = useCart();
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('dine_in');
  const [phone, setPhone] = useState('');
  const [tableNumber, setTableNumber] = useState(initialTableNumber || '');
  const [address, setAddress] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{ orderNumber: string; total: number } | null>(null);

  const tax = Math.round(totalPrice * 0.05);
  const deliveryFee = deliveryType === 'delivery' ? 50 : 0;
  const finalTotal = totalPrice + tax + deliveryFee;

  const validateForm = (): boolean => {
    const result = checkoutFormSchema.safeParse({
      phone: sanitizePhone(phone),
      deliveryType,
      tableNumber: tableNumber.trim(),
      address: address.trim(),
      specialRequests: specialRequests.trim(),
    });

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      
      // Show first error as toast
      const firstError = result.error.errors[0];
      toast.error(firstError.message);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Use secure edge function for order creation
      const sanitizedPhone = sanitizePhone(phone);
      
      const orderPayload = {
        phone: sanitizedPhone,
        deliveryType: deliveryType,
        tableNumber: deliveryType === 'dine_in' ? tableNumber.trim() : null,
        address: deliveryType === 'delivery' ? address.trim() : null,
        specialRequests: specialRequests.trim() || null,
        items: items.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions || null,
        })),
        subtotal: totalPrice,
        tax: tax,
        deliveryFee: deliveryFee,
        total: finalTotal,
      };

      const { data, error: orderError } = await supabase.functions.invoke('create-order', {
        body: orderPayload,
      });

      if (orderError) {
        console.error('Order creation error:', orderError);
        toast.error('Failed to place order. Please try again.');
        return;
      }

      if (!data?.success) {
        toast.error(data?.error || 'Failed to place order. Please try again.');
        return;
      }

      const order = data.order;

      // Notify chef via WhatsApp edge function
      try {
        const notificationPayload = {
          orderId: order.id,
          orderNumber: order.orderNumber,
          items: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions,
          })),
          tableNumber: tableNumber ? parseInt(tableNumber) : null,
          deliveryType: deliveryType,
          total: finalTotal,
          phoneNumber: sanitizedPhone,
        };

        const { error: notifyError } = await supabase.functions.invoke('notify-chef-whatsapp', {
          body: notificationPayload,
        });

        if (notifyError) {
          console.error('Chef notification failed:', notifyError);
          // Don't fail the order if notification fails
        } else {
          console.log('Chef notified via WhatsApp');
        }
      } catch (notifyErr) {
        console.error('Error notifying chef:', notifyErr);
      }

      clearCart();
      setConfirmedOrder({ orderNumber: order.orderNumber, total: order.total });
      setShowConfirmation(true);
      onComplete(order.id, order.total);
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setConfirmedOrder(null);
    onClose();
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-background border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Checkout</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Delivery Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium">How would you like your order?</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'dine_in' as const, icon: UtensilsCrossed, label: 'Dine-in' },
                { type: 'takeaway' as const, icon: ShoppingBag, label: 'Takeaway' },
                { type: 'delivery' as const, icon: Truck, label: 'Delivery' },
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setDeliveryType(type)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    deliveryType === type
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border bg-secondary text-muted-foreground hover:border-gold/50"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Phone className="w-4 h-4 text-gold" />
              Phone Number (WhatsApp)
            </label>
            <Input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
              }}
              maxLength={15}
              className={cn("bg-secondary border-border", errors.phone && "border-destructive")}
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          {/* Table Number (for Dine-in) */}
          {deliveryType === 'dine_in' && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-sm font-medium">Table Number</label>
              <Input
                type="text"
                placeholder="Enter your table number"
                value={tableNumber}
                onChange={(e) => {
                  // Only allow numeric input
                  const val = e.target.value.replace(/\D/g, '');
                  setTableNumber(val);
                  if (errors.tableNumber) setErrors((prev) => ({ ...prev, tableNumber: '' }));
                }}
                maxLength={3}
                className={cn("bg-secondary border-border", errors.tableNumber && "border-destructive")}
              />
              {errors.tableNumber && <p className="text-xs text-destructive">{errors.tableNumber}</p>}
            </div>
          )}

          {/* Address (for Delivery) */}
          {deliveryType === 'delivery' && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold" />
                Delivery Address
              </label>
              <Textarea
                placeholder="Enter your full address"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value.slice(0, 500));
                  if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
                }}
                maxLength={500}
                className={cn("bg-secondary border-border resize-none", errors.address && "border-destructive")}
                rows={3}
              />
              {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
              <p className="text-xs text-muted-foreground">{address.length}/500</p>
            </div>
          )}

          {/* Special Requests */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gold" />
              Special Requests (Optional)
            </label>
            <Textarea
              placeholder="Any special requests for the kitchen..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value.slice(0, 500))}
              maxLength={500}
              className="bg-secondary border-border resize-none"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">{specialRequests.length}/500</p>
          </div>

          {/* Order Summary */}
          <div className="bg-secondary rounded-xl p-4 space-y-3">
            <h4 className="font-medium">Order Summary</h4>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.quantity}x {item.name}
                </span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxes (5%)</span>
                <span>₹{tax}</span>
              </div>
              {deliveryType === 'delivery' && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>₹50</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-gold">₹{finalTotal}</span>
              </div>
            </div>
          </div>

          {/* Place Order Button */}
          <Button
            variant="gold"
            size="xl"
            className="w-full"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Placing Order...
              </>
            ) : (
              'Place Order via WhatsApp'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {confirmedOrder && (
      <OrderConfirmationDialog
        isOpen={showConfirmation}
        onClose={handleConfirmationClose}
        orderNumber={confirmedOrder.orderNumber}
        total={confirmedOrder.total}
        deliveryType={deliveryType}
        tableNumber={deliveryType === 'dine_in' ? tableNumber : undefined}
      />
    )}
    </>
  );
};

export default CheckoutDialog;
