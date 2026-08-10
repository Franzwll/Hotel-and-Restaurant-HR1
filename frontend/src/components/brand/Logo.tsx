import { cn } from "@/lib/utils";
import maroonMark from "@/assets/oxford-mark-maroon.png";
import whiteMark from "@/assets/oxford-mark-white.png";

const sizes = {
  sm: {
    gap: "gap-2.5",
    mark: "h-9",
    title: "text-[0.95rem] tracking-[0.14em]",
    subtitle: "text-[0.8rem] tracking-[0.3em]",
  },
  lg: {
    gap: "gap-5",
    mark: "h-[clamp(4.5rem,8vw,7rem)]",
    title: "text-[clamp(1.75rem,3.2vw,2.75rem)] tracking-[0.12em]",
    subtitle: "text-[clamp(1.15rem,2vw,1.65rem)] tracking-[0.28em]",
  },
} as const;

/**
 * Oxford Suites Makati mark + wordmark lockup.
 */
export function Logo({
  className,
  variant = "full",
  tone = "primary",
  size = "sm",
}: {
  className?: string;
  variant?: "full" | "mark";
  tone?: "primary" | "invert";
  size?: keyof typeof sizes;
}) {
  const text = tone === "invert" ? "text-sidebar-foreground" : "text-primary";
  const mark = tone === "invert" ? whiteMark : maroonMark;
  const s = sizes[size];

  return (
    <span className={cn("inline-flex items-center", s.gap, className)}>
      <img
        src={mark}
        alt=""
        aria-hidden="true"
        className={cn(s.mark, "w-auto shrink-0 object-contain")}
      />

      {variant === "full" && (
        <span className="flex flex-col leading-none">
          <span className={cn("font-display font-bold uppercase", s.title, text)}>
            Oxford Suites
          </span>
          <span
            className={cn(
              "mt-1.5 font-display font-semibold uppercase opacity-80",
              s.subtitle,
              text,
            )}
          >
            Makati
          </span>
        </span>
      )}
      <span className="sr-only">Oxford Suites Makati</span>
    </span>
  );
}
