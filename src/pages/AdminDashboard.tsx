import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Utensils,
  IndianRupee,
  LogOut,
  TrendingUp,
  Clock,
  QrCode,
  ChefHat,
  UtensilsCrossed,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import QRCodeDisplay from '@/components/qr/QRCodeDisplay';
import MenuManagement from '@/components/admin/MenuManagement';
import { cn } from '@/lib/utils';

type TabType = 'overview' | 'orders' | 'menu' | 'customers' | 'tables';

interface DashboardStats {
  totalOrders: number;
  todayRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  phone_number: string;
  delivery_type: string;
  created_at: string;
  payment_status: string;
}

interface Customer {
  id: string;
  name: string | null;
  phone_number: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
}

interface TableData {
  id: string;
  table_number: number;
  qr_code: string;
  is_active: boolean;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    todayRevenue: 0,
    totalCustomers: 0,
    pendingOrders: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tables, setTables] = useState<TableData[]>([]);

  // Auth check is now handled by ProtectedRoute - no need for client-side redirect

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch customers
      const { data: customersData } = await supabase
        .from('customers')
        .select('*')
        .order('total_spent', { ascending: false });

      // Fetch tables
      const { data: tablesData } = await supabase
        .from('tables')
        .select('*')
        .order('table_number', { ascending: true });

      const today = new Date().toISOString().split('T')[0];
      const todayOrders = (ordersData || []).filter(
        (o) => o.created_at.startsWith(today) && o.payment_status === 'completed'
      );

      setOrders(ordersData || []);
      setCustomers(customersData || []);
      setTables(tablesData || []);
      setStats({
        totalOrders: (ordersData || []).length,
        todayRevenue: todayOrders.reduce((sum, o) => sum + Number(o.total), 0),
        totalCustomers: (customersData || []).length,
        pendingOrders: (ordersData || []).filter((o) => o.status === 'pending').length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await supabase
        .from('orders')
        .update({ status: newStatus as "pending" | "confirmed" | "preparing" | "ready" | "served" | "completed" | "cancelled" })
        .eq('id', orderId);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'orders' as const, label: 'Orders', icon: ShoppingCart },
    { id: 'menu' as const, label: 'Menu', icon: UtensilsCrossed },
    { id: 'customers' as const, label: 'Customers', icon: Users },
    { id: 'tables' as const, label: 'QR Codes', icon: QrCode },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500';
      case 'confirmed': return 'bg-blue-500/20 text-blue-500';
      case 'preparing': return 'bg-orange-500/20 text-orange-500';
      case 'ready': return 'bg-green-500/20 text-green-500';
      case 'served': return 'bg-purple-500/20 text-purple-500';
      case 'completed': return 'bg-green-600/20 text-green-600';
      case 'cancelled': return 'bg-red-500/20 text-red-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-secondary border-r border-border p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
            <Utensils className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h2 className="font-display font-bold text-cream">Royal Spice</h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>

        <nav className="space-y-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                activeTab === id
                  ? "bg-gold/20 text-gold"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}

          <button
            onClick={() => navigate('/kitchen')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted/50 transition-all"
          >
            <ChefHat className="w-5 h-5" />
            <span>Kitchen Display</span>
          </button>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {activeTab === 'overview' && (
          <div>
            <h1 className="font-display text-3xl font-bold text-cream mb-8">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-secondary rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <ShoppingCart className="w-8 h-8 text-gold" />
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>

              <div className="bg-secondary rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <IndianRupee className="w-8 h-8 text-gold" />
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold">₹{stats.todayRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Today's Revenue</p>
              </div>

              <div className="bg-secondary rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-gold" />
                </div>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>

              <div className="bg-secondary rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-gold" />
                </div>
                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-secondary rounded-xl p-6 border border-border">
              <h2 className="font-semibold text-lg mb-4">Recent Orders</h2>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-background rounded-lg">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">{order.phone_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gold">₹{order.total}</p>
                      <Badge className={cn("capitalize", getStatusColor(order.status))}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h1 className="font-display text-3xl font-bold text-cream mb-8">Orders</h1>
            <div className="bg-secondary rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-background">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium">Order #</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Payment</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-border">
                      <td className="px-6 py-4 font-medium">{order.order_number}</td>
                      <td className="px-6 py-4 text-muted-foreground">{order.phone_number}</td>
                      <td className="px-6 py-4 capitalize">{order.delivery_type.replace('_', ' ')}</td>
                      <td className="px-6 py-4 text-gold">₹{order.total}</td>
                      <td className="px-6 py-4">
                        <Badge className={cn("capitalize", getStatusColor(order.status))}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={order.payment_status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}>
                          {order.payment_status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="bg-background border border-border rounded-lg px-2 py-1 text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="served">Served</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'menu' && <MenuManagement />}

        {activeTab === 'customers' && (
          <div>
            <h1 className="font-display text-3xl font-bold text-cream mb-8">Customers</h1>
            <div className="bg-secondary rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-background">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Total Orders</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Total Spent</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Since</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-t border-border">
                      <td className="px-6 py-4 font-medium">{customer.name || 'Guest'}</td>
                      <td className="px-6 py-4 text-muted-foreground">{customer.phone_number}</td>
                      <td className="px-6 py-4">{customer.total_orders}</td>
                      <td className="px-6 py-4 text-gold">₹{customer.total_spent}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'tables' && (
          <div>
            <h1 className="font-display text-3xl font-bold text-cream mb-8">Table QR Codes</h1>
            <p className="text-muted-foreground mb-8">
              Print and place these QR codes on each table. Customers can scan to view the menu.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {tables.map((table) => (
                <QRCodeDisplay key={table.id} tableNumber={table.table_number} size={150} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
