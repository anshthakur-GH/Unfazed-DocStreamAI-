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
<<<<<<< HEAD
=======
import { ScrollToTop } from "./components/layout/ScrollToTop";
>>>>>>> render/CODES
import { ErrorBoundary } from "./components/ErrorBoundary";
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

<<<<<<< HEAD
=======
// Root redirect component
const RootRedirect = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

>>>>>>> render/CODES
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SearchProvider>
            <Toaster />
            <Sonner />
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
            <ErrorBoundary>
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<LoginWrapper />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/" element={<Navigate to="/login" replace />} />
=======
            <ErrorBoundary>
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  <Route path="/login" element={<LoginWrapper />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/" element={<RootRedirect />} />
>>>>>>> render/CODES
                  
                  <Route element={<ProtectedRouteWrapper />}>
                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<Index />} />
                    <Route path="/documents/:id" element={
<<<<<<< HEAD
                      <div className="min-h-screen bg-background">
=======
                      <div className="min-h-screen bg-background pt-28">
>>>>>>> render/CODES
                        <Navbar />
                        <DocumentDetail />
                      </div>
                    } />
                    <Route path="/documents/:id/edit" element={
<<<<<<< HEAD
                      <div className="min-h-screen bg-background">
=======
                      <div className="min-h-screen bg-background pt-28">
>>>>>>> render/CODES
                        <Navbar />
                        <DocumentForm mode="edit" />
                      </div>
                    } />
                    <Route path="/documents/new" element={
<<<<<<< HEAD
                      <div className="min-h-screen bg-background">
=======
                      <div className="min-h-screen bg-background pt-28">
>>>>>>> render/CODES
                        <Navbar />
                        <DocumentForm mode="create" />
                      </div>
                    } />
                    <Route path="/profiles/:profile" element={
<<<<<<< HEAD
                      <div className="min-h-screen bg-background">
=======
                      <div className="min-h-screen bg-background pt-28">
>>>>>>> render/CODES
                        <Navbar />
                        <ProfileView />
                      </div>
                    } />
                    <Route path="/profiles/:profile/knowledge" element={
<<<<<<< HEAD
                      <div className="min-h-screen bg-background">
=======
                      <div className="min-h-screen bg-background pt-28">
>>>>>>> render/CODES
                        <Navbar />
                        <KnowledgePage />
                      </div>
                    } />
                    <Route path="/stats" element={
<<<<<<< HEAD
                      <div className="min-h-screen bg-background">
=======
                      <div className="min-h-screen bg-background pt-28">
>>>>>>> render/CODES
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
<<<<<<< HEAD
>>>>>>> 480e4afe8a9934af92be7d8171bf1f3e0f80f7fc
=======
>>>>>>> render/CODES
        </SearchProvider>
      </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
