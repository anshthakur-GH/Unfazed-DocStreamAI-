import { Link, useLocation } from "react-router-dom";
import { BarChart3, Upload, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated, userProfile } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const knowledgeLink = userProfile ? `/profiles/${userProfile.toLowerCase()}/knowledge` : "/dashboard";

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 md:px-6">
      <nav className="relative bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-full px-4 md:px-8 py-3 max-w-7xl w-full flex items-center justify-between transition-all duration-500 hover:shadow-[0_8px_48px_rgba(59,130,246,0.15)] group">
        
        {/* Subtle Glow Effect */}
        <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-blue-400/10 to-transparent rounded-l-full pointer-events-none group-hover:from-blue-400/20 transition-all duration-500"></div>
        
        {/* Branding on the left */}
        <Link to="/dashboard" className="flex items-center space-x-2 z-10">
          <span className="text-xl md:text-2xl font-black tracking-tighter text-blue-600">
            DocStream<span className="text-slate-900">AI</span>
          </span>
        </Link>

        {/* Center Navigation Links */}
        <div className="hidden lg:flex items-center space-x-8 z-10">
          <Link to="/dashboard" className={`text-sm font-bold tracking-tight transition-colors ${isActive("/dashboard") ? "text-blue-600" : "text-slate-600 hover:text-blue-500"}`}>
            Home
          </Link>
          <Link to={knowledgeLink} className={`text-sm font-bold tracking-tight transition-colors ${location.pathname.includes("/knowledge") ? "text-blue-600" : "text-slate-600 hover:text-blue-500"}`}>
            Knowledge Base
          </Link>
          <Link to="/stats" className={`text-sm font-bold tracking-tight transition-colors ${isActive("/stats") ? "text-blue-600" : "text-slate-600 hover:text-blue-500"}`}>
            Analytics
          </Link>
        </div>

        {/* Actions (right) */}
        <div className="flex items-center space-x-2 md:space-x-4 z-10">
          <div className="hidden sm:flex items-center space-x-2">
            {isAuthenticated && (
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 h-9 text-xs font-bold tracking-tight transition-all shadow-md shadow-blue-600/10 border-none">
                <a href="https://n8n.cognigenai.in/form/ac89d498-e2b8-4e85-9dd0-893c3b7f18d5" target="_blank" rel="noopener noreferrer">
                  <Upload className="h-3.5 w-3.5 mr-2" />
                  Upload
                </a>
              </Button>
            )}

            <Button asChild variant="outline" className="rounded-full border-blue-100 hover:bg-blue-50 text-blue-600 px-4 py-2 h-9 text-xs font-bold tracking-tight transition-all hidden md:flex">
              <a href="https://latexly.unfazedai.in" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-2" />
                Latexly
              </a>
            </Button>
          </div>

          {/* Stats Button */}
          <Link
            to="/stats"
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-tight transition-all flex items-center shadow-md border ${isActive("/stats")
              ? "text-white bg-blue-600 border-blue-600 shadow-blue-600/20"
              : "text-blue-600 border-blue-600 hover:bg-blue-50 shadow-blue-600/5"
              }`}
          >
            <BarChart3 className="h-3.5 w-3.5 mr-2" />
            Stats
          </Link>
        </div>
      </nav>
    </div>
  );
};