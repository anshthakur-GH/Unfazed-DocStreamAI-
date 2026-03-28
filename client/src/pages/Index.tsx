import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/layout/HeroSection";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { LatestNewsSection } from "@/components/layout/LatestNewsSection";
import { BookOpen, FileText, Layout } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <LatestNewsSection />
      <HeroSection />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Lecture Notes Section */}
        <section>
          <div className="flex items-center space-x-3 mb-6 border-b border-green-500/20 pb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Lecture Notes</h2>
              <p className="text-sm text-muted-foreground">Access your curated academic study materials</p>
            </div>
          </div>
          <DocumentTable documentTypeFilter="Lecture Notes" hideHeading={true} showControls={false} />
        </section>

        {/* Research Papers Section */}
        <section>
          <div className="flex items-center space-x-3 mb-6 border-b border-blue-500/20 pb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Research Papers</h2>
              <p className="text-sm text-muted-foreground">Explore the latest research and publications</p>
            </div>
          </div>
          <DocumentTable documentTypeFilter="Research Paper" hideHeading={true} showControls={false} />
        </section>

        {/* Other Documents Section */}
        <section>
          <div className="flex items-center space-x-3 mb-6 border-b border-gray-500/20 pb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Layout className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Policy & Other Documents</h2>
              <p className="text-sm text-muted-foreground">Official institutional documents and resources</p>
            </div>
          </div>
          <DocumentTable documentTypeFilter="Policy Document" hideHeading={true} showControls={false} />
        </section>
      </div>
    </div>
  );
};

export default Index;
