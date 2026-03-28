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
  Edit,
  ExternalLink,
  AlertTriangle
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDocumentsList, useDeleteDocument } from "@/hooks/useDocuments";
import { useToast } from "@/hooks/use-toast";
import { useSearch } from "@/contexts/SearchContext";
import { safeFormatDate } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { documentKeys } from "@/hooks/useDocuments";

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
  documentTypeFilter?: string;
  showControls?: boolean;
  sortOrderProp?: 'asc' | 'desc';
  onSortChange?: (value: 'asc' | 'desc') => void;
  hideHeading?: boolean;
}

export const DocumentTable = ({
  userProfileFilter,
  documentTypeFilter,
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
    document_type: documentTypeFilter,
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

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-destructive">Failed to load documents</h3>
        <p className="text-sm text-destructive/80 mb-4">{error instanceof Error ? error.message : "An unexpected network error occurred."}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="border-destructive text-destructive hover:bg-destructive hover:text-white">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  const documents = data?.data || [];
  const pagination = data?.pagination;

  if (!isLoading && documents.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-3xl rounded-3xl border border-dashed border-slate-200 p-16 text-center shadow-xl shadow-slate-200/50">
        <FileText className="h-16 w-16 text-slate-300 mx-auto mb-6 opacity-40" />
        <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">No Intelligence Nodes Found</h3>
        <p className="text-slate-500 mt-3 max-w-sm mx-auto font-medium">
          {userProfileFilter 
            ? `The stream currently contains no assets provisioned for the ${userProfileFilter} profile.`
            : "The intelligence library is currently unsynchronized."}
        </p>
        <Button size="lg" asChild className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-widest uppercase rounded-xl px-10 shadow-lg shadow-blue-600/20">
          <Link to="/documents/new"><Plus className="h-5 w-5 mr-3" />Provision First Asset</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!hideHeading && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              {userProfileFilter ? `${userProfileFilter} Protocol` : "Global Stream"}
            </h1>
            <p className="text-slate-500 font-medium tracking-wide mt-3">{pagination?.total || 0} Intelligence nodes synchronized</p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading || isSpinning}
              className="bg-white/70 backdrop-blur-md border-slate-200 text-slate-900 font-bold tracking-widest uppercase hover:bg-white rounded-xl shadow-lg shadow-slate-200/50 h-10 transition-all active:scale-95"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isSpinning ? 'animate-spin' : ''}`}
              />
              Sync
            </Button>

            <Button
              size="sm"
              onClick={() => {
                const url = 'https://n8n.Unfazed AI-ai.online/form-test/723abf57-4dcb-4dbe-9e6d-dffac7ed5442';
                window.open(url, '_blank');
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black tracking-widest uppercase rounded-xl h-10 px-6 shadow-xl shadow-blue-600/30 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      )}

      {showControls && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-48">
            <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => handleSortOrder(value)}>
              <SelectTrigger className="bg-white/70 backdrop-blur-md border-slate-200 rounded-xl h-12 font-bold tracking-widest uppercase text-slate-700"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">LATEST ENTRY</SelectItem>
                <SelectItem value="asc">EARLIEST ENTRY</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-56">
            <Select value={urgencySort} onValueChange={(value) => setUrgencySort(value === "all" ? undefined : value)}>
              <SelectTrigger className="bg-white/70 backdrop-blur-md border-slate-200 rounded-xl h-12 font-bold tracking-widest uppercase text-slate-700">
                <SelectValue placeholder="URGENCY RANKING" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ALL URGENCY</SelectItem>
                <SelectItem value="high_to_low">HIGH TO LOW</SelectItem>
                <SelectItem value="low_to_high">LOW TO HIGH</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-3xl rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 border-slate-100 h-16 pointer-events-none">
              <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] pl-8">Title</TableHead>
              <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">Profile</TableHead>
              <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">Type</TableHead>
              <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">Urgency</TableHead>
              <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">Timestamp</TableHead>
              <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] pr-8 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc._id} className="group border-slate-50 h-24 hover:bg-blue-50/30 transition-all cursor-default">
                <TableCell className="pl-8">
                  <Link to={`/documents/${doc._id}`} className="block">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 tracking-tighter truncate max-w-[300px] uppercase text-lg leading-tight">{doc.document_title}</div>
                        <div className="text-sm text-slate-500 font-medium line-clamp-1 mt-1">{doc.summary}</div>
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-black text-[10px] tracking-widest uppercase border-slate-200 h-6 px-3 bg-white text-slate-600 shadow-sm">
                    {doc.user_profile}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`font-black text-[10px] tracking-widest uppercase h-6 px-3 border-none shadow-md shadow-blue-900/5 ${documentTypeColors[doc.document_type as keyof typeof documentTypeColors] || "bg-slate-100 text-slate-600"}`}>
                    {doc.document_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`font-black text-[10px] tracking-widest uppercase h-6 px-3 border-none shadow-md shadow-blue-900/5 ${urgencyLevelColors[doc.urgency_level as keyof typeof urgencyLevelColors] || "bg-slate-100 text-slate-600"}`}>
                    {doc.urgency_level}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2 text-slate-500">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-bold tracking-widest uppercase">{doc.date_published ? safeFormatDate(doc.date_published, 'MMM dd, yyyy') : "Pending"}</span>
                  </div>
                </TableCell>
                <TableCell className="pr-8 text-right">
                  <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" asChild className="h-10 w-10 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl">
                      <Link to={`/documents/${doc._id}`}><Eye className="h-5 w-5" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild className="h-10 w-10 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl">
                      <Link to={`/documents/${doc._id}/edit`}><Edit className="h-5 w-5" /></Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(doc._id, doc.document_title)} 
                      disabled={deleteDocumentMutation.isPending}
                      className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-12">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Synchronized {currentPage * 20 + 1} TO {Math.min((currentPage + 1) * 20, pagination.total)} OF {pagination.total} NODES
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} 
              disabled={currentPage === 0}
              className="bg-white border-slate-200 text-slate-900 font-bold tracking-widest uppercase h-10 px-6 rounded-xl shadow-lg shadow-slate-200/50 disabled:opacity-30"
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(currentPage + 1)} 
              disabled={!pagination.hasMore}
              className="bg-white border-slate-200 text-slate-900 font-bold tracking-widest uppercase h-10 px-6 rounded-xl shadow-lg shadow-slate-200/50 disabled:opacity-30"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};