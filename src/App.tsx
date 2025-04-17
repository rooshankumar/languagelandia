import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';


// Pages
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Community from "./pages/Community";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings"; // Added
import ChatList from "./pages/ChatList"; // Added

// Components
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layouts/AppLayout";
import AuthLayout from "./components/layouts/AuthLayout";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/20"></div>
          <div className="h-2 w-24 rounded-full bg-primary/20"></div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={
        <AuthLayout>
          {user ? <Navigate to="/dashboard" replace /> : <Auth />}
        </AuthLayout>
      } />

      {/* Auth callback routes for OAuth - support both paths for compatibility */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/callback" element={<AuthCallback />} />

      {/* Protected routes with AppLayout */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <Onboarding onComplete={() => console.log("Onboarding completed")} />
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout>
            <Profile />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/community" element={
        <ProtectedRoute>
          <AppLayout>
            <Community />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute>
          <AppLayout>
            <ChatList /> {/* Updated */}
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/chat/:conversationId" element={
        <ProtectedRoute>
          <AppLayout>
            <Chat />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <AppLayout>
            <Settings />
          </AppLayout>
        </ProtectedRoute>
      } />


      {/* Catch all for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const AuthCodeHandler = () => {
  const location = useLocation();
  const { setUser } = useAuth();
  const code = new URLSearchParams(location.search).get('code');

  if (code) {
    // Handle the code here (e.g., send it to your backend for token exchange)
    // ... your code to handle the auth code ...
    console.log("Auth code received:", code);
    // Example: Simulate successful authentication
    setUser({ id: 1, name: 'Test User', email: 'test@example.com' }); // Replace with your actual user data retrieval
    return <Navigate to="/dashboard" replace />;
  }
  return null;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
        <BrowserRouter>
          <AuthProvider>
            <AuthCodeHandler />
            <AppRoutes />
            <Toaster />
            <Analytics debug={false} />
            <SpeedInsights debug={false} />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;