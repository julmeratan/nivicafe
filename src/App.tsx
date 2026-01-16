import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/context/CartContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SettingsSyncer from "@/components/settings/SettingsSyncer";
import Index from "./pages/Index";
import MenuPage from "./pages/MenuPage";
import KitchenDisplay from "./pages/KitchenDisplay";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <AuthProvider>
          <LanguageProvider>
            <SettingsProvider>
              <CartProvider>
                <SettingsSyncer />
                <Toaster />
                <Sonner 
                  position="top-center"
                  toastOptions={{
                    style: {
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    },
                  }}
                />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route 
                      path="/kitchen" 
                      element={
                        <ProtectedRoute requiredRoles={['admin', 'chef', 'staff']}>
                          <KitchenDisplay />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route 
                      path="/admin" 
                      element={
                        <ProtectedRoute requiredRoles={['admin']}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </CartProvider>
            </SettingsProvider>
          </LanguageProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
