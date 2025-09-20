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
  document_type: z.string().min(1, "Document type is required"),
  summary: z.string().optional(),
  content: z.string().optional(),
  departments_tagged: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface DocumentFormProps {
  mode: 'create' | 'edit';
}

export const DocumentForm = ({ mode }: DocumentFormProps) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [departments, setDepartments] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newDepartment, setNewDepartment] = useState("");
  const [newKeyword, setNewKeyword] = useState("");

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
      document_type: "",
      summary: "",
      content: "",
      departments_tagged: [],
      keywords: [],
      images: [],
    },
  });

  const watchedDepartments = watch("departments_tagged") || [];
  const watchedKeywords = watch("keywords") || [];

  // Load document data for editing
  useEffect(() => {
    if (mode === 'edit' && document) {
      setValue("document_title", document.document_title);
      setValue("document_type", document.document_type);
      setValue("summary", document.summary || "");
      setValue("content", document.content || "");
      setValue("departments_tagged", document.departments_tagged || []);
      setValue("keywords", document.keywords || []);
      setValue("images", document.images || []);
      setDepartments(document.departments_tagged || []);
      setKeywords(document.keywords || []);
    }
  }, [document, mode, setValue]);

  const onSubmit = async (data: DocumentFormData) => {
    try {
      const formData: DocumentCreateData = {
        ...data,
        departments_tagged: departments,
        keywords: keywords,
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
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${mode} document. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const addDepartment = () => {
    if (newDepartment.trim() && !departments.includes(newDepartment.trim())) {
      const updated = [...departments, newDepartment.trim()];
      setDepartments(updated);
      setValue("departments_tagged", updated);
      setNewDepartment("");
    }
  };

  const removeDepartment = (department: string) => {
    const updated = departments.filter(d => d !== department);
    setDepartments(updated);
    setValue("departments_tagged", updated);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      const updated = [...keywords, newKeyword.trim()];
      setKeywords(updated);
      setValue("keywords", updated);
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    const updated = keywords.filter(k => k !== keyword);
    setKeywords(updated);
    setValue("keywords", updated);
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
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            {mode === 'create' ? 'Create New Document' : 'Edit Document'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {mode === 'create' 
              ? 'Fill in the details below to create a new document.'
              : 'Update the document details below.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide the essential details for your document.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document_title">Document Title *</Label>
                <Input
                  id="document_title"
                  {...register("document_title")}
                  placeholder="Enter document title"
                />
                {errors.document_title && (
                  <p className="text-sm text-destructive">{errors.document_title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="document_type">Document Type *</Label>
                <Select onValueChange={(value) => setValue("document_type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Report">Report</SelectItem>
                    <SelectItem value="Policy">Policy</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Strategy">Strategy</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
                {errors.document_type && (
                  <p className="text-sm text-destructive">{errors.document_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  {...register("summary")}
                  placeholder="Enter a brief summary of the document"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>
                Add the main content of your document.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="content">Document Content</Label>
                <Textarea
                  id="content"
                  {...register("content")}
                  placeholder="Enter the main content of the document"
                  rows={10}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
              <CardDescription>
                Tag departments and add keywords to help organize your document.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Departments</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      placeholder="Add department"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDepartment())}
                    />
                    <Button type="button" onClick={addDepartment} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {departments.map((dept) => (
                      <Badge key={dept} variant="secondary" className="flex items-center gap-1">
                        {dept}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeDepartment(dept)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Keywords</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Add keyword"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    />
                    <Button type="button" onClick={addKeyword} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {keywords.map((keyword) => (
                      <Badge key={keyword} variant="outline" className="flex items-center gap-1">
                        {keyword}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeKeyword(keyword)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                mode === 'create' ? 'Create Document' : 'Update Document'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
