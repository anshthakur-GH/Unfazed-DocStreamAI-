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
import DepartmentView from "./pages/DepartmentView";
import KnowledgePage from "./pages/KnowledgePage";
import Stats from "./pages/Stats";
import { DocumentForm } from "./components/documents/DocumentForm";
import { Navbar } from "./components/layout/Navbar";
import { ErrorBoundary } from "./components/ErrorBoundary";
import LoginPage from "./pages/LoginPage"; // Import the new LoginPage component

const queryClient = new QueryClient();

// ProtectedRoute component to guard routes
const ProtectedRouteWrapper = () => {
  const { department } = useParams(); // Get department from URL
  const { isAuthenticated, userDepartment } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If accessing a departmental route, check if the user belongs to that department
  if (department && userDepartment !== department) {
    return <Navigate to="/unauthorized" replace />; // Redirect to an unauthorized page
  }

  return <Outlet />;
};

// Login wrapper component to handle login
const LoginWrapper = () => {
  const { setIsAuthenticated } = useAuth();

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return <LoginPage onLogin={handleLogin} />;
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
                <Routes>
                  <Route path="/login" element={<LoginWrapper />} /> {/* Login route with onLogin prop */}
                  <Route path="/unauthorized" element={<NotFound />} /> {/* Unauthorized access page */}
                  <Route path="/" element={<Navigate to="/login" replace />} /> {/* Redirect root to majestic login */}
                  
                  <Route element={<ProtectedRouteWrapper />}>
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={<Index />} />
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
                  <Route path="/departments/:department" element={
                    <div className="min-h-screen bg-background">
                      <Navbar />
                      <DepartmentView />
                    </div>
                  } />
                  <Route path="/departments/:department/knowledge" element={
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
          </ErrorBoundary>
        </SearchProvider>
      </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
