import React, { useState, useEffect, useCallback } from 'react';
import { Search, Package, Clock, CheckCircle, ChefHat, Utensils, Truck, ShoppingBag, ArrowLeft, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { Link, useSearchParams } from 'react-router-dom';

interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  item_price: number;
  special_instructions: string | null;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  delivery_type: string;
  phone_number: string;
  special_instructions: string | null;
  created_at: string;
  total: number;
  subtotal: number;
  tax: number;
  delivery_fee: number | null;
  items: OrderItem[];
}

const getOrderSteps = (t: { orderPlaced: string; confirmed: string; preparing: string; ready: string }) => [
  { status: 'pending', label: t.orderPlaced, icon: Package },
  { status: 'confirmed', label: t.confirmed, icon: CheckCircle },
  { status: 'preparing', label: t.preparing, icon: ChefHat },
  { status: 'ready', label: t.ready, icon: Utensils },
];

const OrderTrackingPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  const ORDER_STEPS = getOrderSteps(t);

  const searchOrder = useCallback(async (orderNum?: string, phone?: string) => {
    const searchOrderNum = orderNum || orderNumber.trim();
    const searchPhone = phone || phoneNumber.trim();

    if (!searchOrderNum && !searchPhone) {
      toast.error('Please enter order number or phone number');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      let query = supabase.from('orders').select('*');

      if (searchOrderNum) {
        query = query.eq('order_number', searchOrderNum.toUpperCase());
      }
      if (searchPhone) {
        query = query.eq('phone_number', searchPhone);
      }

      const { data: ordersData, error: ordersError } = await query
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (ordersError) throw ordersError;

      // Fetch items for the order
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', ordersData.id);

      if (itemsError) throw itemsError;

      setOrder({ ...ordersData, items: items || [] });
    } catch (error) {
      console.error('Error fetching order:', error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderNumber, phoneNumber]);

  // Auto-search if order number is in URL
  useEffect(() => {
    const orderParam = searchParams.get('order');
    if (orderParam) {
      setOrderNumber(orderParam);
      searchOrder(orderParam);
    }
  }, [searchParams]);

  // Set up real-time subscription when order is found
  useEffect(() => {
    if (!order) return;

    const channel = supabase
      .channel(`order-tracking-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          console.log('Order update:', payload);
          const newStatus = (payload.new as { status: string }).status;
          setOrder((prev) => prev ? { ...prev, status: newStatus } : null);
          toast.success(`Order status updated to: ${newStatus}`, {
            icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id]);

  const getCurrentStepIndex = (status: string) => {
    const index = ORDER_STEPS.findIndex((step) => step.status === status);
    return index === -1 ? 0 : index;
  };

  const getDeliveryIcon = (type: string) => {
    switch (type) {
      case 'dine_in':
        return <Utensils className="w-5 h-5" />;
      case 'takeaway':
        return <ShoppingBag className="w-5 h-5" />;
      case 'delivery':
        return <Truck className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
      case 'preparing':
        return 'bg-orange-500/20 text-orange-500 border-orange-500/50';
      case 'ready':
        return 'bg-green-500/20 text-green-500 border-green-500/50';
      case 'served':
      case 'completed':
        return 'bg-green-500/20 text-green-500 border-green-500/50';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleSearch = () => {
    searchOrder();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/menu">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-xl font-bold">{t.trackOrder}</h1>
              <p className="text-sm text-muted-foreground">{t.trackYourOrder}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Search Form */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <h2 className="font-semibold text-lg mb-4">{t.findYourOrder}</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t.orderNumber}</label>
              <Input
                placeholder="e.g., NC-ABC12345"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t.phoneNumber}</label>
              <Input
                placeholder="e.g., 9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <Button
              variant="gold"
              className="w-full"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current" />
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  {t.trackOrder}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Order Not Found */}
        {searched && !order && !loading && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t.orderNotFound}</h3>
            <p className="text-muted-foreground">
              {t.orderNotFoundMessage}
            </p>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6 animate-fade-in-scale">
            {/* Order Header */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-mono text-xl font-bold text-gold">{order.order_number}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.created_at)} at {formatTime(order.created_at)}
                  </p>
                </div>
                <Badge className={cn('uppercase', getStatusColor(order.status))}>
                  {order.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {getDeliveryIcon(order.delivery_type)}
                <span className="capitalize">{order.delivery_type.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Progress Tracker */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-6">{t.orderProgress}</h3>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                <div
                  className="absolute left-6 top-0 w-0.5 bg-gold transition-all duration-500"
                  style={{
                    height: `${(getCurrentStepIndex(order.status) / (ORDER_STEPS.length - 1)) * 100}%`,
                  }}
                />

                {/* Steps */}
                <div className="space-y-8">
                  {ORDER_STEPS.map((step, index) => {
                    const currentIndex = getCurrentStepIndex(order.status);
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    const StepIcon = step.icon;

                    return (
                      <div key={step.status} className="flex items-center gap-4 relative">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-full flex items-center justify-center transition-all z-10',
                            isCompleted
                              ? 'bg-gold text-charcoal'
                              : 'bg-secondary text-muted-foreground',
                            isCurrent && 'ring-4 ring-gold/30 animate-pulse'
                          )}
                        >
                          <StepIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p
                            className={cn(
                              'font-medium',
                              isCompleted ? 'text-foreground' : 'text-muted-foreground'
                            )}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-gold">{t.inProgress}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-4">{t.orderItems}</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">{item.quantity}x</span>{' '}
                      <span>{item.item_name}</span>
                      {item.special_instructions && (
                        <p className="text-xs text-gold mt-1">Note: {item.special_instructions}</p>
                      )}
                    </div>
                    <span className="text-muted-foreground">₹{item.item_price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.subtotal}</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.taxes}</span>
                  <span>₹{order.tax}</span>
                </div>
                {order.delivery_fee && order.delivery_fee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.deliveryFee}</span>
                    <span>₹{order.delivery_fee}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>{t.total}</span>
                  <span className="text-gold">₹{order.total}</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gold/10 rounded-2xl p-4 flex items-center gap-3">
              <Phone className="w-5 h-5 text-gold" />
              <p className="text-sm text-gold">{t.notifyViaWhatsApp}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderTrackingPage;
