import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileText, 
  Calendar, 
  Eye, 
  RefreshCw,
  Plus,
  Trash2,
  Edit
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDocumentsList, useDeleteDocument } from "@/hooks/useDocuments";
import { useToast } from "@/hooks/use-toast";
import { useSearch } from "@/contexts/SearchContext";
import { safeFormatDate } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query"; // Import useQueryClient
import { documentKeys } from "@/hooks/useDocuments"; // Import documentKeys

const documentTypeColors = {
  "Research Paper": "bg-blue-100 text-blue-800",
  "Lecture Notes": "bg-green-100 text-green-800",
  "Policy Document": "bg-purple-100 text-purple-800",
  Other: "bg-gray-100 text-gray-800",
};

const urgencyLevelColors = {
  High: "bg-red-100 text-red-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
};

interface DocumentTableProps {
  userProfileFilter?: string;
  showControls?: boolean;
  sortOrderProp?: 'asc' | 'desc';
  onSortChange?: (value: 'asc' | 'desc') => void;
  hideHeading?: boolean;
}

export const DocumentTable = ({ 
  userProfileFilter,
  showControls = true,
  sortOrderProp,
  onSortChange,
  hideHeading,
}: DocumentTableProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortOrderState, setSortOrderState] = useState<'asc' | 'desc'>('desc');
  const { searchTerm } = useSearch();
  const [urgencySort, setUrgencySort] = useState<string | undefined>(undefined);

  const sortOrder = sortOrderProp ?? sortOrderState;
  
  const { toast } = useToast();
  const deleteDocumentMutation = useDeleteDocument();
  const queryClient = useQueryClient();
  const [isSpinning, setIsSpinning] = useState(false);

  const queryParams = {
    limit: 20,
    skip: currentPage * 20,
    sort: sortOrder,
    search: searchTerm || undefined,
    urgency_sort: urgencySort,
    user_profile: userProfileFilter,
  };

  const { data, isLoading, error, refetch } = useDocumentsList(queryParams);

  const handleRefresh = async () => {
    setIsSpinning(true);
    queryClient.invalidateQueries({ queryKey: documentKeys.all });
    await new Promise(resolve => setTimeout(resolve, 500)); 
    await refetch();
    setIsSpinning(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteDocumentMutation.mutateAsync(id);
        toast({ title: "Document deleted", description: "The document has been successfully deleted." });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete document.", variant: "destructive" });
      }
    }
  };

  const handleSortOrder = (value: 'asc' | 'desc') => {
    if (onSortChange) onSortChange(value);
    else setSortOrderState(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {!hideHeading && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {userProfileFilter ? `${userProfileFilter} Documents` : "Latest documents"}
              </h1>
              <p className="text-muted-foreground">Loading documents...</p>
            </div>
          </div>
        )}
        <div className="bg-card rounded-lg border shadow-sm p-8 text-center">
          <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
        </div>
      </div>
    );
  }

  const documents = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {!hideHeading && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {userProfileFilter ? `${userProfileFilter} Documents` : "Latest documents"}
            </h1>
            <p className="text-muted-foreground">{pagination?.total || 0} documents found</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button size="sm" onClick={handleRefresh} disabled={isLoading || isSpinning}
              className={`bg-green-500 hover:bg-green-600 text-white border border-cyan-500 ${isLoading || isSpinning ? 'opacity-70 cursor-not-allowed' : ''}`}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isSpinning ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" asChild className="bg-cyan-500 hover:bg-cyan-600 text-white border border-cyan-500">
               <Link to="/documents/new"><Plus className="h-4 w-4 mr-2" />Add Document</Link>
            </Button>
          </div>
        </div>
      )}

      {showControls && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-32">
            <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => handleSortOrder(value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-40">
            <Select value={urgencySort} onValueChange={(value) => setUrgencySort(value === "all" ? undefined : value)}>
              <SelectTrigger><SelectValue placeholder="Sort by Urgency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency Levels</SelectItem>
                <SelectItem value="high_to_low">High to Low</SelectItem>
                <SelectItem value="low_to_high">Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="bg-card rounded-lg border border-cyan-400 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted border-border">
              <TableHead className="font-semibold text-foreground">Document Title</TableHead>
              <TableHead className="font-semibold text-foreground">Type</TableHead>
              <TableHead className="font-semibold text-foreground">Authors</TableHead>
              <TableHead className="font-semibold text-foreground">Domain</TableHead>
              <TableHead className="font-semibold text-foreground">Urgency</TableHead>
              <TableHead className="font-semibold text-foreground">Published</TableHead>
              <TableHead className="font-semibold text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc._id} className="hover:bg-muted/50 transition-colors cursor-pointer border-border">
                <TableCell className="max-w-md">
                  <Link to={`/documents/${doc._id}`} className="block hover:text-primary transition-colors">
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-foreground truncate max-w-[300px]">{doc.document_title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{doc.summary}</div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.subject_tags?.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] py-0 px-1 bg-cyan-50">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge className={documentTypeColors[doc.document_type] || "bg-gray-100 text-gray-800"}>{doc.document_type}</Badge>
                </TableCell>
                <TableCell className="text-sm italic text-muted-foreground">{doc.authors?.length > 0 ? doc.authors.join(", ") : "Unknown"}</TableCell>
                <TableCell className="text-sm">{doc.research_domain || "N/A"}</TableCell>
                <TableCell>
                  <Badge className={urgencyLevelColors[doc.urgency_level] || "bg-gray-100 text-gray-800"}>{doc.urgency_level}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{doc.date_published ? safeFormatDate(doc.date_published, 'MMM dd, yyyy') : "N/A"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/documents/${doc._id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/documents/${doc._id}/edit`}><Edit className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(doc._id, doc.document_title)} disabled={deleteDocumentMutation.isPending}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {currentPage * 20 + 1} to {Math.min((currentPage + 1) * 20, pagination.total)} of {pagination.total} documents
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={!pagination.hasMore}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
};