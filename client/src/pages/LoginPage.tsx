import React, { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  User, 
  Key, 
  Network, 
  Activity, 
  FileText, 
  Settings, 
  HelpCircle, 
  Dna, 
  BookOpen, 
  Hexagon 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import DocStreamAILogo from "@/assets/download.png";
import g20Logo from "@/assets/g20-logo.png";

// User-defined types are no longer needed for onLogin


const LoginPage = () => {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const { setIsAuthenticated, setUserProfile } = useAuth(); // Get auth functions
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
    if (loginId === "admin" && password === "admin") {
      setIsAuthenticated(true); 
      setUserProfile(selectedProfile); // Sync profile in context
      navigate(`/profiles/${selectedProfile}`);
    } else {
      if (loginId && password) {
        setIsAuthenticated(true);
        setUserProfile(selectedProfile); // Sync profile in context
        navigate(`/profiles/${selectedProfile}`);
      } else {
        alert("Invalid Login ID or Password");
      }
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  const layer1X = useTransform(smoothMouseX, [-0.5, 0.5], [30, -30]);
  const layer1Y = useTransform(smoothMouseY, [-0.5, 0.5], [30, -30]);
  
  const layer2X = useTransform(smoothMouseX, [-0.5, 0.5], [60, -60]);
  const layer2Y = useTransform(smoothMouseY, [-0.5, 0.5], [60, -60]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <div ref={containerRef} onMouseMove={handleMouseMove} className="min-h-screen bg-white relative overflow-hidden font-sans text-slate-800">
      
      {/* Background Graphic elements mimicking the faint code & floating icons */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Faint Text bg at bottom center */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-[0.03] select-none text-[8px] leading-tight text-center whitespace-pre-wrap font-mono [mask-image:linear-gradient(to_bottom,transparent,black)]">
          {Array(80).fill("function initializeNodes(config) {\n  const system = new GraphSystem(config);\n  system.connect([...nodes]);\n  return system.compile();\n}\n\n").join("")}
        </div>

        {/* Floating Icons Background */}
        <div className="absolute w-full h-full opacity-60 text-slate-400">
          <motion.div style={{ x: layer1X, y: layer1Y }} className="absolute inset-0">
            <motion.div animate={{ y: [0, -15, 0], rotate: [-12, -5, -12] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[25%] left-[10%]">
              <Hexagon className="w-10 h-10" />
            </motion.div>
            <motion.div animate={{ y: [0, 20, 0], rotate: [45, 55, 45] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-[65%] left-[18%]">
              <Dna className="w-12 h-12" />
            </motion.div>
            <motion.div animate={{ y: [0, -10, 0], rotate: [-6, 6, -6] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute top-[45%] left-[22%]">
              <BookOpen className="w-8 h-8" />
            </motion.div>
            <motion.div animate={{ y: [0, 8, 0], rotate: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} className="absolute top-[30%] left-[25%] opacity-40">
              <BookOpen className="w-5 h-5" />
            </motion.div>
            <motion.div animate={{ y: [0, 15, 0], rotate: [0, 20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[35%] left-[32%]">
              <Hexagon className="w-12 h-12" />
            </motion.div>
            <motion.div animate={{ y: [0, -20, 0], rotate: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-[10%] left-[28%]">
              <Network className="w-14 h-14" />
            </motion.div>
          </motion.div>

          <motion.div style={{ x: layer2X, y: layer2Y }} className="absolute inset-0">
             <motion.div animate={{ y: [0, -12, 0], rotate: [-12, 0, -12] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} className="absolute top-[25%] right-[22%]">
              <BookOpen className="w-8 h-8" />
            </motion.div>
            <motion.div animate={{ y: [0, 18, 0], rotate: [12, 25, 12] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute top-[20%] right-[10%]">
              <Network className="w-12 h-12" />
            </motion.div>
            <motion.div animate={{ y: [0, -25, 0], rotate: [-45, -30, -45] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[50%] right-[15%]">
              <Dna className="w-14 h-14" />
            </motion.div>
            <motion.div animate={{ y: [0, 15, 0], rotate: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }} className="absolute bottom-[25%] right-[20%]">
              <Hexagon className="w-8 h-8" />
            </motion.div>
            <motion.div animate={{ y: [0, -15, 0], rotate: [45, 55, 45] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-[10%] right-[12%]">
              <Network className="w-14 h-14" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Header aligned with Screenshot design */}
      <header className="relative z-20 w-full bg-white shadow-sm border-b border-slate-100 flex flex-col pt-3 px-6 h-28 rounded-b-xl mx-auto max-w-full">
        <div className="flex items-center justify-between w-full h-full relative">
          {/* Left Logos removed as requested */}
          <div className="w-16"></div>

          {/* Center Titles */}
          <div className="absolute left-1/2 -translate-x-1/2 h-full flex flex-col justify-center items-center top-0">
            <h1 className="text-xl md:text-2xl font-medium tracking-[0.2em] text-slate-800 uppercase">
              Unfazed DocStreamAI
            </h1>
          </div>

          {/* Right Header Icons */}
          <div className="flex items-center gap-4 text-slate-500 pb-4">
            <button aria-label="User Profile" className="hover:text-slate-800 transition-colors">
              <User className="w-6 h-6" />
            </button>
            <button aria-label="Help" className="hover:text-slate-800 transition-colors">
              <HelpCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md mx-auto mt-16 p-4">
        <Card className="w-full bg-white/95 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/60 rounded-xl overflow-hidden">
          <CardHeader className="text-center pt-8 pb-4">
            <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">Welcome to DocStreamAI</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="space-y-4">
              <label htmlFor="profile-select" className="text-xs font-medium text-slate-600 block mb-1">
                User Profile
              </label>
              <Select onValueChange={handleProfileSelect}>
                <SelectTrigger id="profile-select" className="w-full bg-[#E2E8F0] border-transparent text-slate-700 h-11 focus:ring-blue-500/20 focus:border-blue-500 shadow-none">
                  <SelectValue placeholder="Choose your profile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Profiles</SelectLabel>
                    <SelectItem value="Head">Head</SelectItem>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label htmlFor="loginId" className="text-xs font-medium text-slate-600 block mb-1">
                  Login ID
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="loginId"
                    type="text"
                    placeholder="Enter your Login ID"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    required
                    className="pl-10 h-11 bg-[#E2E8F0] border-transparent text-slate-800 placeholder:text-slate-500 focus:ring-blue-500/20 focus:border-blue-500 shadow-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="text-xs font-medium text-slate-600 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-11 bg-[#E2E8F0] border-transparent text-slate-800 placeholder:text-slate-500 focus:ring-blue-500/20 focus:border-blue-500 shadow-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md shadow-sm transition-colors text-sm">
                  Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Floating Status Box */}
      <div className="absolute bottom-6 right-6 z-20 bg-white/90 backdrop-blur-sm border border-slate-200/80 px-4 py-2 rounded-lg shadow-sm text-right">
        <div className="text-sm font-semibold text-slate-800">DocStreamAI</div>
        <div className="text-xs text-slate-500">
          Node Status: <span className="text-teal-500 font-medium">Online</span> | 3 Nodes
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
