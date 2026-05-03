import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Dna, BookOpen, Network, ChevronDown } from 'lucide-react';

const AntiGravityLogin: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for parallax and card tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring physics for the tilt
  const springConfig = { damping: 25, stiffness: 200 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Transforms for the tilt effect (max tilt 10 degrees)
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-10, 10]);

  // Handle global mouse move to update coordinates (-0.5 to 0.5 normalized)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Normalize coordinates between -0.5 and 0.5 relative to the screen center
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  // Parallax transforms for background particles (moves opposite to mouse)
  const layer1X = useTransform(smoothMouseX, [-0.5, 0.5], [50, -50]);
  const layer1Y = useTransform(smoothMouseY, [-0.5, 0.5], [50, -50]);
  
  const layer2X = useTransform(smoothMouseX, [-0.5, 0.5], [100, -100]);
  const layer2Y = useTransform(smoothMouseY, [-0.5, 0.5], [100, -100]);
  
  const layer3X = useTransform(smoothMouseX, [-0.5, 0.5], [20, -20]);
  const layer3Y = useTransform(smoothMouseY, [-0.5, 0.5], [20, -20]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-inter text-slate-800"
      style={{ perspective: 1200 }}
    >
      {/* Dynamic Animated Background Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e293b_0%,_transparent_70%)] opacity-60" />

      {/* Parallax Background Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Layer 1: Slow, big, distant particles */}
        <motion.div style={{ x: layer1X, y: layer1Y }} className="absolute inset-0">
          <Dna className="absolute top-[15%] left-[10%] w-24 h-24 text-blue-500/10 rotate-45" />
          <Network className="absolute top-[70%] right-[15%] w-32 h-32 text-indigo-500/10 -rotate-12" />
          <BookOpen className="absolute bottom-[10%] left-[20%] w-20 h-20 text-purple-500/10 rotate-12" />
        </motion.div>

        {/* Layer 2: Fast, small, close particles */}
        <motion.div style={{ x: layer2X, y: layer2Y }} className="absolute inset-0">
          <BookOpen className="absolute top-[25%] right-[25%] w-10 h-10 text-teal-400/20 -rotate-45" />
          <Network className="absolute top-[60%] left-[30%] w-12 h-12 text-blue-400/20 rotate-90" />
          <Dna className="absolute top-[40%] left-[60%] w-8 h-8 text-indigo-400/20 rotate-180" />
        </motion.div>

        {/* Layer 3: Occasional decorative faint particles */}
        <motion.div style={{ x: layer3X, y: layer3Y }} className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
             <motion.div 
               key={i}
               className="absolute rounded-full bg-white/5 blur-sm"
               style={{
                 width: Math.random() * 8 + 4 + 'px',
                 height: Math.random() * 8 + 4 + 'px',
                 top: Math.random() * 100 + '%',
                 left: Math.random() * 100 + '%',
               }}
               animate={{ 
                 y: [0, -20, 0],
                 opacity: [0.1, 0.3, 0.1]
               }}
               transition={{ 
                 duration: Math.random() * 5 + 3,
                 repeat: Infinity,
                 ease: "easeInOut"
               }}
             />
          ))}
        </motion.div>
      </div>

      {/* Header section spanning top */}
      <header className="absolute top-0 w-full px-8 py-6 z-20 flex flex-col">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          {/* Logo stubs since assets are local/unknown */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-8 bg-white/20 rounded backdrop-blur-sm border border-white/20 flex items-center justify-center text-xs text-white uppercase font-bold tracking-widest">
              G20
            </div>
            <div className="w-32 h-8 bg-blue-500/20 rounded backdrop-blur-sm border border-blue-500/30 flex items-center justify-center text-xs text-blue-100 font-bold">
              DocStreamAI
            </div>
          </div>
          
          <h1 className="text-white text-2xl font-light tracking-[0.2em] font-sans">
            Unfazed DocStreamAI
          </h1>
          
          <div className="text-white/70 flex items-center space-x-2 text-sm font-light">
            <Network className="w-4 h-4" />
            <span>Stats</span>
          </div>
        </div>
        
        {/* Fading 1px separator */}
        <div className="w-full h-px mt-6 bg-gradient-to-r from-transparent via-white/30 to-transparent max-w-7xl mx-auto" />
      </header>

      {/* Main Floating Card */}
      <motion.div
        drag
        dragConstraints={containerRef}
        dragElastic={0.05}
        whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        // Up and down slow oscillation
        animate={{ 
          y: [-10, 10, -10] 
        }}
        transition={{ 
          y: {
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }
        }}
        className="relative z-10 w-full max-w-[420px] rounded-3xl p-8 backdrop-blur-2xl bg-white/10 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] flex flex-col items-center mt-12 overflow-visible"
      >
        <div style={{ transform: "translateZ(40px)" }} className="text-center mb-8 pointer-events-none">
          <h2 className="text-3xl font-semibold text-white mb-2 drop-shadow-md">Welcome to DocStreamAI</h2>
          <p className="text-blue-200/80 font-light text-sm">Sign in to your account</p>
        </div>

        <form className="w-full space-y-6" style={{ transform: "translateZ(20px)" }} onSubmit={e => e.preventDefault()}>
          
          {/* Department Select */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-blue-200 uppercase tracking-wider ml-1">User Profile</label>
            <div className="relative group">
              <select className="w-full appearance-none bg-black/20 border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none transition-all duration-300 focus:bg-white/5 focus:border-blue-400/50 focus:shadow-[inset_0_0_15px_rgba(59,130,246,0.3)] hover:bg-white/5">
                <option value="" disabled selected hidden className="text-slate-500">Choose your profile</option>
                <option value="Head" className="text-slate-900">Head</option>
                <option value="Teacher" className="text-slate-900">Teacher</option>
                <option value="Student" className="text-slate-900">Student</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/70 pointer-events-none group-focus-within:text-blue-400" />
            </div>
          </div>

          {/* Login ID */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-blue-200 uppercase tracking-wider ml-1">Login ID</label>
            <input 
              type="text" 
              placeholder="Enter your Login ID"
              className="w-full bg-black/20 border border-white/10 text-white placeholder:text-white/30 text-sm rounded-xl px-4 py-3 outline-none transition-all duration-300 focus:bg-white/5 focus:border-blue-400/50 focus:shadow-[inset_0_0_15px_rgba(59,130,246,0.3)] hover:bg-white/5"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between w-full">
              <label className="text-xs font-medium text-blue-200 uppercase tracking-wider ml-1">Password</label>
            </div>
            <input 
              type="password" 
              placeholder="Enter your password"
              className="w-full bg-black/20 border border-white/10 text-white placeholder:text-white/30 text-sm rounded-xl px-4 py-3 outline-none transition-all duration-300 focus:bg-white/5 focus:border-blue-400/50 focus:shadow-[inset_0_0_15px_rgba(59,130,246,0.3)] hover:bg-white/5"
            />
          </div>

          {/* Magnetic Login Button area */}
          <div className="pt-4 h-20 w-full relative flex items-center justify-center">
            <MagneticButton>
              <button 
                type="submit"
                className="w-full max-w-[350px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl px-4 py-3.5 shadow-lg shadow-blue-500/25 transition-all outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Login
              </button>
            </MagneticButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Advanced Magnetic Button Component using framer-motion
function MagneticButton({ children }: { children: React.ReactElement }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    
    // Calculate distance from center of the button
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    
    // Provide a pull factor (lower implies harder pull)
    // 30px distance logic happens here based on hovering the wrapper
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;
  
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      // Extended padding area to create the 30px "magnetic field" before actual button
      className="w-full p-4 absolute -inset-4 flex items-center justify-center cursor-pointer"
    >
      {children}
    </motion.div>
  );
}

export default AntiGravityLogin;
