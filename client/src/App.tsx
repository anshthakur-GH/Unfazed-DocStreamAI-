import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useParams } from "react-router-dom";
import React from 'react';
import { SearchProvider } from "@/contexts/SearchContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DocumentDetail from "./pages/DocumentDetail";
import ProfileView from "./pages/ProfileView";
import KnowledgePage from "./pages/KnowledgePage";
import Stats from "./pages/Stats";
import { DocumentForm } from "./components/documents/DocumentForm";
import { Navbar } from "./components/layout/Navbar";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { ErrorBoundary } from "./components/ErrorBoundary";
import LoginPage from "./pages/LoginPage";
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient();

// ProtectedRoute component to guard routes
const ProtectedRouteWrapper = () => {
  const { profile } = useParams();
  const { isAuthenticated, userProfile } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If accessing a profile route, check if the user belongs to that profile
  if (profile && userProfile !== profile) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

// Login wrapper component to handle login
const LoginWrapper = () => {
  return <LoginPage />;
};

// Root redirect component
const RootRedirect = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SearchProvider>
            <Toaster />
            <Sonner />
            <ErrorBoundary>
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  <Route path="/login" element={<LoginWrapper />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/" element={<RootRedirect />} />
                  
                  <Route element={<ProtectedRouteWrapper />}>
                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<Index />} />
                    <Route path="/documents/:id" element={
                      <div className="min-h-screen bg-background pt-28">
                        <Navbar />
                        <DocumentDetail />
                      </div>
                    } />
                    <Route path="/documents/:id/edit" element={
                      <div className="min-h-screen bg-background pt-28">
                        <Navbar />
                        <DocumentForm mode="edit" />
                      </div>
                    } />
                    <Route path="/documents/new" element={
                      <div className="min-h-screen bg-background pt-28">
                        <Navbar />
                        <DocumentForm mode="create" />
                      </div>
                    } />
                    <Route path="/profiles/:profile" element={
                      <div className="min-h-screen bg-background pt-28">
                        <Navbar />
                        <ProfileView />
                      </div>
                    } />
                    <Route path="/profiles/:profile/knowledge" element={
                      <div className="min-h-screen bg-background pt-28">
                        <Navbar />
                        <KnowledgePage />
                      </div>
                    } />
                    <Route path="/stats" element={
                      <div className="min-h-screen bg-background pt-28">
                        <Navbar />
                        <Stats />
                      </div>
                    } />
                  </Route>
                  
                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </ErrorBoundary>
          </SearchProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
