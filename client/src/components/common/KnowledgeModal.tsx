import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { BookOpen, Loader2 } from "lucide-react";

interface KnowledgeModalProps {
  children?: React.ReactNode;
  onKnowledgeAdded?: () => void;
}

interface KnowledgeFormData {
  author_name: string;
  title: string;
  content: string;
  user_profile: string;
}

export const KnowledgeModal: React.FC<KnowledgeModalProps> = ({ children, onKnowledgeAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<KnowledgeFormData>({
    author_name: '',
    title: '',
    content: '',
    user_profile: ''
  });

  const { toast } = useToast();
  const { userProfile } = useAuth();
  const location = useLocation();

  const profiles = ['Head', 'Teacher', 'Student'];

  // Profile mapping for URL to display names
  const profileDisplayNames: { [key: string]: string } = {
    head: "Head",
    teacher: "Teacher",
    student: "Student"
  };

  // Function to get current profile from URL or user profile
  const getCurrentProfile = (): string => {
    // First, try to get profile from current URL (if on profile page)
    const pathMatch = location.pathname.match(/\/profiles\/([^\/]+)/);
    if (pathMatch) {
      const urlProfile = pathMatch[1].toLowerCase();
      return profileDisplayNames[urlProfile] || '';
    }
    
    // Fallback to user's assigned profile
    return userProfile || '';
  };

  // Auto-select profile when modal opens
  useEffect(() => {
    if (isOpen) {
      const currentProf = getCurrentProfile();
      if (currentProf && profiles.includes(currentProf)) {
        setFormData(prev => ({
          ...prev,
          user_profile: currentProf
        }));
      }
    }
  }, [isOpen, location.pathname, userProfile]);

  const handleInputChange = (field: keyof KnowledgeFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.author_name.trim() || !formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Author Name, Title, and Content).",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author_name: formData.author_name.trim(),
          title: formData.title.trim(),
          content: formData.content.trim(),
          user_profile: formData.user_profile || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details?.[0] || errorData.error || 'Failed to add knowledge');
      }

      const result = await response.json();

      toast({
        title: "Success!",
        description: "Your knowledge has been added successfully.",
        variant: "default"
      });

      // Reset form
      setFormData({
        author_name: '',
        title: '',
        content: '',
        user_profile: ''
      });

      setIsOpen(false);
      
      // Notify parent component
      if (onKnowledgeAdded) {
        onKnowledgeAdded();
      }

    } catch (error) {
      console.error('Error adding knowledge:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add knowledge. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
      // Reset form when closing
      setFormData({
        author_name: '',
        title: '',
        content: '',
        user_profile: ''
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <BookOpen className="h-4 w-4 mr-2" />
            Add Your Knowledge
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Share Your Knowledge
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author_name" className="text-sm font-medium">
                Author Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="author_name"
                type="text"
                placeholder="Enter your name"
                value={formData.author_name}
                onChange={(e) => handleInputChange('author_name', e.target.value)}
                disabled={isSubmitting}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_profile" className="text-sm font-medium">
                User Profile
              </Label>
              <div className="flex items-center h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                {formData.user_profile || 'No profile selected'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter a descriptive title for your knowledge"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={isSubmitting}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">
              Content <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="Share your knowledge, insights, best practices, or any valuable information..."
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              disabled={isSubmitting}
              className="min-h-[120px] resize-y"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Add Knowledge
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
