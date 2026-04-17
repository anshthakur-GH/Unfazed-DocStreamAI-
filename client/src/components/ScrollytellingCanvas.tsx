import React, { useEffect, useRef, useState } from "react";
import { useScroll, useSpring, useTransform, motion } from "framer-motion";

interface ScrollytellingCanvasProps {
  frameCount: number;
  sequencePath: string; // e.g., "/sequence/frame_"
  extension: string; // e.g., ".webp"
}

export const ScrollytellingCanvas: React.FC<ScrollytellingCanvasProps> = ({
  frameCount,
  sequencePath,
  extension,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Preload images
  useEffect(() => {
    let isMounted = true;
    const loadSequence = async () => {
      const loadedImages: HTMLImageElement[] = [];
      const promises = Array.from({ length: frameCount }).map((_, i) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.src = `${sequencePath}${i}${extension}`;
          img.onload = () => {
            if (isMounted) {
              loadedImages[i] = img;
              setLoadedCount((prev) => prev + 1);
            }
            resolve();
          };
          img.onerror = () => {
            if (isMounted) {
              loadedImages[i] = img; // push placeholder/null equivalent or empty image
            }
            resolve();
          };
        });
      });
      await Promise.all(promises);
      if (isMounted) {
        setImages(loadedImages);
        setIsReady(true);
      }
    };
    loadSequence();
    
    return () => { isMounted = false; };
  }, [frameCount, sequencePath, extension]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const frameIndex = useTransform(smoothProgress, [0, 1], [0, frameCount - 1]);
  const indicatorOpacity = useTransform(smoothProgress, [0, 0.05], [1, 0]);

  useEffect(() => {
    if (!isReady || images.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw frame function
    const render = () => {
      const currentFrame = Math.min(
        frameCount - 1,
        Math.max(0, Math.floor(frameIndex.get()))
      );
      
      const img = images[currentFrame];
      if (img && img.complete && img.naturalWidth > 0) {
        // Handle "contain" scaling logic to ensure seamless background fill
        const containerWidth = canvas.clientWidth;
        const containerHeight = canvas.clientHeight;
        
        // Update true canvas resolution to match display size for max sharpness
        canvas.width = containerWidth * window.devicePixelRatio;
        canvas.height = containerHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const imgRatio = img.width / img.height;
        const canvasRatio = containerWidth / containerHeight;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (imgRatio > canvasRatio) {
          // Image is wider than canvas relative to height
          drawWidth = containerWidth;
          drawHeight = containerWidth / imgRatio;
          offsetX = 0;
          offsetY = (containerHeight - drawHeight) / 2;
        } else {
          // Image is taller than canvas relative to width
          drawHeight = containerHeight;
          drawWidth = containerHeight * imgRatio;
          offsetX = (containerWidth - drawWidth) / 2;
          offsetY = 0;
        }

        ctx.clearRect(0, 0, containerWidth, containerHeight);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
    };

    // Subscribing to framer-motion sequence changes
    const unsubscribe = frameIndex.on("change", render);
    
    // Initial draw and resize listener
    render();
    window.addEventListener("resize", render);
    
    return () => {
      unsubscribe();
      window.removeEventListener("resize", render);
    };
  }, [isReady, images, frameIndex, frameCount]);

  if (!isReady) {
    return (
      <div className="absolute inset-0 bg-[#050505] flex flex-col items-center justify-center z-0 text-white font-sans pointer-events-none">
        <div className="w-64 mb-4">
          <div className="flex justify-between text-xs text-white/50 mb-2 font-medium tracking-widest uppercase">
            <span>Loading Sequence</span>
            <span>{Math.round((loadedCount / frameCount) * 100)}%</span>
          </div>
          <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-600" 
              initial={{ width: 0 }}
              animate={{ width: `${(loadedCount / frameCount) * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-[400vh] w-full bg-[#050505]">
      {/* Sticky container for canvas */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="h-full w-full object-contain mix-blend-screen"
        />
        
        {/* Scroll indicator overlay */}
        <motion.div 
          style={{ opacity: indicatorOpacity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0 animate-pulse" />
          <span className="text-[10px] tracking-[0.3em] text-white/50 uppercase font-medium">Scroll to Reveal</span>
        </motion.div>
      </div>
    </div>
  );
};
