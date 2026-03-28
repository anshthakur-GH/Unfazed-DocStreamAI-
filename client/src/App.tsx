import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useParams } from "react-router-dom";
import React, { useState } from 'react'; // Import useState and React
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
import LoginPage from "./pages/LoginPage"; // Import the new LoginPage component
import Unauthorized from "./pages/Unauthorized"; // Import the new Unauthorized component

const queryClient = new QueryClient();

// ProtectedRoute component to guard routes
const ProtectedRouteWrapper = () => {
  const { profile } = useParams(); // Get profile from URL
  const { isAuthenticated, userProfile } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If accessing a profile route, check if the user belongs to that profile
  if (profile && userProfile !== profile) {
    return <Navigate to="/unauthorized" replace />; // Redirect to an unauthorized page
  }

  return <Outlet />;
};

// Login wrapper component to handle login
const LoginWrapper = () => {
  return <LoginPage />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SearchProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginWrapper />} /> {/* Login route with onLogin prop */}
                <Route path="/unauthorized" element={<Unauthorized />} /> {/* Unauthorized access page */}
                
                <Route element={<ProtectedRouteWrapper />}>
                {/* Protected Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/documents/:id" element={
                  <div className="min-h-screen bg-background">
                    <Navbar />
                    <DocumentDetail />
                  </div>
                } />
                <Route path="/documents/:id/edit" element={
                  <div className="min-h-screen bg-background">
                    <Navbar />
                    <DocumentForm mode="edit" />
                  </div>
                } />
                <Route path="/documents/new" element={
                  <div className="min-h-screen bg-background">
                    <Navbar />
                    <DocumentForm mode="create" />
                  </div>
                } />
                <Route path="/profiles/:profile" element={
                  <div className="min-h-screen bg-background">
                    <Navbar />
                    <ProfileView />
                  </div>
                } />
                <Route path="/profiles/:profile/knowledge" element={
                  <div className="min-h-screen bg-background">
                    <Navbar />
                    <KnowledgePage />
                  </div>
                } />
                <Route path="/stats" element={
                  <div className="min-h-screen bg-background">
                    <Navbar />
                    <Stats />
                  </div>
                } />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SearchProvider>
      </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
