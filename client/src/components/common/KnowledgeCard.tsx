import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Building } from "lucide-react";

interface KnowledgeEntry {
  _id: string;
  author_name: string;
  title: string;
  content: string;
  department?: string;
  createdAt: string;
  formattedDate?: string;
}

interface KnowledgeCardProps {
  knowledge: KnowledgeEntry;
}

export const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ knowledge }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
            {knowledge.title}
          </CardTitle>
          {knowledge.department && (
            <Badge variant="secondary" className="ml-2 flex-shrink-0">
              <Building className="h-3 w-3 mr-1" />
              {knowledge.department}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{knowledge.author_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{knowledge.formattedDate || formatDate(knowledge.createdAt)}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-foreground/80 leading-relaxed">
          {truncateContent(knowledge.content)}
        </p>
      </CardContent>
    </Card>
  );
};
