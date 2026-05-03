import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCreateDocument, useUpdateDocument, useDocument } from "@/hooks/useDocuments";
import { DocumentCreateData } from "@/services/api";
import { ArrowLeft, X, Plus } from "lucide-react";

const documentSchema = z.object({
  document_title: z.string().min(1, "Document title is required"),
  document_type: z.enum(["Research Paper", "Lecture Notes", "Policy Document", "Other"]),
  uploaded_by: z.string().min(1, "Uploaded by is required"),
  user_id: z.string().min(1, "User ID is required"),
  user_profile: z.enum(["Head", "Teacher", "Student"]),
  research_domain: z.string().optional().nullable(),
  subject_tags: z.array(z.string()).optional(),
  course_code: z.string().optional().nullable(),
  academic_year: z.string().optional().nullable(),
  authors: z.array(z.string()).optional(),
  date_published: z.string().optional().nullable(),
  funding_source: z.string().optional().nullable(),
  summary: z.string().min(1, "Summary is required"),
  keywords: z.array(z.string()).optional(),
  urgency_level: z.enum(["High", "Medium", "Low"]),
  google_drive_link: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  webViewLink: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface DocumentFormProps {
  mode: 'create' | 'edit';
}

export const DocumentForm = ({ mode }: DocumentFormProps) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [subjectTags, setSubjectTags] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [newAuthor, setNewAuthor] = useState("");

  const createMutation = useCreateDocument();
  const updateMutation = useUpdateDocument();
  const { data: document, isLoading: isLoadingDocument } = useDocument(id || "");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      document_title: "",
      document_type: "Other",
      uploaded_by: "admin",
      user_id: "admin_01",
      user_profile: "Student",
      summary: "",
      urgency_level: "Low",
      subject_tags: [],
      keywords: [],
      authors: [],
    },
  });

  // Load document data for editing
  useEffect(() => {
    if (mode === 'edit' && document) {
      Object.keys(documentSchema.shape).forEach((key) => {
        // @ts-ignore
        setValue(key as keyof DocumentFormData, document[key as keyof Document] || "");
      });
      setSubjectTags(document.subject_tags || []);
      setKeywords(document.keywords || []);
      setAuthors(document.authors || []);
    }
  }, [document, mode, setValue]);

  const onSubmit = async (data: DocumentFormData) => {
    try {
      const formData: DocumentCreateData = {
        document_title: data.document_title as string,
        document_type: data.document_type as "Research Paper" | "Lecture Notes" | "Policy Document" | "Other",
        uploaded_by: data.uploaded_by as string,
        user_id: data.user_id as string,
        user_profile: data.user_profile as "Head" | "Teacher" | "Student",
        summary: data.summary as string,
        urgency_level: data.urgency_level as "High" | "Medium" | "Low",
        subject_tags: subjectTags,
        keywords: keywords,
        authors: authors,
        research_domain: data.research_domain ?? null,
        course_code: data.course_code ?? null,
        academic_year: data.academic_year ?? null,
        date_published: data.date_published ?? null,
        funding_source: data.funding_source ?? null,
        google_drive_link: data.google_drive_link ?? null,
        webViewLink: data.webViewLink ?? null,
      };

      if (mode === 'create') {
        await createMutation.mutateAsync(formData);
        toast({
          title: "Document created",
          description: "The document has been successfully created.",
        });
      } else {
        await updateMutation.mutateAsync({ id: id!, data: formData });
        toast({
          title: "Document updated",
          description: "The document has been successfully updated.",
        });
      }
      
<<<<<<< HEAD
      navigate("/");
=======
      navigate("/dashboard");
>>>>>>> render/CODES
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${mode} document. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !subjectTags.includes(newTag.trim())) {
      const updated = [...subjectTags, newTag.trim()];
      setSubjectTags(updated);
      setValue("subject_tags", updated);
      setNewTag("");
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      const updated = [...keywords, newKeyword.trim()];
      setKeywords(updated);
      setValue("keywords", updated);
      setNewKeyword("");
    }
  };

  const addAuthor = () => {
    if (newAuthor.trim() && !authors.includes(newAuthor.trim())) {
      const updated = [...authors, newAuthor.trim()];
      setAuthors(updated);
      setValue("authors", updated);
      setNewAuthor("");
    }
  };

  if (mode === 'edit' && isLoadingDocument) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <Button
            variant="ghost"
<<<<<<< HEAD
            onClick={() => navigate("/")}
=======
            onClick={() => navigate("/dashboard")}
>>>>>>> render/CODES
            className="mb-6 bg-white/70 backdrop-blur-md border-slate-200 text-slate-900 hover:bg-white font-bold tracking-widest uppercase shadow-lg shadow-slate-200/50 rounded-xl h-10 px-5 active:scale-95 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Documents
          </Button>
<<<<<<< HEAD
<<<<<<< HEAD
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
            {mode === 'create' ? 'Provision New Document' : 'Update Intelligence Node'}
=======
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase" style={{ fontFamily: 'Geist Sans, sans-serif' }}>
            {mode === 'create' ? 'PROVISION NEW ASSET' : 'CALIBRATE ASSET'}
>>>>>>> 480e4afe8a9934af92be7d8171bf1f3e0f80f7fc
=======
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase" style={{ fontFamily: 'Geist Sans, sans-serif' }}>
            {mode === 'create' ? 'PROVISION NEW ASSET' : 'CALIBRATE ASSET'}
>>>>>>> render/CODES
          </h1>
          <p className="text-slate-500 mt-2 font-medium tracking-wide">
            {mode === 'create' 
              ? 'Initialize a new institutional document within the Unfazed AI node.'
              : 'Modify the existing documentation parameters and intelligence mappings.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-3xl border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-lg font-bold text-slate-900">Core Information</CardTitle>
              <CardDescription className="text-slate-500">
                Provide the essential details for your document.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="document_title">Document Title *</Label>
                <Input id="document_title" {...register("document_title")} className="bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" />
                {errors.document_title && <p className="text-xs text-destructive">{errors.document_title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="document_type">Document Type *</Label>
                <Select onValueChange={(value) => setValue("document_type", value as any)} defaultValue={watch("document_type")}>
                  <SelectTrigger className="bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Research Paper">Research Paper</SelectItem>
                    <SelectItem value="Lecture Notes">Lecture Notes</SelectItem>
                    <SelectItem value="Policy Document">Policy Document</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency_level">Urgency Level *</Label>
                <Select onValueChange={(value) => setValue("urgency_level", value as any)} defaultValue={watch("urgency_level")}>
                  <SelectTrigger className="bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="uploaded_by">Uploaded By *</Label>
                <Input id="uploaded_by" {...register("uploaded_by")} className="bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_profile">User Profile *</Label>
                <Select onValueChange={(value) => setValue("user_profile", value as any)} defaultValue={watch("user_profile")}>
                  <SelectTrigger className="bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl">
                    <SelectValue placeholder="Select profile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Head">Head</SelectItem>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-3xl border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-lg font-bold text-slate-900">Academic Details</CardTitle>
              <CardDescription className="text-slate-500">
                Specify research domains and academic metadata.
              </CardDescription>
            </CardHeader>
<<<<<<< HEAD
<<<<<<< HEAD
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
=======
            <CardContent className="space-y-4">
>>>>>>> 480e4afe8a9934af92be7d8171bf1f3e0f80f7fc
=======
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
>>>>>>> render/CODES
              <div className="space-y-2">
                <Label htmlFor="research_domain">Research Domain</Label>
                <Input id="research_domain" {...register("research_domain")} className="bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course_code">Course Code</Label>
                <Input id="course_code" {...register("course_code")} className="bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="academic_year">Academic Year</Label>
                <Input id="academic_year" {...register("academic_year")} placeholder="e.g., 2023-24" className="bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_published">Date Published</Label>
                <Input id="date_published" type="date" {...register("date_published")} className="bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="funding_source">Funding Source</Label>
                <Input id="funding_source" {...register("funding_source")} className="bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-3xl border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-lg font-bold text-slate-900">Content & Intelligence</CardTitle>
              <CardDescription className="text-slate-500">
                Summarize the document and provide access links.
              </CardDescription>
            </CardHeader>
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> render/CODES
            <CardContent className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="summary">Summary *</Label>
                <Textarea id="summary" {...register("summary")} rows={4} className="bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="google_drive_link">Institutional Resource Link (Google Drive)</Label>
                <Input id="google_drive_link" {...register("google_drive_link")} placeholder="https://drive.google.com/..." className="bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" />
                {errors.google_drive_link && <p className="text-xs text-destructive">{errors.google_drive_link.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="webViewLink">Web View Link</Label>
                <Input id="webViewLink" {...register("webViewLink")} placeholder="https://..." className="bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" />
                {errors.webViewLink && <p className="text-xs text-destructive">{errors.webViewLink.message}</p>}
              </div>
            </CardContent>
            <CardHeader className="border-t border-slate-50">
              <CardTitle className="text-lg font-bold text-slate-900">Tags, Keywords & Authors</CardTitle>
            </CardHeader>
<<<<<<< HEAD
=======
>>>>>>> 480e4afe8a9934af92be7d8171bf1f3e0f80f7fc
=======
>>>>>>> render/CODES
            <CardContent className="space-y-6">
              <div>
                <Label>Authors</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} placeholder="Add author" className="rounded-xl" />
                  <Button type="button" onClick={addAuthor} size="sm" className="rounded-xl"><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {authors.map((a) => (
                    <Badge key={a} variant="secondary" className="rounded-lg">{a} <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setAuthors(authors.filter(x => x !== a))} /></Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Subject Tags</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add tag" className="rounded-xl" />
                  <Button type="button" onClick={addTag} size="sm" className="rounded-xl"><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {subjectTags.map((t) => (
                    <Badge key={t} variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 rounded-lg">{t} <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSubjectTags(subjectTags.filter(x => x !== t))} /></Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Keywords</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} placeholder="Add keyword" className="rounded-xl" />
                  <Button type="button" onClick={addKeyword} size="sm" className="rounded-xl"><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {keywords.map((k) => (
                    <Badge key={k} variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 rounded-lg">{k} <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setKeywords(keywords.filter(x => x !== k))} /></Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

<<<<<<< HEAD
<<<<<<< HEAD
=======
          <Card className="bg-white/80 backdrop-blur-3xl border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-lg font-bold text-slate-900">Academic Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="research_domain">Research Domain</Label>
                <Input id="research_domain" {...register("research_domain")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course_code">Course Code</Label>
                <Input id="course_code" {...register("course_code")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="academic_year">Academic Year</Label>
                <Input id="academic_year" {...register("academic_year")} placeholder="e.g., 2023-24" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_published">Date Published</Label>
                <Input id="date_published" type="date" {...register("date_published")} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="funding_source">Funding Source</Label>
                <Input id="funding_source" {...register("funding_source")} />
              </div>
            </CardContent>
          </Card>

>>>>>>> 480e4afe8a9934af92be7d8171bf1f3e0f80f7fc
=======

>>>>>>> render/CODES
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
<<<<<<< HEAD
              onClick={() => navigate("/")}
=======
              onClick={() => navigate("/dashboard")}
>>>>>>> render/CODES
              className="bg-white/70 backdrop-blur-md border-slate-200 text-slate-900 hover:bg-white font-bold tracking-widest uppercase shadow-lg shadow-slate-200/50 rounded-xl h-12 px-8 active:scale-95"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-blue-600 text-white hover:bg-blue-700 font-bold tracking-widest uppercase shadow-lg shadow-blue-600/20 rounded-xl h-12 px-10 active:scale-95"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {mode === 'create' ? 'Initializing...' : 'Calibrating...'}
                </>
              ) : (
                mode === 'create' ? 'Finalize Provision' : 'Commit Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
