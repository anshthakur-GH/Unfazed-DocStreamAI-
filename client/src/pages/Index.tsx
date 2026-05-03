import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/layout/HeroSection";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { LatestNewsSection } from "@/components/layout/LatestNewsSection";
import { useSearch } from "@/contexts/SearchContext";
import { BookOpen, FileText, Layout, Search } from "lucide-react";

const Index = () => {
  const { searchTerm } = useSearch();
  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans overflow-hidden">

      {/* Persistent Subtle Dashboard Watermark */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center -z-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
          UNFAZED AI
        </h1>
      </div>

      <Navbar />
      <div className="relative z-10 w-full h-full pb-12 pt-28">
        <HeroSection />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          <LatestNewsSection title="Latest Alerts" />

          {/* Categorized Document Sections or Search Results */}
          <div className="space-y-8">
            {searchTerm ? (
              <section>
                <div className="flex items-center space-x-3 mb-6 border-b border-blue-500/10 pb-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Search className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Search Results</h2>
                    <p className="text-sm text-slate-500 font-medium">Displaying all documents matching "{searchTerm}"</p>
                  </div>
                </div>
                <DocumentTable showControls={true} hideHeading={true} />
              </section>
            ) : (
              <>
                {/* Lecture Notes Section */}
                <section>
                  <div className="flex items-center space-x-3 mb-6 border-b border-blue-500/10 pb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Lecture Notes</h2>
                      <p className="text-sm text-slate-500 font-medium">Access your curated academic study materials</p>
                    </div>
                  </div>
                  <DocumentTable documentTypeFilter="Lecture Notes" hideHeading={true} showControls={false} />
                </section>

                {/* Research Papers Section */}
                <section>
                  <div className="flex items-center space-x-3 mb-6 border-b border-blue-500/10 pb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Research Papers</h2>
                      <p className="text-sm text-slate-500 font-medium">Explore the latest research and publications</p>
                    </div>
                  </div>
                  <DocumentTable documentTypeFilter="Research Paper" hideHeading={true} showControls={false} />
                </section>

                {/* Other Documents Section */}
                <section>
                  <div className="flex items-center space-x-3 mb-6 border-b border-blue-500/10 pb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Layout className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Policy & Other Documents</h2>
                      <p className="text-sm text-slate-500 font-medium">Official institutional documents and resources</p>
                    </div>
                  </div>
                  <DocumentTable documentTypeFilter="Policy Document" hideHeading={true} showControls={false} />
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
