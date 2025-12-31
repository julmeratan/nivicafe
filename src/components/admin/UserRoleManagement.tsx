import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { UserPlus, Trash2, Shield, ChefHat, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  email?: string;
}

const UserRoleManagement: React.FC = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<AppRole>('staff');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      toast.error('Failed to load user roles');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserRole = async () => {
    if (!newUserEmail.trim()) {
      toast.error('Please enter a user email');
      return;
    }

    setAdding(true);
    try {
      // First, we need to find the user by email
      // Since we can't query auth.users directly, we'll inform the admin
      // that the user must sign up first
      
      // For now, we'll show instructions
      toast.info(
        'To add a user role: 1) Have the user sign up at /admin/login first. 2) Then provide their user ID.',
        { duration: 6000 }
      );
      
      setNewUserEmail('');
    } catch (error) {
      console.error('Error adding user role:', error);
      toast.error('Failed to add user role');
    } finally {
      setAdding(false);
    }
  };

  const handleAddRoleById = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) {
        if (error.code === '23505') {
          toast.error('User already has this role');
        } else {
          throw error;
        }
        return;
      }

      toast.success(`Role "${role}" assigned successfully`);
      fetchUserRoles();
    } catch (error) {
      console.error('Error adding role:', error);
      toast.error('Failed to assign role');
    }
  };

  const handleUpdateRole = async (id: string, newRole: AppRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('id', id);

      if (error) throw error;
      toast.success('Role updated successfully');
      fetchUserRoles();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const handleRemoveRole = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Role removed successfully');
      fetchUserRoles();
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
    }
  };

  const getRoleIcon = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'chef':
        return <ChefHat className="w-4 h-4" />;
      case 'staff':
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeClass = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'chef':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'staff':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-cream mb-4">User Roles</h1>
      <p className="text-muted-foreground mb-8">
        Manage staff access levels. Users must sign up at the login page first before you can assign roles.
      </p>

      {/* Add New Role Section */}
      <div className="bg-secondary rounded-xl p-6 border border-border mb-8">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-gold" />
          Assign Role to User
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="User ID (from sign-up)"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            className="flex-1 bg-background"
          />
          <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as AppRole)}>
            <SelectTrigger className="w-full sm:w-40 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="chef">Chef</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              if (newUserEmail.trim()) {
                handleAddRoleById(newUserEmail.trim(), newUserRole);
                setNewUserEmail('');
              } else {
                toast.error('Please enter a user ID');
              }
            }}
            disabled={adding}
            className="bg-gold hover:bg-gold/90 text-charcoal"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Assign Role
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          💡 Tip: After a user signs up, check the database for their user_id to assign a role.
        </p>
      </div>

      {/* Role Types Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-secondary rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-red-400" />
            <span className="font-semibold text-red-400">Admin</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Full access to all features, including user management, menu, orders, and settings.
          </p>
        </div>
        <div className="bg-secondary rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <ChefHat className="w-5 h-5 text-orange-400" />
            <span className="font-semibold text-orange-400">Chef</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Access to kitchen display, can view and update order status for food preparation.
          </p>
        </div>
        <div className="bg-secondary rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-blue-400">Staff</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Access to kitchen display and can view orders and customer information.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-secondary rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-background hover:bg-background">
              <TableHead>User ID</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No user roles assigned yet. Add users above.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-sm">
                    {user.user_id.slice(0, 8)}...{user.user_id.slice(-4)}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('flex items-center gap-1.5 w-fit', getRoleBadgeClass(user.role))}>
                      {getRoleIcon(user.role)}
                      <span className="capitalize">{user.role}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(v) => handleUpdateRole(user.id, v as AppRole)}
                      >
                        <SelectTrigger className="w-28 h-8 bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="chef">Chef</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRole(user.id)}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserRoleManagement;
