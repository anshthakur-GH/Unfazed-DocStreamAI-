import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/contexts/SearchContext";

export const HeroSection = () => {
  const { searchTerm, setSearchTerm } = useSearch();

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            The DocStreamAI Document Automation System
          </h1>
          <p className="text-xl text-black mb-8 max-w-2xl mx-auto">
            Search and manage DocStreamAI documents efficiently
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search documents by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg bg-background border-2 border-cyan-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
