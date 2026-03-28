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

  if (error || !document) return <Navigate to="/404" replace />;

  const handleDownloadPdf = () => {
    if (documentRef.current) {
      html2pdf().from(documentRef.current).save(`${document.document_title}.pdf`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>{document.document_title}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link>
              </Button>
              <Badge className={documentTypeColors[document.document_type] || "bg-gray-100 text-gray-800"}>
                {document.document_type}
              </Badge>
              <Badge className={urgencyLevelColors[document.urgency_level] || "bg-gray-100 text-gray-800"}>
                {document.urgency_level}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-4">{document.document_title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2 border border-black/10 p-1.5 rounded-md">
                <Calendar className="h-4 w-4" />
                <span>Uploaded {safeFormatDate(document.upload_timestamp)}</span>
              </div>
              <div className="flex items-center space-x-2 border border-black/10 p-1.5 rounded-md">
                <Users className="h-4 w-4" />
                <span>By {document.uploaded_by} ({document.user_profile})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {document.google_drive_link && (
              <a href={document.google_drive_link} target="_blank" rel="noopener noreferrer" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium border border-input bg-orange-500 text-white hover:bg-orange-600 h-9 px-3">
                See Original Document
              </a>
            )}
            <Button variant="outline" size="sm" className="bg-green-500 text-white hover:bg-green-600" onClick={handleDownloadPdf}>
              <Download className="h-4 w-4 mr-2" />Download
            </Button>
            <Button size="sm" asChild className="bg-[#008285] text-white hover:bg-[#008285]/90">
              <Link to={`/documents/${document._id}/edit`}><Edit className="h-4 w-4 mr-2" />Edit</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-8" ref={documentRef}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Summary</h3>
                    <p className="text-foreground leading-relaxed">{document.summary}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Research Domain</h4>
                      <p>{document.research_domain || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Academic Year</h4>
                      <p>{document.academic_year || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Course Code</h4>
                      <p>{document.course_code || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Funding Source</h4>
                      <p>{document.funding_source || "N/A"}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Subject Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {document.subject_tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="bg-cyan-50">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader><h3 className="font-semibold flex items-center"><FileText className="h-5 w-5 mr-2" />Information</h3></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="text-sm">{document.document_type}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Authors</label>
                  <div className="space-y-1 mt-1">
                    {document.authors?.map(author => (<p key={author} className="text-sm italic">{author}</p>)) || <p className="text-sm">N/A</p>}
                  </div>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Keywords</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {document.keywords?.map(kw => (<Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>))}
                  </div>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date Published</label>
                  <p className="text-sm">{document.date_published ? safeFormatDate(document.date_published) : "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}