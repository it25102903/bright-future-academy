import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Cpu, Radio, ChevronDown } from 'lucide-react';

const TOTAL_FRAMES = 240;

export const CinematicHero: React.FC<{ onExploreClick?: () => void; onLoginClick?: () => void }> = ({
  onExploreClick,
  onLoginClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const loadingSetRef = useRef<Set<number>>(new Set());
  const [isInitialReady, setIsInitialReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [displayFrame, setDisplayFrame] = useState(1);
  const currentFrameRef = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  const getFrameUrl = useCallback((index: number) => {
    const frameNum = String(index + 1).padStart(3, '0');
    return `/hero-frames/${frameNum}.png`;
  }, []);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Single image loader with deduplication
  const loadSingleFrame = useCallback((index: number): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));
      if (imagesRef.current[clamped]) {
        return resolve(imagesRef.current[clamped]!);
      }
      if (loadingSetRef.current.has(clamped)) {
        // Already inflight, poll briefly
        const interval = setInterval(() => {
          if (imagesRef.current[clamped]) {
            clearInterval(interval);
            resolve(imagesRef.current[clamped]!);
          }
        }, 30);
        return;
      }

      loadingSetRef.current.add(clamped);
      const img = new Image();
      img.src = getFrameUrl(clamped);
      img.onload = () => {
        imagesRef.current[clamped] = img;
        loadingSetRef.current.delete(clamped);
        resolve(img);
      };
      img.onerror = () => {
        loadingSetRef.current.delete(clamped);
        resolve(img);
      };
    });
  }, [getFrameUrl]);

  // Draw frame on canvas with aspect ratio cover and fallback search
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clampedIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(frameIndex)));
    let img = imagesRef.current[clampedIndex];

    // If target frame is not loaded yet, find the closest loaded frame in the ENTIRE array
    if (!img || !img.complete || img.naturalWidth === 0) {
      let closestImg: HTMLImageElement | null = null;
      let closestDist = Infinity;
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const candidate = imagesRef.current[i];
        if (candidate && candidate.complete && candidate.naturalWidth > 0) {
          const dist = Math.abs(i - clampedIndex);
          if (dist < closestDist) {
            closestDist = dist;
            closestImg = candidate;
          }
        }
      }
      img = closestImg;

      // Also trigger urgent on-demand load for target frame and neighboring frames
      loadSingleFrame(clampedIndex).then((loaded) => {
        if (currentFrameRef.current === clampedIndex && canvasRef.current) {
          drawFrame(clampedIndex);
        }
      });
      // Pre-warm neighbors
      if (clampedIndex > 0) loadSingleFrame(clampedIndex - 1);
      if (clampedIndex < TOTAL_FRAMES - 1) loadSingleFrame(clampedIndex + 1);
    }

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const hRatio = canvas.width / img.naturalWidth;
      const vRatio = canvas.height / img.naturalHeight;
      const ratio = Math.max(hRatio, vRatio);

      const centerShiftX = (canvas.width - img.naturalWidth * ratio) / 2;
      const centerShiftY = (canvas.height - img.naturalHeight * ratio) / 2;

      ctx.drawImage(
        img,
        0,
        0,
        img.naturalWidth,
        img.naturalHeight,
        centerShiftX,
        centerShiftY,
        img.naturalWidth * ratio,
        img.naturalHeight * ratio
      );
    }
  }, [loadSingleFrame]);

  // Responsive canvas resizing with DPR scaling
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }

    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // High-performance streaming: Keyframes first across timeline, then bulk stream
  useEffect(() => {
    let isCancelled = false;

    const startStreaming = async () => {
      // 1. Instant priority: Frame 0 (first view)
      await loadSingleFrame(0);
      if (isCancelled) return;
      setIsInitialReady(true);
      drawFrame(0);

      // 2. Fast Keyframes across entire animation (every 10th frame: 0, 10, 20, ... 239)
      const keyframeIndices = [];
      for (let i = 0; i < TOTAL_FRAMES; i += 10) {
        keyframeIndices.push(i);
      }
      keyframeIndices.push(TOTAL_FRAMES - 1);

      await Promise.all(keyframeIndices.map((idx) => loadSingleFrame(idx)));
      if (isCancelled) return;

      // 3. Progressive bulk fill for all remaining intermediate frames in parallel chunks of 16
      const remainingIndices = [];
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        if (!imagesRef.current[i]) {
          remainingIndices.push(i);
        }
      }

      const chunkSize = 16;
      for (let i = 0; i < remainingIndices.length; i += chunkSize) {
        if (isCancelled) return;
        const chunk = remainingIndices.slice(i, i + chunkSize);
        await Promise.all(chunk.map((idx) => loadSingleFrame(idx)));
      }
    };

    startStreaming();

    return () => {
      isCancelled = true;
    };
  }, [drawFrame, loadSingleFrame]);

  // Scroll listener with calibrated scrub progress mapping
  useEffect(() => {
    if (reducedMotion) return;

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const maxScrollDistance = rect.height - window.innerHeight;
      if (maxScrollDistance <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / maxScrollDistance));
      const targetFrame = Math.floor(progress * (TOTAL_FRAMES - 1));

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      animationFrameId.current = requestAnimationFrame(() => {
        setScrollProgress(progress);
        setDisplayFrame(targetFrame + 1);
        currentFrameRef.current = targetFrame;
        drawFrame(targetFrame);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [drawFrame, reducedMotion]);

  // Dynamic stage title based on scrub progress
  const getStageTitle = (progress: number) => {
    if (progress < 0.28) return 'Integrated Academy Workspace';
    if (progress < 0.58) return 'Holographic NFC & Attendance Matrix';
    if (progress < 0.85) return 'Smart Timetable & Ledger Reconciliation';
    return 'Live Executive Cloud Portal';
  };

  // Phase opacities and transformations
  const heroCardOpacity = Math.max(0, 1 - scrollProgress / 0.18);
  const heroCardTranslateY = -scrollProgress * 140;
  const heroCardScale = Math.max(0.92, 1 - scrollProgress * 0.1);

  const hudOpacity = scrollProgress > 0.08 && scrollProgress < 0.94 ? 1 : 0;
  const finaleOpacity = scrollProgress >= 0.84 ? Math.min(1, (scrollProgress - 0.84) / 0.12) : 0;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        height: reducedMotion ? '100vh' : '300vh',
        width: '100%',
        background: 'var(--hero-bg)',
      }}
    >
      {/* Sticky Cinematic Viewport Stage */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Ambient atmospheric glows */}
        <div
          className="ambient-glow"
          style={{
            top: '8%',
            left: '12%',
            background: 'radial-gradient(circle, var(--hero-glow-primary) 0%, transparent 70%)',
            opacity: 0.9,
          }}
        />
        <div
          className="ambient-glow"
          style={{
            bottom: '8%',
            right: '10%',
            background: 'radial-gradient(circle, var(--hero-glow-accent) 0%, transparent 70%)',
            opacity: 0.85,
          }}
        />

        {/* HTML5 Canvas for the 240 Cinematic Animation Frames */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isInitialReady ? 0.96 : 0.25,
            transition: 'opacity 0.4s ease',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Theme-Reactive Adaptive Vignette Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--hero-vignette)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />

        {/* PHASE 1: Primary Hero Content housed in Liquid Glass Card */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, calc(-50% + ${reducedMotion ? 0 : heroCardTranslateY}px)) scale(${
              reducedMotion ? 1 : heroCardScale
            })`,
            zIndex: 10,
            maxWidth: '1040px',
            width: '92%',
            opacity: reducedMotion ? 1 : heroCardOpacity,
            display: !reducedMotion && heroCardOpacity <= 0 ? 'none' : 'block',
            pointerEvents: heroCardOpacity > 0.05 ? 'auto' : 'none',
            textAlign: 'center',
            transition: 'opacity 0.15s ease-out',
          }}
        >
          <div
            className="liquid-glass-hero"
            style={{
              padding: 'clamp(1.75rem, 4vw, 3.25rem) clamp(1.25rem, 3vw, 2.5rem)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
            }}
          >
            {/* Top Institutional Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 1.15rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--hero-badge-bg)',
                border: '1px solid var(--hero-badge-border)',
                color: 'var(--hero-badge-text)',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                boxShadow: '0 2px 10px rgba(99, 102, 241, 0.15)',
              }}
            >
              <Sparkles size={15} color="currentColor" />
              <span>Intelligent Academic ERP • Hardware NFC Engine</span>
            </div>

            {/* Hero Main Headline */}
            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5.2vw, 4.4rem)',
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: '-0.035em',
                maxWidth: '880px',
                color: 'var(--hero-text-primary)',
              }}
            >
              Empowering Next-Generation{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                }}
              >
                Academic Excellence
              </span>
            </h1>

            {/* Supporting Subtitle with guaranteed contrast */}
            <p
              style={{
                fontSize: 'clamp(1.025rem, 1.6vw, 1.225rem)',
                color: 'var(--hero-text-secondary)',
                maxWidth: '720px',
                lineHeight: 1.65,
                fontWeight: 450,
              }}
            >
              Bright Future Academy orchestrates unified campus operations: seamless NFC contact
              attendance, dynamic conflict-free timetable scheduling, automated fee reconciliation,
              and dedicated portals across all 5 institutional roles.
            </p>

            {/* Action CTA Buttons */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                justifyContent: 'center',
                marginTop: '0.5rem',
              }}
            >
              <button
                onClick={onLoginClick}
                className="btn btn-primary btn-lg"
                style={{
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  fontWeight: 700,
                }}
              >
                <span>Access Institute Portal</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={onExploreClick}
                className="btn btn-lg"
                style={{
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--hero-btn-secondary-bg)',
                  border: '1px solid var(--hero-btn-secondary-border)',
                  color: 'var(--hero-btn-secondary-text)',
                  backdropFilter: 'blur(12px)',
                  fontWeight: 600,
                }}
              >
                <span>Explore Platform Capabilities</span>
              </button>
            </div>

            {/* Floating Highlights Inside Liquid Glass */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                marginTop: '0.75rem',
              }}
            >
              <div className="liquid-glass-pill">
                <ShieldCheck size={16} color="var(--success-text)" />
                <span>Zero-Trust 5-Role Security</span>
              </div>
              <div className="liquid-glass-pill">
                <Cpu size={16} color="var(--accent-cyan)" />
                <span>Hardware NFC Arrival Verification</span>
              </div>
              <div className="liquid-glass-pill">
                <Radio size={16} color="var(--primary-400)" />
                <span>Real-Time Database Persistence</span>
              </div>
            </div>

            {/* Scroll Scrub Cue Indicator */}
            {!reducedMotion && (
              <div
                style={{
                  marginTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--hero-text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                <span>Scroll down to scrub 240-frame interactive animation</span>
                <ChevronDown size={14} className="animate-bounce" />
              </div>
            )}
          </div>
        </div>

        {/* PHASE 2: Live HUD Scrub Indicator (Unobstructed Animation View) */}
        {!reducedMotion && (
          <div
            style={{
              position: 'absolute',
              bottom: '2.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20,
              opacity: hudOpacity,
              display: hudOpacity <= 0 ? 'none' : 'flex',
              transition: 'opacity 0.25s ease',
              pointerEvents: 'none',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.65rem',
              width: '90%',
              maxWidth: '460px',
            }}
          >
            <div
              className="liquid-glass-pill"
              style={{
                padding: '0.55rem 1.35rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--hero-text-primary)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
              }}
            >
              <Sparkles size={14} color="var(--accent-cyan)" />
              <span>
                Frame {displayFrame} / {TOTAL_FRAMES} • {getStageTitle(scrollProgress)}
              </span>
            </div>

            {/* Progress Scrubber Track */}
            <div
              style={{
                width: '100%',
                height: '4px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.2)',
                overflow: 'hidden',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(scrollProgress * 100).toFixed(1)}%`,
                  background: 'linear-gradient(90deg, #6366f1, #06b6d4, #10b981)',
                  borderRadius: '4px',
                  transition: 'width 0.05s linear',
                }}
              />
            </div>
          </div>
        )}

        {/* PHASE 3: Finale Handoff Card (Frames 190 - 240) leading into Features */}
        {!reducedMotion && (
          <div
            style={{
              position: 'absolute',
              bottom: '3rem',
              left: '50%',
              transform: `translateX(-50%) translateY(${(1 - finaleOpacity) * 20}px)`,
              zIndex: 25,
              opacity: finaleOpacity,
              display: finaleOpacity <= 0 ? 'none' : 'block',
              transition: 'opacity 0.25s ease, transform 0.25s ease',
              pointerEvents: finaleOpacity > 0.4 ? 'auto' : 'none',
              width: '90%',
              maxWidth: '780px',
            }}
          >
            <div
              className="liquid-glass-hero"
              style={{
                padding: '1.25rem 1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--primary-400)',
                  }}
                >
                  Interactive Architecture
                </div>
                <div
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: 'var(--hero-text-primary)',
                  }}
                >
                  Live Cloud Ecosystem Ready for Deployment
                </div>
              </div>

              <button
                onClick={onExploreClick}
                className="btn btn-primary"
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '0.55rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                }}
              >
                <span>View System Capabilities</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Bottom edge blending veil so Hero melts into the Feature section */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '120px',
            background: 'linear-gradient(to bottom, transparent 0%, var(--hero-bg) 100%)',
            pointerEvents: 'none',
            zIndex: 15,
            opacity: Math.max(0, Math.min(1, (scrollProgress - 0.8) / 0.2)),
            transition: 'opacity 0.2s ease',
          }}
        />
      </div>
    </div>
  );
};
