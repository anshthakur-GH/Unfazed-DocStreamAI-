import { useParams, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Download,
  Share,
  Edit,
  Clock,
  RefreshCw,
  ExternalLink,
  Users,
} from "lucide-react";
import { useDocument, useRelatedDocuments } from "@/hooks/useDocuments";
import { safeFormatDate } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import html2pdf from 'html2pdf.js';
import { useRef } from "react";

// Function to highlight dates in text
const highlightDatesInText = (text: string) => {
  if (!text) return null;

  // Updated Regex to find various date/time/number patterns
  const dateRegex = /(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s+\d{4})?|\b\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:,\s+\d{4})?|\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b|\b\d{1,2}:\d{2}(?:\s*(?:AM|PM))?\b|\b\d{4}\b|\b\d{1,2},\s*\d{4}\b|\b\d{1,4}\b)/gi;

  let lastIndex = 0;
  const parts: (string | JSX.Element)[] = [];
  let match;

  // Use exec() in a loop to get all matches and their indices
  while ((match = dateRegex.exec(text)) !== null) {
    // Add the part of the string before the current match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add the highlighted match
    parts.push(<span key={match.index} className="bg-yellow-200 p-0.5 rounded">{match[0]}</span>);

    // Update lastIndex to the end of the current match
    lastIndex = dateRegex.lastIndex;
  }

  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
};

const documentTypeColors = {
  Report: "bg-blue-100 text-blue-800",
  Policy: "bg-green-100 text-green-800",
  Technical: "bg-purple-100 text-purple-800",
  Strategy: "bg-orange-100 text-orange-800",
  Manual: "bg-gray-100 text-gray-800",
  Legal: "bg-red-100 text-red-800", // Added Legal document type
};

export default function DocumentDetail() {
  const { id } = useParams();
  const { data: document, isLoading, error } = useDocument(id || "");
  const { data: relatedDocuments, isLoading: relatedLoading } = useRelatedDocuments(id || "", 5);
  const documentRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return <Navigate to="/404" replace />;
  }

  const firstDepartment = document.departments_tagged?.[0];
  const departmentPath = firstDepartment ? `/departments/${firstDepartment.toLowerCase().replace(/\s+/g, '-')}` : "/";

  const handleDownloadPdf = () => {
    if (documentRef.current) {
      html2pdf().from(documentRef.current).save(`${document.document_title}.pdf`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {firstDepartment && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={departmentPath}>{firstDepartment}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage>{document.document_title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
              <Badge 
                className={documentTypeColors[document.document_type as keyof typeof documentTypeColors] || "bg-gray-100 text-gray-800"}
              >
                {document.document_type}
              </Badge>
            </div>
            
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter" style={{ fontFamily: 'Geist Sans, sans-serif' }}>
              {document.document_title}
            </h1>
            
            <p className="text-lg text-slate-700 w-full mb-6 leading-relaxed">
              {highlightDatesInText(document.summary || 'No summary available')}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center space-x-2 bg-slate-100/50 px-3 py-1.5 rounded-full border border-slate-200">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Created {safeFormatDate(document.createdAt || document._id)}</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-100/50 px-3 py-1.5 rounded-full border border-slate-200">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Modified {safeFormatDate(document.updatedAt || document.createdAt || document._id)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {document.webViewLink && (
              <a 
                href={document.webViewLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold tracking-widest uppercase transition-all shadow-lg bg-orange-500 text-white hover:bg-orange-600 h-10 px-4 shadow-orange-500/20"
              >
                See Original Document
              </a>
            )}
            <Button variant="outline" size="sm" className="bg-green-500 text-white hover:bg-green-600 font-bold tracking-widest uppercase shadow-lg shadow-green-500/20 h-10 px-4 border-none" onClick={handleDownloadPdf}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button size="sm" asChild className="bg-blue-600 text-white hover:bg-blue-700 font-bold tracking-widest uppercase shadow-lg shadow-blue-600/20 h-10 px-4">
              <Link to={`/documents/${document._id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 backdrop-blur-3xl border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
              <CardContent className="p-8 md:p-12" ref={documentRef}>
                <div className="prose prose-gray max-w-none">
                  {document.content ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {document.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-muted-foreground italic">No content available for this document.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/70 backdrop-blur-2xl border-slate-200 shadow-lg shadow-slate-200/30 rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100">
                <h3 className="font-semibold text-foreground flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Document Info
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="text-sm text-foreground">{document.document_type}</p>
                </div>
                
                <Separator />
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Document ID</label>
                  <p className="text-sm text-foreground font-mono">{document._id}</p>
                </div>
                
                <Separator />
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Departments</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {document.departments_tagged && document.departments_tagged.length > 0 ? (
                      document.departments_tagged.map((dept, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {dept}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No departments tagged</span>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Keywords</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {document.keywords && document.keywords.length > 0 ? (
                      document.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No keywords</span>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Images</label>
                  <p className="text-sm text-foreground">
                    {document.images && document.images.length > 0 
                      ? `${document.images.length} image(s)` 
                      : 'No images'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Related Documents Section - Full Width */}
        <Card className="mt-8 bg-white/70 backdrop-blur-2xl border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <Users className="h-6 w-6 mr-3" />
              Related Documents
            </h3>
          </CardHeader>
          <CardContent>
            {relatedLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-5 w-5 animate-spin mr-3" />
                <span className="text-muted-foreground">Loading related documents...</span>
              </div>
            ) : relatedDocuments && relatedDocuments.data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedDocuments.data.map((relatedDoc) => (
                  <div key={relatedDoc._id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors hover:shadow-md">
                    <Link to={`/documents/${relatedDoc._id}`} className="block h-full">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-foreground line-clamp-2 flex-1 text-base">
                          {relatedDoc.document_title}
                        </h4>
                        <ExternalLink className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-0 border-none transition-all ${documentTypeColors[relatedDoc.document_type as keyof typeof documentTypeColors] || "bg-gray-100 text-gray-800"}`}
                        >
                          {relatedDoc.document_type}
                        </Badge>
                        {relatedDoc.UrgencyLevel && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-2 py-0 border-none transition-all ${
                              relatedDoc.UrgencyLevel === 'High' ? 'bg-red-100 text-red-800' :
                              relatedDoc.UrgencyLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}
                          >
                            {relatedDoc.UrgencyLevel}
                          </Badge>
                        )}
                      </div>
                      
                      {relatedDoc.summary && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                          {relatedDoc.summary}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-wrap gap-1">
                          {relatedDoc.departments_tagged?.slice(0, 2).map((dept, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {dept}
                            </Badge>
                          ))}
                          {relatedDoc.departments_tagged && relatedDoc.departments_tagged.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{relatedDoc.departments_tagged.length - 2}
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {safeFormatDate(relatedDoc.createdAt)}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-2">No related documents found</p>
                <p className="text-sm text-muted-foreground">
                  Documents are related based on type, departments, and keywords
                </p>
              </div>
            )}
            
            {relatedDocuments && relatedDocuments.count > 5 && (
              <div className="text-center pt-6 border-t mt-6">
                <p className="text-muted-foreground">
                  Showing 5 of {relatedDocuments.count} related documents
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}