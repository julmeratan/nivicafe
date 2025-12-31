import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, Check, Bell, Utensils, Truck, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { sanitizeText } from '@/lib/validation';

interface Order {
  id: string;
  order_number: string;
  status: string;
  delivery_type: string;
  phone_number: string;
  special_instructions: string | null;
  created_at: string;
  table_id: string | null;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  special_instructions: string | null;
}

const KitchenDisplay: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    // Set up realtime subscription
    const channel = supabase
      .channel('kitchen-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Order update:', payload);
          fetchOrders();
          
          if (payload.eventType === 'INSERT') {
            // Play notification sound
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => {});
            toast.success('New order received!', {
              icon: <Bell className="w-5 h-5 text-gold" />,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
        .order('created_at', { ascending: true });

      if (ordersError) throw ordersError;

      // Fetch items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);
          
          return { ...order, items: items || [] };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus as "pending" | "confirmed" | "preparing" | "ready" | "served" | "completed" | "cancelled" })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'confirmed': return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
      case 'preparing': return 'bg-orange-500/20 text-orange-500 border-orange-500/50';
      case 'ready': return 'bg-green-500/20 text-green-500 border-green-500/50';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDeliveryIcon = (type: string) => {
    switch (type) {
      case 'dine_in': return <Utensils className="w-4 h-4" />;
      case 'takeaway': return <ShoppingBag className="w-4 h-4" />;
      case 'delivery': return <Truck className="w-4 h-4" />;
      default: return null;
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'served';
      default: return null;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const getElapsedTime = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diff = Math.floor((now.getTime() - created.getTime()) / 60000);
    return `${diff} min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ChefHat className="w-8 h-8 text-gold" />
          <h1 className="font-display text-3xl font-bold text-cream">Kitchen Display</h1>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-gold border-gold">
            {orders.length} Active Orders
          </Badge>
          <Clock className="w-5 h-5 text-muted-foreground" />
          <span className="text-muted-foreground">
            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <ChefHat className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground">No active orders</h2>
          <p className="text-muted-foreground/70">Waiting for new orders...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className={cn(
                "bg-secondary rounded-xl p-4 border-2 transition-all",
                order.status === 'pending' && "border-yellow-500/50 animate-pulse-slow",
                order.status === 'confirmed' && "border-blue-500/50",
                order.status === 'preparing' && "border-orange-500/50",
                order.status === 'ready' && "border-green-500/50"
              )}
            >
              {/* Order Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{order.order_number}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getDeliveryIcon(order.delivery_type)}
                    <span className="capitalize">{order.delivery_type.replace('_', ' ')}</span>
                  </div>
                </div>
                <Badge className={cn("uppercase", getStatusColor(order.status))}>
                  {order.status}
                </Badge>
              </div>

              {/* Time Info */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Clock className="w-4 h-4" />
                <span>{formatTime(order.created_at)}</span>
                <span className="text-gold">({getElapsedTime(order.created_at)} ago)</span>
              </div>

              {/* Order Items */}
              <div className="space-y-2 mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">{item.quantity}x</span>{' '}
                      <span>{item.item_name}</span>
                      {item.special_instructions && (
                        <p className="text-xs text-gold mt-1">Note: {sanitizeText(item.special_instructions)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Special Instructions */}
              {order.special_instructions && (
                <div className="bg-gold/10 rounded-lg p-2 mb-4">
                  <p className="text-sm text-gold">📝 {sanitizeText(order.special_instructions)}</p>
                </div>
              )}

              {/* Action Button */}
              {getNextStatus(order.status) && (
                <Button
                  variant="gold"
                  className="w-full"
                  onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark as {getNextStatus(order.status)}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KitchenDisplay;
