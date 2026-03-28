import { useParams, Navigate, Link } from "react-router-dom";
import { useDataStats } from "@/hooks/useDocuments";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { LatestNewsSection } from "@/components/layout/LatestNewsSection";
import { Input } from "@/components/ui/input"; // Import Input component
import { Button } from "@/components/ui/button"; // Import Button component
import { Search, BookOpen, X } from 'lucide-react'; // Import Search and BookOpen icons
import { useSearch } from "@/contexts/SearchContext"; // Import useSearch hook
import { useDebounce } from "@/hooks/useDebounce"; // Import useDebounce hook
import { useState, useEffect } from "react"; // Import useState and useEffect

export default function ProfileView() {
  const { profile } = useParams();
  const { searchTerm, setSearchTerm } = useSearch(); // Use the search context
  const [currentSearchInput, setCurrentSearchInput] = useState(searchTerm); // Local state for input
  const debouncedSearchTerm = useDebounce(currentSearchInput, 300); // Debounce search input
  
  if (!profile) return <Navigate to="/404" replace />;

  const profileName = profile.charAt(0).toUpperCase() + profile.slice(1);
  const { data: stats, isLoading } = useDataStats();

  // Update search term when debounced value changes (real-time search)
  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchTerm]);

  // Sync local input with global search term
  useEffect(() => {
    setCurrentSearchInput(searchTerm);
  }, [searchTerm]);

  const handleSearch = () => {
    setSearchTerm(currentSearchInput);
  };

  const clearSearch = () => {
    setCurrentSearchInput('');
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-background">
      <LatestNewsSection title="Latest Alerts" userProfileFilter={profileName} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{profileName} View</h1>
          <p className="text-muted-foreground">
            {isLoading ? "Loading..." : "Access restricted to " + profileName + " profile"}
          </p>
        </div>

        {/* Search Input and Knowledge Button */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex w-full max-w-sm items-center space-x-2 relative">
            <Input 
              type="text" 
              placeholder="Search documents..."
              value={currentSearchInput}
              onChange={(e) => setCurrentSearchInput(e.target.value)}
              className="bg-card border-cyan-400 text-foreground focus:ring-primary focus:border-cyan-500 pr-8"
            />
            {currentSearchInput && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 h-6 w-6 p-0 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <Link to={`/profiles/${profile}/knowledge`}>
            <Button 
              variant="outline"
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <BookOpen className="h-4 w-4" />
              <span>Latest Knowledge Shared</span>
            </Button>
          </Link>
        </div>

        {/* Documents for this profile */}
        <DocumentTable userProfileFilter={profileName} showControls={true} hideHeading={true} />
      </div>
    </div>
  );
}