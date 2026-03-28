import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/layout/HeroSection";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { LatestNewsSection } from "@/components/layout/LatestNewsSection";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans overflow-hidden">

      {/* Persistent Subtle Dashboard Watermark */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center -z-10">
        <h1 className="text-[25vw] font-black tracking-tighter text-slate-900/5 select-none" style={{ fontFamily: 'Geist Sans, sans-serif' }}>
          Unfazed AI
        </h1>
      </div>

      <Navbar />
      <div className="relative z-10 w-full h-full pb-12">
        <HeroSection />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          <LatestNewsSection />
          <DocumentTable />
        </div>
      </div>
    </div>
  );
};

export default Index;
