import { useParams, Navigate, Link } from "react-router-dom";
import { useDataStats } from "@/hooks/useDocuments";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { LatestNewsSection } from "@/components/layout/LatestNewsSection";
import { Input } from "@/components/ui/input"; // Import Input component
import { Button } from "@/components/ui/button"; // Import Button component
import { Search, BookOpen, X } from 'lucide-react'; // Import Search and BookOpen icons
import { useSearch } from "@/contexts/SearchContext"; // Import useSearch hook
import { useDebounce } from "@/hooks/useDebounce"; // Import useDebounce hook
import { useState, useEffect } from "react"; // Import useState and useEffect

const departmentDisplayNames: { [key: string]: string } = {
  engineering: "Engineering",
  finance: "Finance",
  hr: "Human Resources",
  operations: "Operations",
  "legal-department": "Legal",
  procurement: "Procurement",
  "excecutive-director": "Excecutive Director",
  admin: "Admin", // Assuming 'admin' is also a department
};

function toTitleCase(value: string) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function DepartmentView() {
  const { department } = useParams();
  const { searchTerm, setSearchTerm } = useSearch(); // Use the search context
  const [currentSearchInput, setCurrentSearchInput] = useState(searchTerm); // Local state for input
  const debouncedSearchTerm = useDebounce(currentSearchInput, 300); // Debounce search input
  
  if (!department) return <Navigate to="/404" replace />;

  const rawDepartmentName = department.toLowerCase();
  const departmentName = departmentDisplayNames[rawDepartmentName] || toTitleCase(department);
  console.log("Department Name for filter:", departmentName); // Add this line
  const { data: stats, isLoading } = useDataStats();

  // Resolve count from backend stats (dynamic)
  const deptCount = stats?.departments?.find((d) => String(d._id).toLowerCase() === departmentName.toLowerCase())?.count ?? 0;

  // Update search term when debounced value changes (real-time search)
  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchTerm]);

  // Sync local input with global search term
  useEffect(() => {
    setCurrentSearchInput(searchTerm);
  }, [searchTerm]);

  const handleSearch = () => {
    setSearchTerm(currentSearchInput);
  };

  const clearSearch = () => {
    setCurrentSearchInput('');
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-background">
      <LatestNewsSection title="Latest Alerts" departmentFilter={departmentName} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter" style={{ fontFamily: 'Geist Sans, sans-serif' }}>
            {departmentName.toUpperCase()} Node
          </h1>
          <p className="text-slate-500 font-medium tracking-wide">
            {isLoading ? "Synchronizing node statistics..." : `${deptCount} institutional document${deptCount === 1 ? "" : "s"} specialized for this department.`}
          </p>
        </div>

        {/* Search Input and Knowledge Button */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="flex w-full max-w-md items-center space-x-2 relative group">
            <div className="absolute inset-0 bg-blue-600/5 blur-2xl rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity -z-10" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <Input 
              type="text" 
              placeholder="Query department node..."
              value={currentSearchInput}
              onChange={(e) => setCurrentSearchInput(e.target.value)}
              className="pl-12 bg-white/80 backdrop-blur-xl border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500/50 shadow-lg shadow-blue-900/5 rounded-xl h-12 text-base"
            />
            {currentSearchInput && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-3 h-8 w-8 p-0 hover:bg-slate-100 text-slate-400"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Link to={`/departments/${department}/knowledge`}>
            <Button 
              variant="outline"
              className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 rounded-xl h-12 px-6 flex items-center space-x-2 border-none font-bold tracking-widest uppercase text-xs"
            >
              <BookOpen className="h-4 w-4" />
              <span>Departmental Wisdom</span>
            </Button>
          </Link>
        </div>

        {/* Documents for this department */}
        <DocumentTable departmentFilter={departmentName} showControls={true} hideHeading={true} />
      </div>
    </div>
  );
}