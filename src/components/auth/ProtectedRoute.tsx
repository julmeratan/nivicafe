import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = ['admin', 'chef', 'staff'] 
}) => {
  const { user, session, loading } = useAuth();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!session?.user) {
        setIsAuthorized(false);
        setCheckingRole(false);
        return;
      }

      try {
        // Verify session is valid server-side by making an authenticated request
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking role:', error);
          setIsAuthorized(false);
          setCheckingRole(false);
          return;
        }

        // Check if user has required role
        if (roleData && requiredRoles.includes(roleData.role)) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (err) {
        console.error('Authorization check failed:', err);
        setIsAuthorized(false);
      } finally {
        setCheckingRole(false);
      }
    };

    if (!loading) {
      checkAuthorization();
    }
  }, [session, loading, requiredRoles]);

  // Show loading state while checking auth
  if (loading || checkingRole) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user || !session) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Not authorized - show access denied
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-bold text-cream mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page. Please contact an administrator if you believe this is an error.
          </p>
          <div className="space-y-2">
            <a 
              href="/admin/login" 
              className="block w-full px-4 py-2 bg-gold text-charcoal font-medium rounded-lg hover:bg-gold/90 transition-colors"
            >
              Go to Login
            </a>
            <a 
              href="/" 
              className="block w-full px-4 py-2 bg-secondary text-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Return to Menu
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
