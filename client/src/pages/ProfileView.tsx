import { useParams, Navigate, Link } from "react-router-dom";
import { useDataStats } from "@/hooks/useDocuments";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { LatestNewsSection } from "@/components/layout/LatestNewsSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, X, FileText, Layout } from 'lucide-react';
import { useSearch } from "@/contexts/SearchContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useState, useEffect } from "react";

export default function ProfileView() {
  const { profile } = useParams();
  const { searchTerm, setSearchTerm } = useSearch();
  const [currentSearchInput, setCurrentSearchInput] = useState(searchTerm);
  const debouncedSearchTerm = useDebounce(currentSearchInput, 300);
  
  if (!profile) return <Navigate to="/404" replace />;

  const profileName = profile.charAt(0).toUpperCase() + profile.slice(1);
  const { data: stats, isLoading } = useDataStats();

  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchTerm]);

  useEffect(() => {
    setCurrentSearchInput(searchTerm);
  }, [searchTerm]);

  const clearSearch = () => {
    setCurrentSearchInput('');
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-background">
      <LatestNewsSection title="System Status" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-6xl font-black text-slate-900 mb-3 tracking-tighter uppercase leading-none">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter uppercase leading-none">
            {profileName} <span className="text-blue-600">NODE</span>
          </h1>
          <p className="text-slate-500 font-medium tracking-widest uppercase text-xs">
            {isLoading ? "Synchronizing institutional assets..." : `Access authenticated for ${profileName} profile.`}
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-16">
          <div className="flex w-full max-w-xl items-center relative group">
            <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity -z-10" />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <Input 
              type="text" 
              placeholder="Query institutional node..."
              placeholder="Query institutional node..."
              value={currentSearchInput}
              onChange={(e) => setCurrentSearchInput(e.target.value)}
              className="pl-14 bg-white/70 backdrop-blur-3xl border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500/50 shadow-2xl shadow-blue-900/5 rounded-2xl h-14 text-lg font-medium transition-all"
            />
            {currentSearchInput && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-4 h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Link to={`/profiles/${profile}/knowledge`} className="w-full md:w-auto">
            <Button 
              className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 rounded-2xl px-8 flex items-center justify-center space-x-3 border-none font-black tracking-widest uppercase text-xs transition-all active:scale-95"
            >
              <BookOpen className="h-4 w-4" />
              <span>Collective Wisdom</span>
            </Button>
          </Link>
        </div>

        {/* Categorized Streams */}
        <div className="space-y-24">
          <section>
            <div className="flex items-center justify-between mb-8 border-b-2 border-slate-100 pb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Academic Intelligence</h2>
                  <p className="text-sm text-slate-500 font-medium">Lecture notes and course documentation.</p>
                </div>
              </div>
            </div>
            <DocumentTable 
              userProfileFilter={profileName}
              documentTypeFilter="Lecture Notes" 
              showControls={false} 
              hideHeading={true} 
            />
          </section>

          <section>
            <div className="flex items-center justify-between mb-8 border-b-2 border-slate-100 pb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Research Papers</h2>
                  <p className="text-sm text-slate-500 font-medium">Published papers and specialized research data.</p>
                </div>
              </div>
            </div>
            <DocumentTable 
              userProfileFilter={profileName}
              documentTypeFilter="Research Paper" 
              showControls={false} 
              hideHeading={true} 
            />
          </section>

          <section>
            <div className="flex items-center justify-between mb-8 border-b-2 border-slate-100 pb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                  <Layout className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Other Assets</h2>
                  <p className="text-sm text-slate-500 font-medium">Miscellaneous institutional documentation.</p>
                </div>
              </div>
            </div>
            <DocumentTable 
              userProfileFilter={profileName}
              documentTypeFilter="Other" 
              showControls={false} 
              hideHeading={true} 
            />
          </section>
        {/* Categorized Streams or Search Results */}
        <div className="space-y-24">
          {searchTerm ? (
            <section>
              <div className="flex items-center justify-between mb-8 border-b-2 border-slate-100 pb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Search Results</h2>
                    <p className="text-sm text-slate-500 font-medium">Displaying all documents matching "{searchTerm}"</p>
                  </div>
                </div>
              </div>
              <DocumentTable 
                userProfileFilter={profileName}
                showControls={true} 
                hideHeading={true} 
              />
            </section>
          ) : (
            <>
              <section>
                <div className="flex items-center justify-between mb-8 border-b-2 border-slate-100 pb-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Academic Intelligence</h2>
                      <p className="text-sm text-slate-500 font-medium">Lecture notes and course documentation.</p>
                    </div>
                  </div>
                </div>
                <DocumentTable 
                  userProfileFilter={profileName}
                  documentTypeFilter="Lecture Notes" 
                  showControls={false} 
                  hideHeading={true} 
                />
              </section>

              <section>
                <div className="flex items-center justify-between mb-8 border-b-2 border-slate-100 pb-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Research Papers</h2>
                      <p className="text-sm text-slate-500 font-medium">Published papers and specialized research data.</p>
                    </div>
                  </div>
                </div>
                <DocumentTable 
                  userProfileFilter={profileName}
                  documentTypeFilter="Research Paper" 
                  showControls={false} 
                  hideHeading={true} 
                />
              </section>

              <section>
                <div className="flex items-center justify-between mb-8 border-b-2 border-slate-100 pb-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                      <Layout className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Other Assets</h2>
                      <p className="text-sm text-slate-500 font-medium">Miscellaneous institutional documentation.</p>
                    </div>
                  </div>
                </div>
                <DocumentTable 
                  userProfileFilter={profileName}
                  documentTypeFilter="Other" 
                  showControls={false} 
                  hideHeading={true} 
                />
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}