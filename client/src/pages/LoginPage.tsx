import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User as UserIcon, BookOpen, Cpu, ShieldCheck, Zap } from "lucide-react";

export default function LoginPage() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const { setIsAuthenticated, setUserProfile } = useAuth();
  const navigate = useNavigate();

  const handleProfileSelect = (value: string) => {
    setSelectedProfile(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) {
      alert("Please select a profile.");
      return;
    }
    
    // Simple mock authentication
    if ((loginId === "admin" && password === "admin") || (loginId && password)) {
      setIsAuthenticated(true);
      setUserProfile(selectedProfile);
      navigate(`/profiles/${selectedProfile}`);
    } else {
      alert("Invalid Login ID or Password");
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans overflow-hidden flex flex-col items-center justify-center py-20 px-6">
      {/* Absolute Background Watermark */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
        <h1 className="text-[25vw] font-black tracking-tighter text-slate-900/[0.03] select-none">
          Unfazed AI
        </h1>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24"
      >
        {/* Left Side: Branding & Value Props */}
        <div className="flex-1 space-y-12 text-center lg:text-left">
          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none">
              Unfazed AI<br />
              <span className="text-blue-600">CORE HUB</span>
            </h1>
            <p className="text-2xl md:text-3xl text-slate-500 font-light tracking-wide max-w-2xl mx-auto lg:mx-0">
              Intelligence, unburdened.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4 text-left p-6 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl shadow-blue-900/5 group hover:bg-white/60 transition-all">
              <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">CONTEXT-AWARE</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Every research paper and policy connected in real-time within your institutional node.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-left p-6 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl shadow-blue-900/5 group hover:bg-white/60 transition-all">
              <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                <Cpu className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">FLUID LOGIC</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Proprietary liquid-cooled neural processing ensuring zero-latency extraction and analysis.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-left p-6 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl shadow-blue-900/5 group hover:bg-white/60 transition-all">
              <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">SECURE TUNNEL</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Military-grade encryption for all data flow, ensuring your research stays private.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-left p-6 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl shadow-blue-900/5 group hover:bg-white/60 transition-all">
              <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">DYNAMIC INDEXING</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Automatically categorized intelligence with instant semantic retrieval.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Access Card */}
        <motion.div variants={itemVariants} className="w-full max-w-md">
          <Card className="bg-white/70 backdrop-blur-3xl shadow-2xl shadow-blue-900/15 border border-white/80 rounded-3xl overflow-hidden">
            <CardHeader className="pt-10 pb-4 px-8 border-b border-slate-100 text-center">
              <CardTitle className="text-3xl font-black text-slate-900 tracking-tighter">
                ENTER THE STREAM
              </CardTitle>
              <p className="text-slate-500 font-medium tracking-wide mt-2">Provision your institutional node.</p>
            </CardHeader>
            <CardContent className="px-8 pb-12 pt-10 text-left">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-8">
                <p className="text-xs text-blue-700 font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  Node Status: Online
                </p>
                <p className="text-xs text-blue-600/70 font-medium">Unfazed AI is currently facilitating 2,400+ concurrent nodes.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="profile-select" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Institutional Profile</label>
                  <Select onValueChange={handleProfileSelect}>
                    <SelectTrigger id="profile-select" aria-label="Select Institutional Profile" className="w-full h-14 bg-slate-50/50 border-slate-200 text-slate-900 focus:ring-blue-500/50 focus:bg-white shadow-none rounded-xl font-medium text-base transition-all">
                      <SelectValue placeholder="Select Profile Node" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Nodes</SelectLabel>
                        <SelectItem value="Head">Head</SelectItem>
                        <SelectItem value="Teacher">Teacher</SelectItem>
                        <SelectItem value="Student">Student</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="identity-code" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Identity Code</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="identity-code"
                      type="text"
                      placeholder="Username"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      required
                      className="pl-12 h-14 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500/50 focus:bg-white shadow-none rounded-xl font-medium text-base transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="security-token" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Security Token</label>
                  <Input
                    id="security-token"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-14 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500/50 focus:bg-white shadow-none rounded-xl font-medium text-base transition-all"
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black tracking-[0.2em] uppercase rounded-xl shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden">
                    <span className="relative z-10">Initialize Node</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_2s_infinite]" />
                  </Button>
                  <p className="text-[10px] text-slate-400 text-center mt-6 font-medium tracking-wide">
                    By entering, you agree to the Institutional Data Governance Protocol.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Subtle Bottom Accent */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 opacity-20" />
    </div>
  );
}
