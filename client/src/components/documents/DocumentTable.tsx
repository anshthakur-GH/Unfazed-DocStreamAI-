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
  Report: "bg-blue-100 text-blue-800",
  Policy: "bg-green-100 text-green-800",
  Technical: "bg-purple-100 text-purple-800",
  Strategy: "bg-orange-100 text-orange-800",
  Manual: "bg-gray-100 text-gray-800",
  Legal: "bg-red-100 text-red-800", // Added Legal document type
};

const urgencyLevelColors = {
  Critical: "bg-red-100 text-red-800",
  High: "bg-orange-100 text-orange-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
};

interface DocumentTableProps {
  departmentFilter?: string;
  showControls?: boolean;
  sortOrderProp?: 'asc' | 'desc';
  onSortChange?: (value: 'asc' | 'desc') => void;
  hideHeading?: boolean; // New prop to hide the internal heading
}

export const DocumentTable = ({ 
  departmentFilter,
  showControls = true,
  sortOrderProp,
  onSortChange,
  hideHeading,
}: DocumentTableProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortOrderState, setSortOrderState] = useState<'asc' | 'desc'>('desc');
  const { searchTerm } = useSearch();
  const [urgencySort, setUrgencySort] = useState<string | undefined>(undefined); // New state for urgency level sorting

  const sortOrder = sortOrderProp ?? sortOrderState;
  
  const { toast } = useToast();
  const deleteDocumentMutation = useDeleteDocument();
  const queryClient = useQueryClient(); // Initialize queryClient
  const [isSpinning, setIsSpinning] = useState(false); // New state for controlling spin animation

  // API query parameters
  const queryParams = {
    limit: 20,
    skip: currentPage * 20,
    sort: sortOrder,
    search: searchTerm || undefined,
    urgency_sort: urgencySort, // Include urgency level sorting
  };

  const { data, isLoading, error, refetch } = useDocumentsList({
    department: departmentFilter,
    ...queryParams,
  });

  const handleRefresh = async () => {
    setIsSpinning(true); // Start spinning
    queryClient.invalidateQueries({ queryKey: documentKeys.all }); // Invalidate all document lists and details
    // Introduce a small delay to ensure the loading state is visible
    await new Promise(resolve => setTimeout(resolve, 500)); 
    await refetch();
    setIsSpinning(false); // Stop spinning after refetch and delay
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteDocumentMutation.mutateAsync(id);
        toast({
          title: "Document deleted",
          description: "The document has been successfully deleted.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete document. Please try again.",
          variant: "destructive",
        });
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
        {/* Only show this header if hideHeading is not true */}
        {!hideHeading && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {departmentFilter ? `${departmentFilter} Documents` : "Latest documents"}
              </h1>
              <p className="text-muted-foreground">Loading documents...</p>
            </div>
          </div>
        )}
        <div className="bg-card rounded-lg border shadow-sm p-8 text-center">
          <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Only show this header if hideHeading is not true */}
        {!hideHeading && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {departmentFilter ? `${departmentFilter} Documents` : "Latest documents"}
              </h1>
              <p className="text-muted-foreground">Error loading documents</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        )}
        <div className="bg-card rounded-lg border shadow-sm p-8 text-center">
          <p className="text-destructive mb-4">Failed to load documents</p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  const documents = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Only show this header if hideHeading is not true */}
      {!hideHeading && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {departmentFilter ? `${departmentFilter} Documents` : "Latest documents"}
            </h1>
            <p className="text-muted-foreground">
              {pagination?.total || 0} documents found
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || isSpinning}
              className={`bg-green-500 hover:bg-green-600 text-white border border-cyan-500 ${isLoading || isSpinning ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <RefreshCw 
                className="h-4 w-4 mr-2 animate-spin"
                style={{ animationPlayState: isSpinning ? 'running' : 'paused' }}
              />
              Refresh
            </Button>
            
            <Button
              size="sm"
              onClick={() => {
                const url = 'https://n8n.unfazed-ai.online/form-test/723abf57-4dcb-4dbe-9e6d-dffac7ed5442';
                window.open(url, '_blank');
              }}
              className="bg-cyan-500 hover:bg-cyan-600 text-white border border-cyan-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Publish Document
            </Button>
            
          </div>
        </div>
      )}

      {/* Filters */}
      {showControls && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-32">
            <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => handleSortOrder(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-40">
            <Select 
              value={urgencySort}
              onValueChange={(value) => setUrgencySort(value === "all" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency Levels</SelectItem>
                <SelectItem value="critical_to_low">Critical to Low</SelectItem>
                <SelectItem value="low_to_critical">Low to Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-lg border border-cyan-400 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted border-border">
              <TableHead className="font-semibold text-foreground">Document</TableHead>
              <TableHead className="font-semibold text-foreground">Type</TableHead>
              <TableHead className="font-semibold text-foreground">Departments</TableHead>
              <TableHead className="font-semibold text-foreground">Urgency</TableHead>
              <TableHead className="font-semibold text-foreground">Created</TableHead>
              <TableHead className="font-semibold text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow 
                key={doc._id} 
                className="hover:bg-muted/50 transition-colors cursor-pointer animate-fade-in border-border"
              >
                <TableCell className="space-y-1">
                  <Link 
                    to={`/documents/${doc._id}`}
                    className="block hover:text-primary transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-foreground">
                          {doc.document_title}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {doc.summary || 'No summary available'}
                        </div>
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={documentTypeColors[doc.document_type as keyof typeof documentTypeColors] || "bg-gray-100 text-gray-800"}
                  >
                    {doc.document_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {doc.departments_tagged?.length > 0 ? (
                      doc.departments_tagged.map((dept, index) => (
                        <Badge key={index} className="text-xs bg-cyan-500 text-white">
                          {dept}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No departments</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={doc.UrgencyLevel ? urgencyLevelColors[doc.UrgencyLevel as keyof typeof urgencyLevelColors] || "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-800"}
                  >
                    {doc.UrgencyLevel || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {safeFormatDate(doc.createdAt || doc._id, 'MMM dd, yyyy', 'No Date')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/documents/${doc._id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/documents/${doc._id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(doc._id, doc.document_title)}
                      disabled={deleteDocumentMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {currentPage * 20 + 1} to {Math.min((currentPage + 1) * 20, pagination.total)} of {pagination.total} documents
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasMore}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {documents.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No documents found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or create a new document.
          </p>
        </div>
      )}
    </div>
  );
};