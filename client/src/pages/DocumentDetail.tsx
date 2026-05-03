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
import { DocAIChat } from "@/components/documents/DocAIChat";

import { useRef } from "react";

// Function to highlight dates in text
const highlightDatesInText = (text: string) => {
  if (!text) return null;
  const dateRegex = /(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s+\d{4})?|\b\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:,\s+\d{4})?|\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b|\b\d{1,2}:\d{2}(?:\s*(?:AM|PM))?\b|\b\d{4}\b|\b\d{1,2},\s*\d{4}\b|\b\d{1,4}\b)/gi;
  let lastIndex = 0;
  const parts: (string | JSX.Element)[] = [];
  let match;
  while ((match = dateRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.substring(lastIndex, match.index));
    parts.push(<span key={match.index} className="bg-yellow-200 p-0.5 rounded">{match[0]}</span>);
    lastIndex = dateRegex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.substring(lastIndex));
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
          <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Accessing intelligence node...</p>
        </div>
      </div>
    );
  }

  if (error || !document) return <Navigate to="/404" replace />;

  const handleDownloadPdf = async () => {
    if (documentRef.current) {
      const html2pdf = (await import('html2pdf.js')).default;
      html2pdf().from(documentRef.current).save(`${document.document_title}.pdf`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/dashboard" className="font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-blue-600">Home</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage className="font-bold text-xs uppercase tracking-widest text-slate-900">{document.document_title}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <Button variant="ghost" size="sm" asChild className="h-9 w-9 p-0 bg-white/70 backdrop-blur-md border border-slate-200 text-slate-900 hover:bg-white rounded-xl shadow-lg shadow-slate-200/50 active:scale-95 group transition-all">
                <Link to="/dashboard"><ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /></Link>
              </Button>
              <Badge className={`${documentTypeColors[document.document_type as keyof typeof documentTypeColors] || "bg-gray-100 text-gray-800"} rounded-lg font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 shadow-sm border-none`}>
                {document.document_type}
              </Badge>
              <Badge className={`${urgencyLevelColors[document.urgency_level as keyof typeof urgencyLevelColors] || "bg-gray-100 text-gray-800"} rounded-lg font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 shadow-sm border-none`}>
                {document.urgency_level}
              </Badge>
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter" style={{ fontFamily: 'Geist Sans, sans-serif' }}>

            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter leading-tight uppercase">
              {document.document_title}
            </h1>

            <p className="text-lg text-slate-500 font-medium tracking-tight w-full mb-6 leading-relaxed">
              {highlightDatesInText(document.summary || 'No summary available')}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2 bg-slate-100/50 px-3 py-1.5 rounded-full border border-slate-200">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-bold text-[10px] uppercase tracking-widest text-slate-500">Uploaded {safeFormatDate(document.upload_timestamp || document.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-100/50 px-3 py-1.5 rounded-full border border-slate-200">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Modified {safeFormatDate(document.updatedAt || document.createdAt || document._id)}</span>
=======
            <h1 className="text-3xl font-bold text-foreground mb-4">{document.document_title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2 border border-black/10 p-1.5 rounded-md">
                <Calendar className="h-4 w-4" />
                <span>Uploaded {safeFormatDate(document.upload_timestamp)}</span>
              </div>
              <div className="flex items-center space-x-2 border border-black/10 p-1.5 rounded-md">
                <Users className="h-4 w-4" />
                <span>By {document.uploaded_by} ({document.user_profile})</span>
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-bold text-[10px] uppercase tracking-widest text-slate-500">By {document.uploaded_by} ({document.user_profile})</span>
              </div>
            </div>
          </div>

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
=======
            {(document.webViewLink || document.google_drive_link) && (
              <a href={document.webViewLink || document.google_drive_link || "#"} target="_blank" rel="noopener noreferrer" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium border border-input bg-orange-500 text-white hover:bg-orange-600 h-9 px-3">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Original
              </a>
            )}
            <Button variant="outline" size="sm" className="bg-green-500 text-white hover:bg-green-600" onClick={handleDownloadPdf}>
              <Download className="h-4 w-4 mr-2" />Download
            </Button>
            <Button size="sm" asChild className="bg-[#008285] text-white hover:bg-[#008285]/90">
              <Link to={`/documents/${document._id}/edit`}><Edit className="h-4 w-4 mr-2" />Edit</Link>
          <div className="flex flex-col gap-2 shrink-0 items-end">
            <DocAIChat documentId={document._id} documentTitle={document.document_title} />

            {(document.webViewLink || document.google_drive_link) && (
              <a
                href={document.webViewLink || document.google_drive_link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all shadow-lg bg-orange-500 text-white hover:bg-orange-600 h-9 w-48 shadow-orange-500/20 active:scale-95"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-2" />
                View Original
              </a>
            )}

            <Button variant="outline" size="sm" className="bg-green-500 text-white hover:bg-green-600 font-bold tracking-widest uppercase shadow-lg shadow-green-500/20 h-9 w-48 border-none rounded-xl active:scale-95 text-[10px]" onClick={handleDownloadPdf}>
              <Download className="h-3.5 w-3.5 mr-2" />
              PDF Download
            </Button>

            <Button size="sm" asChild className="bg-blue-600 text-white hover:bg-blue-700 font-bold tracking-widest uppercase shadow-lg shadow-blue-600/20 h-9 w-48 rounded-xl active:scale-95 text-[10px]">
              <Link to={`/documents/${document._id}/edit`}>
                <Edit className="h-3.5 w-3.5 mr-2" />
                Edit Doc
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Card className="bg-white/80 backdrop-blur-3xl border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden mb-8">
              <CardContent className="p-8 md:p-12" ref={documentRef}>
                <div className="space-y-8">
                  <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-p:text-slate-700 prose-p:leading-relaxed text-slate-700">
                    {document.content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {document.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-slate-700 leading-relaxed text-lg">{document.summary}</p>
                    )}
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
            <Card>
              <CardContent className="p-8" ref={documentRef}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Summary</h3>
                    <p className="text-foreground leading-relaxed">{document.summary}</p>
                  </div>

                  <Separator className="bg-slate-100" />
                  
                  </div>

                  <Separator className="bg-slate-100" />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Research Domain</h4>
                      <p className="text-slate-900 font-bold tracking-tight">{document.research_domain || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Academic Year</h4>
                      <p className="text-slate-900 font-bold tracking-tight">{document.academic_year || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Course Code</h4>
                      <p className="text-slate-900 font-bold tracking-tight">{document.course_code || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Funding Source</h4>
                      <p className="text-slate-900 font-bold tracking-tight">{document.funding_source || "N/A"}</p>
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Subject Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {document.subject_tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="bg-blue-50/50 border-blue-100 text-blue-700 font-bold text-[10px] uppercase tracking-widest rounded-lg px-2.5 py-1 shadow-sm">{tag}</Badge>
                      ))}
                    </div>
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
                </div>
              </CardContent>
            </Card>

            {/* Relevant Research Papers Section - Only for Lecture Notes */}
            {document.document_type === 'Lecture Notes' && relatedDocuments && relatedDocuments.data.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center space-x-4 mb-8 border-b border-blue-500/10 pb-6">
                  <div className="p-3 bg-blue-100 rounded-2xl text-blue-600 shadow-lg shadow-blue-600/10">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Relevant Research Papers</h2>
                    <p className="text-slate-500 font-medium tracking-wide">Expand your knowledge with these specialized publications</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedDocuments.data.map((relatedDoc: any) => (
                    <Card key={relatedDoc._id} className="group bg-white/70 backdrop-blur-xl border-slate-200 hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-600/10 transition-all duration-500 rounded-2xl overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex flex-col h-full">
                          <div className="flex items-center justify-between mb-4">
                            <Badge className="bg-blue-50 text-blue-600 text-[10px] font-black tracking-widest uppercase border-none px-2 py-0.5 shadow-sm">
                              RESEARCH PAPER
                            </Badge>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center">
                              <Calendar className="h-3 w-3 mr-1.5 opacity-70" />
                              {safeFormatDate(relatedDoc.upload_timestamp || relatedDoc.createdAt, 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <Link to={`/documents/${relatedDoc._id}`} className="group-hover:text-blue-600 transition-colors mb-4">
                            <h4 className="font-black text-slate-900 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors uppercase tracking-widest leading-none mb-1">{relatedDoc.document_title}</h4>
                            <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed italic">
                              {relatedDoc.summary}
                            </p>
                          </Link>

                          <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-50">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[150px] flex items-center">
                              <Users className="h-3 w-3 mr-2 opacity-50" />
                              {relatedDoc.authors?.length > 0 ? relatedDoc.authors[0] : 'Unknown Author'}
                              {relatedDoc.authors?.length > 1 && ` +${relatedDoc.authors.length - 1}`}
                            </div>
                            <Button variant="ghost" size="sm" asChild className="h-9 px-4 text-blue-600 hover:text-white hover:bg-blue-600 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-blue-600/20 active:scale-95">
                              <Link to={`/documents/${relatedDoc._id}`}>
                                Access <ExternalLink className="ml-2 h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-white/70 backdrop-blur-2xl border-slate-200 shadow-lg shadow-slate-200/30 rounded-2xl overflow-hidden">
            <Card className="bg-white/70 backdrop-blur-2xl border-slate-200 shadow-lg shadow-slate-200/30 rounded-2xl overflow-hidden sticky top-24">
              <CardHeader className="border-b border-slate-100">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                  Intelligence Node
                </h3>
              </CardHeader>
=======
            <Card>
              <CardHeader><h3 className="font-semibold flex items-center"><FileText className="h-5 w-5 mr-2" />Information</h3></CardHeader>
              <CardContent className="space-y-4">
              <CardContent className="space-y-6 pt-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Node Type</label>
                  <p className="text-sm font-bold text-slate-700">{document.document_type}</p>
                </div>
                <Separator className="bg-slate-50" />
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Authors</label>
                  <div className="space-y-1.5 mt-1">
                    {document.authors?.map(author => (
                      <p key={author} className="text-sm font-bold text-slate-600 italic tracking-tight">{author}</p>
                    )) || <p className="text-sm font-medium text-slate-400">N/A</p>}
                  </div>
                </div>
                <Separator className="bg-slate-50" />
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Metadata Tags</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {document.keywords?.map(kw => (
                      <Badge key={kw} variant="secondary" className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border-none rounded-lg">{kw}</Badge>
                    ))}
                  </div>
                </div>
                <Separator className="bg-slate-50" />
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Institutional Date</label>
                  <p className="text-sm font-bold text-slate-700">{document.date_published ? safeFormatDate(document.date_published) : "N/A"}</p>
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
        {/* Relevant Research Papers Section - Only for Lecture Notes */}
        {document.document_type === 'Lecture Notes' && relatedDocuments && relatedDocuments.data.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center space-x-3 mb-6 border-b border-blue-500/20 pb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Relevant Research Papers</h2>
                <p className="text-sm text-muted-foreground">Expand your knowledge with these related publications</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedDocuments.data.map((relatedDoc: any) => (
                <Card key={relatedDoc._id} className="group hover:border-blue-400/50 hover:shadow-lg transition-all duration-300 border-cyan-100">
                  <CardContent className="p-6">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-[10px] font-semibold border-none">
                          RESEARCH PAPER
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-medium flex items-center">
                          <Calendar className="h-3 w-3 mr-1 opacity-70" />
                          {safeFormatDate(relatedDoc.upload_timestamp, 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <Link to={`/documents/${relatedDoc._id}`} className="group-hover:text-blue-600 transition-colors mb-3">
                        <h4 className="font-bold text-lg line-clamp-1 text-foreground leading-tight">{relatedDoc.document_title}</h4>
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-5 flex-grow italic">
                        {relatedDoc.summary}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                        <div className="text-xs font-medium text-slate-500 truncate max-w-[150px] flex items-center">
                          <Users className="h-3 w-3 mr-1.5 opacity-50" />
                          {relatedDoc.authors?.length > 0 ? relatedDoc.authors[0] : 'Unknown Author'}
                          {relatedDoc.authors?.length > 1 && ` +${relatedDoc.authors.length - 1}`}
                        </div>
                        <Button variant="ghost" size="sm" asChild className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold group-hover:translate-x-1 transition-transform">
                          <Link to={`/documents/${relatedDoc._id}`}>
                            Details <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}