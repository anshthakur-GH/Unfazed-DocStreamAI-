import { Link, useLocation } from "react-router-dom";
import { BarChart3, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/70 backdrop-blur-3xl border-b border-white/60 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-28 relative">

          {/* Branding on the left */}
          <div className="flex items-center space-x-2 w-48">
            <span className="text-2xl font-black tracking-tighter text-blue-600">
              DocStream <span className="text-slate-900">AI</span>
            </span>
          </div>

          {/* Title in the middle */}
          <div className="absolute inset-x-0 text-center pointer-events-none flex flex-col items-center justify-center h-full">
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">
              Unfazed AI
            </h1>
          </div>

          {/* Actions (right) */}
          <div className="flex items-center space-x-3 z-10">
            {isAuthenticated && (
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 h-auto text-sm font-bold tracking-widest uppercase transition-all shadow-lg shadow-blue-600/20">
                <a href="https://n8n.cognigenai.in/form/ac89d498-e2b8-4e85-9dd0-893c3b7f18d5" target="_blank" rel="noopener noreferrer">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Doc
                </a>
              </Button>
            )}

            <Link
              to="/stats"
              className={`px-4 py-2 rounded-lg text-sm font-bold tracking-widest uppercase transition-all flex items-center shadow-lg ${isActive("/stats")
                ? "text-white bg-blue-600 shadow-blue-600/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Stats
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};