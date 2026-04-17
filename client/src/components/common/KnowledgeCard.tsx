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
    <Card className="w-full bg-white/70 backdrop-blur-2xl border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 relative group">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="pb-3 border-b border-slate-50">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-bold text-slate-900 tracking-tight line-clamp-2">
            {knowledge.title}
          </CardTitle>
          {knowledge.department && (
            <Badge className="ml-2 flex-shrink-0 bg-blue-100 text-blue-700 border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest h-6">
              <Building className="h-3 w-3 mr-1" />
              {knowledge.department}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mt-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100/50 rounded-full border border-slate-200">
            <User className="h-3.5 w-3.5 text-blue-600" />
            <span>{knowledge.author_name}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100/50 rounded-full border border-slate-200">
            <Calendar className="h-3.5 w-3.5 text-blue-600" />
            <span>{knowledge.formattedDate || formatDate(knowledge.createdAt)}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <p className="text-slate-700 leading-relaxed text-base">
          {truncateContent(knowledge.content)}
        </p>
      </CardContent>
    </Card>
  );
};
