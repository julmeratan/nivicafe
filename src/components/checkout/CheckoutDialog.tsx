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

  const tax = Math.round(totalPrice * 0.05);
  const deliveryFee = deliveryType === 'delivery' ? 50 : 0;
  const finalTotal = totalPrice + tax + deliveryFee;

  const handleSubmit = async () => {
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }
    if (deliveryType === 'dine_in' && !tableNumber) {
      toast.error('Please enter your table number');
      return;
    }
    if (deliveryType === 'delivery' && !address) {
      toast.error('Please enter your delivery address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create or get customer
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone_number', phone)
        .maybeSingle();

      let customerId = existingCustomer?.id;

      if (!customerId) {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({ phone_number: phone })
          .select('id')
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      // Get table ID if dine-in
      let tableId = null;
      if (deliveryType === 'dine_in' && tableNumber) {
        const { data: tableData } = await supabase
          .from('tables')
          .select('id')
          .eq('table_number', parseInt(tableNumber))
          .maybeSingle();
        tableId = tableData?.id;
      }

      // Create order - trigger generates order_number but we need to provide a placeholder
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: `ORD-${Date.now()}`, // Will be overwritten by trigger
          customer_id: customerId,
          table_id: tableId,
          delivery_type: deliveryType,
          subtotal: totalPrice,
          tax: tax,
          delivery_fee: deliveryFee,
          total: finalTotal,
          special_instructions: specialRequests || null,
          delivery_address: deliveryType === 'delivery' ? address : null,
          phone_number: phone,
        } as any)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        item_name: item.name,
        item_price: item.price,
        quantity: item.quantity,
        special_instructions: item.specialInstructions || null,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Notify chef via WhatsApp edge function
      try {
        const notificationPayload = {
          orderId: order.id,
          orderNumber: order.order_number,
          items: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions,
          })),
          tableNumber: tableNumber ? parseInt(tableNumber) : undefined,
          deliveryType: deliveryType,
          total: finalTotal,
          phoneNumber: phone,
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
      toast.success('Order placed successfully! Chef has been notified.');
      onComplete(order.id, finalTotal);
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
              onChange={(e) => setPhone(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>

          {/* Table Number (for Dine-in) */}
          {deliveryType === 'dine_in' && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-sm font-medium">Table Number</label>
              <Input
                type="text"
                placeholder="Enter your table number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="bg-secondary border-border"
              />
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
                onChange={(e) => setAddress(e.target.value)}
                className="bg-secondary border-border resize-none"
                rows={3}
              />
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
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="bg-secondary border-border resize-none"
              rows={2}
            />
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
  );
};

export default CheckoutDialog;
