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
  user_profile?: string;
  createdAt: string;
  formattedDate?: string;
}

export default function KnowledgePage() {
  const { profile } = useParams();
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { searchTerm, setSearchTerm } = useSearch();
  const [currentSearchInput, setCurrentSearchInput] = useState(searchTerm);
  const debouncedSearchTerm = useDebounce(currentSearchInput, 300);
  const { toast } = useToast();

  if (!profile) return <Navigate to="/404" replace />;

  const profileName = profile.charAt(0).toUpperCase() + profile.slice(1);

  const fetchKnowledge = async (showRefreshLoader = false, search = '') => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      let url = `/api/knowledge/profile/${encodeURIComponent(profileName)}?limit=50`;
      if (search) {
        url = `/api/knowledge?user_profile=${encodeURIComponent(profileName)}&search=${encodeURIComponent(search)}&limit=50`;
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
  }, [profileName, searchTerm]);

  // Update search term when debounced value changes (real-time search)
  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchTerm]);

  // Update local search input when global search term changes
  useEffect(() => {
    setCurrentSearchInput(searchTerm);
  }, [searchTerm]);

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
          <div className="mb-10">
            <div className="flex items-center gap-6 mb-6">
              <div className="h-10 w-32 bg-slate-100 rounded-xl animate-pulse"></div>
              <div className="h-10 w-64 bg-slate-100 rounded-xl animate-pulse"></div>
            </div>
            <div className="h-4 w-48 bg-slate-100 rounded animate-pulse mb-10"></div>
          </div>
          
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white/50 backdrop-blur-xl border border-slate-200 rounded-2xl p-8 animate-pulse">
                <div className="h-6 bg-slate-100 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2 mb-6"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-100 rounded w-4/6"></div>
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
        <div className="mb-10">
          <div className="flex items-center gap-6 mb-6">
            <Link to={`/profiles/${profile}`}>
              <Button variant="outline" size="sm" className="bg-white/70 backdrop-blur-md border border-slate-200 text-slate-900 hover:bg-white font-bold tracking-widest uppercase shadow-lg shadow-slate-200/50 rounded-xl h-10 px-5 active:scale-95 group transition-all">
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to {profileName}
              </Button>
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 uppercase">
              <BookOpen className="h-9 w-9 text-blue-600" />
              KNOWLEDGE SHARED
            </h1>
          </div>
          <p className="text-slate-500 font-medium tracking-wide">
            {knowledgeEntries.length} institutional intelligence records found for the {profileName} profile node.
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex items-center justify-between mb-10 gap-4">
          <div className="flex items-center space-x-2 relative group w-full max-w-md">
            <div className="absolute inset-0 bg-blue-600/5 blur-2xl rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity -z-10" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <Input 
              type="text" 
              placeholder="Query departmental wisdom..."
              value={currentSearchInput}
              onChange={(e) => setCurrentSearchInput(e.target.value)}
              className="pl-12 bg-white/80 backdrop-blur-xl border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500/50 shadow-lg shadow-blue-900/5 rounded-xl h-12 text-base"
            />
            {currentSearchInput && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-3 h-8 w-8 p-0 hover:bg-slate-100 text-slate-400"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-white/70 backdrop-blur-md border border-slate-200 text-slate-900 hover:bg-white font-bold tracking-widest uppercase shadow-lg shadow-slate-200/50 rounded-xl h-11 px-6 active:scale-95 transition-all"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync Knowledge
          </Button>
        </div>

        {/* Knowledge Entries */}
        {knowledgeEntries.length === 0 ? (
          <div className="bg-white/40 backdrop-blur-3xl rounded-3xl border border-dashed border-slate-200 p-20 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-6 text-slate-300 opacity-40 shadow-sm" />
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">
              {searchTerm ? 'No matching intelligence discovered' : 'No knowledge records found'}
            </h3>
            <p className="text-slate-500 font-medium tracking-wide mb-8">
              {searchTerm 
                ? `The query "${searchTerm}" returned no results within the ${profileName} node.`
                : `The departmental wisdom library is currently awaiting its first contribution for the ${profileName} profile.`
              }
            </p>
            {searchTerm && (
              <Button onClick={clearSearch} variant="outline" className="rounded-xl font-bold tracking-widest uppercase text-xs h-10 px-6 shadow-md shadow-slate-200/50">
                Clear query and view all
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {searchTerm && (
              <div className="bg-blue-50/50 backdrop-blur-md border border-blue-100 rounded-2xl p-6 mb-8 text-center">
                <p className="text-blue-900 font-bold tracking-tight">
                  Displaying results for <span className="text-blue-600 uppercase">"{searchTerm}"</span> within {profileName} Node
                </p>
              </div>
            )}
            
            <div className="space-y-6">
              {knowledgeEntries.map((knowledge) => (
                <KnowledgeCard key={knowledge._id} knowledge={knowledge} />
              ))}
            </div>
            
            {knowledgeEntries.length >= 50 && (
              <div className="text-center pt-10">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  End of stream (Latest 50 entries displayed)
                </p>
                <p className="text-slate-400 font-medium tracking-wide mt-1">Refine your query to explore deeper knowledge nodes.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
