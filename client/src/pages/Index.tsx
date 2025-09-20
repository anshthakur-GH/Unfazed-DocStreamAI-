import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/layout/HeroSection";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { LatestNewsSection } from "@/components/layout/LatestNewsSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <LatestNewsSection />
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DocumentTable />
      </div>
    </div>
  );
};

export default Index;
