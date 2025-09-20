import React, { useState, useEffect } from 'react';
import { KnowledgeCard } from './KnowledgeCard';
import { Button } from "@/components/ui/button";
import { BookOpen, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KnowledgeEntry {
  _id: string;
  author_name: string;
  title: string;
  content: string;
  department?: string;
  createdAt: string;
  formattedDate?: string;
}

interface KnowledgeSectionProps {
  departmentFilter?: string;
  title?: string;
  limit?: number;
}

export const KnowledgeSection: React.FC<KnowledgeSectionProps> = ({ 
  departmentFilter, 
  title = "Latest Knowledge Shared",
  limit = 5 
}) => {
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchKnowledge = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      let url = `/api/knowledge/recent?limit=${limit}`;
      if (departmentFilter) {
        url = `/api/knowledge/department/${encodeURIComponent(departmentFilter)}?limit=${limit}`;
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
    fetchKnowledge();
  }, [departmentFilter, limit]);

  const handleRefresh = () => {
    fetchKnowledge(true);
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {title}
          </h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg p-4">
                <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted-foreground/20 rounded w-1/2 mb-3"></div>
                <div className="h-3 bg-muted-foreground/20 rounded w-full mb-1"></div>
                <div className="h-3 bg-muted-foreground/20 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {title}
          {departmentFilter && (
            <span className="text-sm font-normal text-muted-foreground">
              ({departmentFilter})
            </span>
          )}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {knowledgeEntries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium mb-1">No knowledge entries yet</p>
          <p className="text-sm">
            {departmentFilter 
              ? `Be the first to share knowledge for the ${departmentFilter} department!`
              : "Be the first to share your knowledge!"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {knowledgeEntries.map((knowledge) => (
            <KnowledgeCard key={knowledge._id} knowledge={knowledge} />
          ))}
          
          {knowledgeEntries.length >= limit && (
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Showing latest {limit} entries
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
