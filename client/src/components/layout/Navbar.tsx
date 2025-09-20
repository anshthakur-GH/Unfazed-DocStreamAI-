import { Link, useLocation } from "react-router-dom";
import { FileText, BarChart3 } from "lucide-react";
import kmrlLogo from "../../../assets/download.png"; // Import the KMRL logo
import g20Logo from "../../../assets/g20-logo-with-akam-01s.jpg";
import { Button } from "@/components/ui/button";
import { KnowledgeModal } from "@/components/common/KnowledgeModal";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-28">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center">
              <img src={kmrlLogo} alt="KMRL Logo" className="h-12 w-auto object-contain" />
            </Link>
            <img src={g20Logo} alt="G20 Logo" className="h-14 w-auto object-contain" />
          </div>

          {/* Title in the middle */}
          <div className="absolute inset-x-0 text-center pointer-events-none flex flex-col items-center justify-center h-full">
            <p className="text-sm text-foreground/80">कोच्चि मेट्रो रेल लिमिटेड</p>
            <h1 className="text-2xl font-extrabold text-foreground">Kochi Metro Rail Limited</h1>
            <p className="text-sm text-foreground/80">കൊച്ചി മെട്രോ റെയിൽ ലിമിറ്റഡ്</p>
          </div>

          {/* Actions (right) */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && <KnowledgeModal />}
            
            <Link
              to="/stats"
              className={`px-3 py-2 rounded-md text-sm font-bold transition-colors ${
                isActive("/stats")
                  ? "text-primary bg-primary/10"
                  : "text-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-1 inline" />
              Stats
            </Link>

          </div>
        </div>
      </div>
    </nav>
  );
};