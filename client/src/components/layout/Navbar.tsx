import { Link, useLocation } from "react-router-dom";
<<<<<<< HEAD
import { BarChart3, Upload } from "lucide-react";
=======
import { BarChart3, Upload, ExternalLink, Home, BookOpen, Phone } from "lucide-react";
>>>>>>> render/CODES
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isActive = (path: string) => location.pathname === path;
<<<<<<< HEAD

  return (
    <nav className="bg-white/70 backdrop-blur-3xl border-b border-white/60 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 480e4afe8a9934af92be7d8171bf1f3e0f80f7fc
        <div className="flex items-center justify-between h-28 relative">

          {/* Branding on the left */}
          <div className="flex items-center space-x-2 w-48">
            <span className="text-2xl font-black tracking-tighter text-blue-600">
              DocStream <span className="text-slate-900">AI</span>
            </span>
<<<<<<< HEAD
=======
=======
        <div className="flex items-center justify-between h-28">
          {/* Logo Section - Images removed as requested */}
          <div className="flex items-center space-x-2">

>>>>>>> d37c9d43293122daf4f5c2819b40669957f939f7
>>>>>>> 480e4afe8a9934af92be7d8171bf1f3e0f80f7fc
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
=======
  const { userProfile } = useAuth();

  const knowledgeLink = userProfile ? `/profiles/${userProfile.toLowerCase()}/knowledge` : "/dashboard";

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 md:px-6">
      <nav className="relative bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-full px-4 md:px-8 py-3 max-w-7xl w-full flex items-center justify-between transition-all duration-500 hover:shadow-[0_8px_48px_rgba(59,130,246,0.15)] group">
        
        {/* Subtle Glow Effect on the left - matching the image style but with theme colors */}
        <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-blue-400/10 to-transparent rounded-l-full pointer-events-none group-hover:from-blue-400/20 transition-all duration-500"></div>
        
        {/* Branding on the left */}
        <Link to="/dashboard" className="flex items-center space-x-2 z-10">
          <span className="text-xl md:text-2xl font-black tracking-tighter text-blue-600">
            DocStream<span className="text-slate-900">AI</span>
          </span>
        </Link>

        {/* Center Navigation Links (Hidden on small screens) */}
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
>>>>>>> render/CODES
                </a>
              </Button>
            )}

<<<<<<< HEAD
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
=======
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
>>>>>>> render/CODES
  );
};