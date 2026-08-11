import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

export function Preloader({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setFadeOut(true), 150);
          setTimeout(() => {
            setHidden(true);
            onComplete?.();
          }, 650);
          return 100;
        }
        return prev + Math.floor(Math.random() * 18) + 12;
      });
    }, 90);

    return () => clearInterval(timer);
  }, [onComplete]);

  if (hidden) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-foreground transition-opacity duration-500",
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      {/* Subtle luxury glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.12)_0%,transparent_70%)]" />

      <div className="relative flex flex-col items-center gap-6 px-6 text-center">
        {/* Animated pulsing logo container */}
        <div className="relative animate-pulse">
          <div className="absolute -inset-4 rounded-full bg-gold/20 blur-xl animate-pulse" />
          <Logo tone="invert" className="scale-125 transform" />
        </div>

        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="eyebrow text-gold tracking-[0.25em] text-[10px]">
            HUMAN RESOURCE MANAGEMENT SYSTEM
          </p>
          <div className="h-px w-24 bg-gold/40" />
        </div>

        {/* Gold sleek loading progress bar */}
        <div className="relative mt-2 h-1 w-56 overflow-hidden rounded-full bg-muted/20">
          <div
            className="h-full bg-gradient-to-r from-gold via-amber-300 to-gold transition-all duration-200 ease-out shadow-[0_0_12px_rgba(212,175,55,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-[11px] tracking-wider text-primary-foreground/70">
          Loading workspace... {progress}%
        </p>
      </div>
    </div>
  );
}
