import { useParams, Navigate, Link } from "react-router-dom";
import { useDataStats } from "@/hooks/useDocuments";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { LatestNewsSection } from "@/components/layout/LatestNewsSection";
import { Input } from "@/components/ui/input"; // Import Input component
import { Button } from "@/components/ui/button"; // Import Button component
import { Search, BookOpen, X, FileText, Layout } from 'lucide-react'; // Import Search, BookOpen, X, FileText, and Layout icons
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
      <LatestNewsSection title="Latest Alerts" />
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

        {/* Documents for this profile categorized by type */}
        <div className="space-y-12">
          {/* Lecture Notes Section */}
          <section>
            <div className="flex items-center space-x-3 mb-6 border-b border-green-500/20 pb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Lecture Notes</h2>
              </div>
            </div>
            <DocumentTable 
              documentTypeFilter="Lecture Notes" 
              showControls={false} 
              hideHeading={true} 
            />
          </section>

          {/* Research Papers Section */}
          <section>
            <div className="flex items-center space-x-3 mb-6 border-b border-blue-500/20 pb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Research Papers</h2>
              </div>
            </div>
            <DocumentTable 
              documentTypeFilter="Research Paper" 
              showControls={false} 
              hideHeading={true} 
            />
          </section>

          {/* Other Documents Section */}
          <section>
            <div className="flex items-center space-x-3 mb-6 border-b border-gray-500/20 pb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Layout className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Other Documents</h2>
              </div>
            </div>
            <DocumentTable 
              documentTypeFilter="Policy Document" 
              showControls={false} 
              hideHeading={true} 
            />
          </section>
        </div>
      </div>
    </div>
  );
}