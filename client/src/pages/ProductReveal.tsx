import React, { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ScrollytellingCanvas } from "@/components/ScrollytellingCanvas";

export default function ProductReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Calculate Opacity Maps: [start, start + 0.1, end - 0.1, end] -> [0, 1, 1, 0]
  // Beat A: 0% - 20%
  const opacityA = useTransform(scrollYProgress, [0, 0.05, 0.15, 0.20], [0, 1, 1, 0]);
  const yA = useTransform(scrollYProgress, [0, 0.05, 0.15, 0.20], [20, 0, 0, -20]);

  // Beat B: 25% - 45%
  const opacityB = useTransform(scrollYProgress, [0.25, 0.30, 0.40, 0.45], [0, 1, 1, 0]);
  const yB = useTransform(scrollYProgress, [0.25, 0.30, 0.40, 0.45], [20, 0, 0, -20]);

  // Beat C: 50% - 70%
  const opacityC = useTransform(scrollYProgress, [0.50, 0.55, 0.65, 0.70], [0, 1, 1, 0]);
  const yC = useTransform(scrollYProgress, [0.50, 0.55, 0.65, 0.70], [20, 0, 0, -20]);

  // Beat D: 75% - 95%
  const opacityD = useTransform(scrollYProgress, [0.75, 0.80, 0.90, 0.95], [0, 1, 1, 0]);
  const yD = useTransform(scrollYProgress, [0.75, 0.80, 0.90, 0.95], [20, 0, 0, -20]);

  return (
    <div ref={containerRef} className="relative bg-background min-h-screen text-foreground font-sans overflow-hidden">

      {/* Background Canvas Sequence (400vh tall) */}
      <ScrollytellingCanvas
        frameCount={120}
        sequencePath="/sequence/frame_"
        extension=".webp"
      />

      {/* Floating Text Overlays (Sticky) */}
      <div className="fixed inset-0 pointer-events-none flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-12 w-full z-10">

        {/* BEAT A: 0-20% Centered */}
        <motion.div style={{ opacity: opacityA, y: yA }} className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <h2 className="text-7xl md:text-9xl font-black tracking-tighter text-slate-900 mb-4" style={{ fontFamily: 'Geist Sans, sans-serif' }}>
            Unfazed AI
          </h2>
          <p className="text-xl md:text-3xl text-slate-600 font-light tracking-wide max-w-2xl">
            Intelligence, unburdened.
          </p>
        </motion.div>

        {/* BEAT B: 25-45% Left Aligned */}
        <motion.div style={{ opacity: opacityB, y: yB }} className="absolute inset-0 flex flex-col items-start justify-center pr-[50%]">
          <h2 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-4" style={{ fontFamily: 'Geist Sans, sans-serif' }}>
            CONTEXT-<br />AWARE
          </h2>
          <p className="text-lg md:text-2xl text-slate-500 font-light tracking-wide max-w-md">
            Every research paper, lecture, and policy connected in real-time.
          </p>
          <div className="mt-8 text-xs tracking-widest text-blue-600 uppercase font-bold px-4 py-1.5 border border-blue-200 rounded-full flex items-center gap-2 bg-blue-50/50 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Data Flow Separation
          </div>
        </motion.div>

        {/* BEAT C: 50-70% Right Aligned */}
        <motion.div style={{ opacity: opacityC, y: yC }} className="absolute inset-0 flex flex-col items-end justify-center pl-[50%] text-right">
          <h2 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-4" style={{ fontFamily: 'Geist Sans, sans-serif' }}>
            FLUID<br />LOGIC
          </h2>
          <p className="text-lg md:text-2xl text-slate-500 font-light tracking-wide max-w-md">
            Proprietary liquid-cooled neural processing for zero-latency extraction.
          </p>
          <div className="mt-8 text-xs tracking-widest text-blue-600 uppercase font-bold px-4 py-1.5 border border-blue-200 rounded-full flex items-center gap-2 bg-blue-50/50 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Liquid Flow Stabilization
          </div>
        </motion.div>

        {/* BEAT D: 75-95% Centered CTA */}
        <motion.div style={{ opacity: opacityD, y: yD }} className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8" style={{ fontFamily: 'Geist Sans, sans-serif' }}>
            ENTER THE<br />STREAM
          </h2>
          <p className="text-xl md:text-3xl text-slate-600 font-light tracking-wide mb-12">
            Login to your institutional node.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="pointer-events-auto bg-blue-600 text-white px-12 py-5 rounded-full font-bold uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
          >
            Enter Unfazed AI
          </button>
        </motion.div>

      </div>
    </div>
  );
}
