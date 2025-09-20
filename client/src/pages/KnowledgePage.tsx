import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { KnowledgeCard } from '@/components/common/KnowledgeCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useSearch } from '@/contexts/SearchContext';
import { useDebounce } from '@/hooks/useDebounce';
import { BookOpen, Search, ArrowLeft, RefreshCw, X } from 'lucide-react';

interface KnowledgeEntry {
  _id: string;
  author_name: string;
  title: string;
  content: string;
  department?: string;
  createdAt: string;
  formattedDate?: string;
}

const departmentDisplayNames: { [key: string]: string } = {
  engineering: "Engineering",
  finance: "Finance",
  hr: "Human Resources",
  operations: "Operations",
  "legal-department": "Legal",
  procurement: "Procurement",
  "excecutive-director": "Executive Director",
  admin: "Admin",
  maintenance: "Maintenance"
};

function toTitleCase(value: string) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function KnowledgePage() {
  const { department } = useParams();
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { searchTerm, setSearchTerm } = useSearch();
  const [currentSearchInput, setCurrentSearchInput] = useState(searchTerm);
  const debouncedSearchTerm = useDebounce(currentSearchInput, 300);
  const { toast } = useToast();

  if (!department) return <Navigate to="/404" replace />;

  const rawDepartmentName = department.toLowerCase();
  const departmentName = departmentDisplayNames[rawDepartmentName] || toTitleCase(department);

  const fetchKnowledge = async (showRefreshLoader = false, search = '') => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      let url = `/api/knowledge/department/${encodeURIComponent(departmentName)}?limit=50`;
      if (search) {
        url = `/api/knowledge?department=${encodeURIComponent(departmentName)}&search=${encodeURIComponent(search)}&limit=50`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch knowledge entries');
      }

      const result = await response.json();
      setKnowledgeEntries(result.data || []);
    } catch (error) {
      console.error('Error fetching knowledge:', error);
      toast({
        title: "Error",
        description: "Failed to load knowledge entries. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchKnowledge(false, searchTerm);
  }, [departmentName, searchTerm]);

  // Update search term when debounced value changes (real-time search)
  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchTerm]);

  // Update local search input when global search term changes
  useEffect(() => {
    setCurrentSearchInput(searchTerm);
  }, [searchTerm]);

  const handleSearch = () => {
    setSearchTerm(currentSearchInput);
  };

  const handleRefresh = () => {
    fetchKnowledge(true, searchTerm);
  };

  const clearSearch = () => {
    setCurrentSearchInput('');
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
              <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
            </div>
            <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
          </div>
          
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg p-6">
                  <div className="h-6 bg-muted-foreground/20 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-muted-foreground/20 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted-foreground/20 rounded w-full"></div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-5/6"></div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to={`/departments/${department}`}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to {departmentName}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BookOpen className="h-8 w-8" />
              Knowledge Shared - {departmentName}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {knowledgeEntries.length} knowledge entr{knowledgeEntries.length === 1 ? 'y' : 'ies'} found
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2 relative">
            <Input 
              type="text" 
              placeholder="Search knowledge entries in real-time..."
              value={currentSearchInput}
              onChange={(e) => setCurrentSearchInput(e.target.value)}
              className="w-80 bg-card border-cyan-400 text-foreground focus:ring-primary focus:border-cyan-500 pr-8"
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
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Knowledge Entries */}
        {knowledgeEntries.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm ? 'No matching knowledge found' : 'No knowledge entries yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm 
                ? `No knowledge entries match "${searchTerm}" in the ${departmentName} department.`
                : `Be the first to share knowledge for the ${departmentName} department!`
              }
            </p>
            {searchTerm && (
              <Button onClick={clearSearch} variant="outline">
                Clear search and view all
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {searchTerm && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800">
                  Showing results for "<strong>{searchTerm}</strong>" in {departmentName}
                </p>
              </div>
            )}
            
            {knowledgeEntries.map((knowledge) => (
              <KnowledgeCard key={knowledge._id} knowledge={knowledge} />
            ))}
            
            {knowledgeEntries.length >= 50 && (
              <div className="text-center pt-6">
                <p className="text-sm text-muted-foreground">
                  Showing latest 50 entries. Use search to find specific knowledge.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
