import { Search, Mic, MicOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/contexts/SearchContext";
import { useState } from "react";
import { toast } from "sonner";

export const HeroSection = () => {
  const { searchTerm, setSearchTerm } = useSearch();
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    // Check if SpeechRecognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      setIsListening(false);
      toast.success(`Voice search initialized: "${transcript}"`);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      toast.error("Voice search failed. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      setIsListening(false);
    }
  };

  return (
    <div className="relative overflow-hidden pt-12 pb-12">
      {/* Decorative Cool Blue Ripples behind the hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">

          <p className="text-lg md:text-2xl text-slate-500 mb-12 max-w-3xl mx-auto font-light tracking-wide pt-12">
            Filter, analyze, and extract precise intelligence from your deep-storage network.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute inset-x-0 -bottom-2 h-full bg-blue-600/5 blur-3xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 -z-10" />
            <div className="relative flex items-center bg-white/80 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-xl shadow-blue-900/5 overflow-hidden transition-all duration-300 group-focus-within:border-blue-400/50 group-focus-within:shadow-2xl group-focus-within:shadow-blue-900/10">
              <div className="flex-1 relative flex items-center">
                <Search className="absolute left-6 h-6 w-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  type="text"
                  placeholder="Initialize semantic query..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-16 pr-12 py-6 h-auto text-lg md:text-xl bg-transparent border-0 text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 shadow-none outline-none font-medium w-full"
                />
              </div>
              <button
                onClick={startListening}
                disabled={isListening}
                className={`mr-4 p-3 rounded-xl transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-50 text-red-500 animate-pulse scale-110' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
                title="Voice Search"
              >
                {isListening ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
