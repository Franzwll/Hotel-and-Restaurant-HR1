import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ConciergeBell,
  Eye,
  EyeOff,
  HelpCircle,
  Lock,
  Mail,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ConciergeBell, Eye, EyeOff, Lock, Mail, ShieldCheck, UserCog } from "lucide-react";
import { toast } from "sonner";

import slide1 from "@/assets/oxford-suite-makati-interior2.png";
import slide2 from "@/assets/o-suiteb.png";
import slide3 from "@/assets/oxford-suite-makati-interior3b.png";
import slide4 from "@/assets/o-suite(1)b.png";
import slide5 from "@/assets/o-suite(2)b.png";
import slide6 from "@/assets/oxford-suite-makati-interior1.png";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { systemUsers } from "@/data/users";
import { newHires } from "@/data/hr";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Oxford Suites Makati — Enterprise Portal" },
      {
        name: "description",
        content:
          "Secure access to the Oxford Suites Makati hotel and restaurant management platform — HR, finance, hotel, restaurant, and back-office operations.",
      },
      { property: "og:title", content: "Oxford Suites Makati — Enterprise Portal" },
      {
        property: "og:description",
        content:
          "Secure access to the Oxford Suites Makati hotel and restaurant management platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),

  component: LoginPage,
});

// Order: Employee → HR Admin → Super Admin (Super Admin last as requested)
const roles = [
  {
    id: "employee" as const,
    label: "Employee",
    short: "Employee",
    icon: ConciergeBell,
    email: "maria.santos@email.com",
    body: "Front office, housekeeping, kitchen and service crew self-service.",
    to: "/employee",
  },
  {
    id: "admin" as const,
    label: "HR Admin",
    short: "HR Admin",
    icon: UserCog,
    email: "hr.admin@email.com",
    body: "Recruitment, onboarding, 201 files and HR operations.",
    to: "/admin",
  },
  {
    id: "superadmin" as const,
    label: "Super Admin",
    short: "Super Admin",
    icon: ShieldCheck,
    email: "superadmin@email.com",
    body: "Property-wide control of hotel and restaurant operations.",
    to: "/superadmin",
  },
];

const facts = [
  { k: "Client", v: "Oxford Suites Makati" },
  { k: "Industry", v: "Hotel & Restaurant" },
  { k: "Platform", v: "Enterprise Operations" },
];

/** Cinematic loop frames for the login hero panel. */
const slides = [
  { src: slide1, alt: "Oxford Suites Makati lobby with marble compass flooring", pan: "kb-a" },
  { src: slide2, alt: "Oxford Suites Makati front desk and reception lounge", pan: "kb-b" },
  { src: slide3, alt: "Oxford Suites Makati restaurant and bar", pan: "kb-c" },
  { src: slide4, alt: "The O Suite living area with spiral staircase", pan: "kb-b" },
  { src: slide5, alt: "Junior suite with king bed and lounge seating", pan: "kb-a" },
  { src: slide6, alt: "Deluxe twin room with work desk", pan: "kb-c" },
];

import loginLobby from "@/assets/login-lobby.png";
import loginDining from "@/assets/login-dining.jpg";

const montageImages = [
  {
    src: loginLobby,
    alt: "Oxford Suites Makati grand circular lobby with ceiling light, sunburst marble floor and dark wood front desk",
    animation: "animate-[kenburns-1_20s_infinite_alternate_ease-in-out]",
  },
  {
    src: loginDining,
    alt: "Oxford Suites Makati luxury fine dining restaurant at dusk with crystal chandeliers",
    animation: "animate-[kenburns-2_20s_infinite_alternate_ease-in-out]",
  },
  {
    src: loginHero,
    alt: "Oxford Suites Makati hospitality floor view",
    animation: "animate-[kenburns-3_20s_infinite_alternate_ease-in-out]",
  },
];
const SLIDE_MS = 6500;

/** Advances the hero slideshow once the first frame has decoded. */
function useHeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cancelled = false;
    const first = new Image();
    first.src = slides[0]!.src;
    const done = () => !cancelled && setReady(true);
    first.decode?.().then(done).catch(done) ?? done();
    first.onload = done;
    // Warm the remaining frames in the background.
    slides.slice(1).forEach((s) => {
      const img = new Image();
      img.src = s.src;
    });
    const safety = window.setTimeout(done, 2500);
    return () => {
      cancelled = true;
      window.clearTimeout(safety);
    };
  }, []);

  useEffect(() => {
    if (!ready || reduced.current) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [ready]);

  return { index, setIndex, ready, reduced: reduced.current };
}

function LoginPage() {
  const navigate = useNavigate();
  const [roleId, setRoleId] = useState<(typeof roles)[number]["id"]>("employee");
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const role = roles.find((r) => r.id === roleId)!;
  const [email, setEmail] = useState(role.email);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Montage slideshow transition
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % montageImages.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, []);
  const { index, setIndex, ready } = useHeroSlideshow();
  const reveal = useMemo(
    () => (step: number) => ({
      animation: "fade-in 0.7s ease-out both",
      animationDelay: `${step * 110}ms`,
    }),
    [],
  );

  const pickRole = (id: (typeof roles)[number]["id"]) => {
    setRoleId(id);
    setEmail(roles.find((r) => r.id === id)!.email);
    setError("");
  };


  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Property panel with omni-directional slow-motion montage edit */}
      <div className="relative hidden flex-col justify-between overflow-hidden px-12 py-10 text-primary-foreground lg:flex">
        {/* Montage Slideshow Container */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {montageImages.map((img, index) => (
            <img
              key={img.src}
              src={img.src}
              alt={img.alt}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out scale-110",
                index === currentSlide ? "opacity-100" : "opacity-0",
                img.animation
              )}
            />
          ))}
        </div>

        {/* Lightened Maroon Foreshadow Background Overlay */}
        <div className="absolute inset-0 z-10 bg-primary/45 mix-blend-multiply transition-colors duration-700" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-foreground/80 via-foreground/25 to-foreground/45" />

        <div className="relative z-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Logo tone="invert" />
          </Link>
          <span className="rounded-full border border-primary-foreground/30 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary-foreground/90 backdrop-blur-sm bg-black/20">
            Est. 1995
          </span>
        </div>

        <div className="relative z-20 max-w-lg">
          <p className="eyebrow text-gold drop-shadow-md">Hotel &amp; Restaurant Human Resource System</p>
          <div className="mt-4 h-px w-16 bg-gold/70" />
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.08] drop-shadow-lg">
            The house is ready.
            <br />
            Welcome back to duty.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-primary-foreground/90 drop-shadow">
            One portal for the entire property — from the front desk and housekeeping floors to the
            kitchen brigade and banquet service. Hiring, 201 files, schedules and employee
            self-service, kept in a single register.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-primary-foreground/90">
            {brigades.map((b) => (
              <span key={b} className="flex items-center gap-2 drop-shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_6px_rgba(212,175,55,0.8)]" />
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-20 flex items-center justify-between border-t border-primary-foreground/20 pt-5 text-xs text-primary-foreground/80">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-gold" />
            Role-based access · Audited sessions
          </span>
          <span>24-hour front desk · +63 2 8888 8888</span>
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,30rem)] xl:grid-cols-[minmax(0,1.1fr)_minmax(27rem,34rem)]">
      {/* Property panel */}
      <div
        className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col"
        style={{ padding: "clamp(1.75rem, 3vw, 4rem)" }}
      >
        {/* Cinematic photo loop */}
        {slides.map((s, i) => (
          <img
            key={s.src}
            src={s.src}
            alt={i === 0 ? s.alt : ""}
            aria-hidden={i !== 0}
            loading={i === 0 ? "eager" : "lazy"}
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[1600ms] ease-in-out",
              s.pan,
              i === index ? "opacity-100" : "opacity-0",
            )}
          />
        ))}

        {/* Layered scrims: light brand tint + bottom-left depth for text contrast */}
        <div aria-hidden className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/25 to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-foreground/55 via-foreground/10 to-transparent"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 shadow-[inset_0_0_7rem_1rem_hsl(0_0%_0%/0.28)]"
        />


        {/* Loading veil until the first frame decodes */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 z-20 flex items-end bg-primary transition-opacity duration-700",
            ready ? "pointer-events-none opacity-0" : "opacity-100",
          )}
          style={{ padding: "clamp(1.75rem, 3vw, 4rem)" }}
        >
          <div className="w-full max-w-sm space-y-4">
            <Logo tone="invert" size="lg" />
            <div className="h-px w-full overflow-hidden bg-primary-foreground/20">
              <span className="hero-progress block h-full w-1/3 bg-gold" />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60">
              Preparing your workspace
            </p>
          </div>
        </div>

        <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col justify-between gap-10">
          {/* Top row */}
          <div className="flex items-start justify-between gap-6" style={reveal(0)}>
            <Link to="/" className="block">
              <Logo tone="invert" size="lg" />
            </Link>
            <span className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gold/40 bg-foreground/45 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-primary-foreground/90">
              <ShieldCheck className="h-3.5 w-3.5 text-gold" />
              Oxford Suites Makati
            </span>
          </div>

          {/* Content stack */}
          <div className="flex min-h-0 items-end justify-between gap-6">
            <div className="min-h-0 max-w-[40rem]" style={reveal(1)}>
              <span
                className="mb-5 inline-flex items-center gap-3 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-gold"
                style={reveal(1)}
              >
                <span aria-hidden className="block h-px w-10 bg-gold" />
                Hospitality Operations
              </span>

              <h1
                className="max-w-[16ch] font-display font-semibold leading-[1.05] tracking-tight drop-shadow-[0_2px_18px_hsl(0_0%_0%/0.55)]"
                style={{ fontSize: "clamp(2.1rem, 3vw, 3.5rem)", ...reveal(2) }}
              >
                Where hospitality meets excellence
              </h1>

              <p
                className="mt-5 max-w-[44ch] text-primary-foreground/80 drop-shadow-[0_1px_10px_hsl(0_0%_0%/0.5)]"
                style={{ fontSize: "clamp(0.9rem, 1vw, 1.0625rem)", ...reveal(3) }}
              >
                One secure workspace for the teams behind every room, every table and every guest
                touchpoint at Oxford Suites Makati.
              </p>

              <dl
                className="mt-9 flex flex-wrap gap-x-12 gap-y-4 border-t border-primary-foreground/25 pt-6"
                style={reveal(5)}
              >
                {facts.map((i) => (
                  <div key={i.k} className="min-w-0">
                    <dt className="text-[0.62rem] uppercase tracking-[0.18em] text-gold/90">
                      {i.k}
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium text-primary-foreground/90">
                      {i.v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>


            {/* Frame indicators */}
            <div className="flex shrink-0 items-center gap-2 self-end pb-2" style={reveal(6)}>
              {slides.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show view ${i + 1}`}
                  aria-current={i === index}
                  className="group grid h-6 place-items-center"
                >
                  <span
                    className={cn(
                      "block h-[3px] rounded-full transition-all duration-500",
                      i === index
                        ? "w-9 bg-gold"
                        : "w-4 bg-primary-foreground/40 group-hover:w-7 group-hover:bg-primary-foreground/75",
                    )}
                  />
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>


      {/* Credential panel */}
      <div className="flex min-w-0 items-center justify-center overflow-y-auto bg-background px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <div className="w-full max-w-md space-y-8">
          <Link to="/" className="flex items-center gap-3 lg:hidden">
            <Logo />
          </Link>

          <div className="space-y-2">
            <p className="eyebrow">Secure Access</p>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Sign in</h2>
            <p className="text-sm text-muted-foreground">
              Enter your Oxford Suites credentials to access your assigned workspace.
            </p>
          </div>

          <div className="gold-rule" />

          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 rounded-md border border-border bg-muted/40 p-1">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => pickRole(r.id)}
                  aria-pressed={roleId === r.id}
                  className={cn(
                    "flex min-h-[4.25rem] flex-col items-center justify-center gap-1.5 rounded-sm px-1.5 py-3 text-center transition-colors",
                    roleId === r.id
                      ? "bg-card text-foreground shadow-sm ring-1 ring-primary/25"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <r.icon className={cn("h-4 w-4 shrink-0", roleId === r.id ? "text-primary" : "")} />
                  <span className="text-[0.7rem] font-medium leading-tight sm:text-xs">
                    {r.short}
                  </span>
                </button>
              ))}
            </div>
            <p className="min-h-[2.5rem] text-xs leading-relaxed text-muted-foreground">
              {role.body}
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.includes("@")) return setError("Enter a valid work email address.");
              if (password.length < 6) return setError("Password must be at least 6 characters.");

              // Check pre-onboarding attempt
              const preOnboardingHire = newHires.find(
                (nh) => nh.email.toLowerCase() === email.toLowerCase() && nh.stage === "Pre-onboarding"
              );
              if (preOnboardingHire) {
                return setError("Account not created yet. Pre-onboarded candidates receive ESS access upon entering Probationary status.");
              }

              // Check deactivated account
              const matchingUser = systemUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
              if (matchingUser && matchingUser.status === "Disabled") {
                return setError("Account deactivated due to employee exit/separation status. Please contact HR for assistance.");
              }

              setError("");
              toast.success(`Welcome back — signed in as ${role.label}`);
              navigate({ to: "/otp", search: { role: role.to } });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="h-11 pl-9"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 px-9"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" defaultChecked />
                <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                  Keep me signed in
                </Label>
              </div>
              <button
                type="button"
                className="text-sm text-muted-foreground transition-colors hover:text-primary hover:underline"
                onClick={() => toast("Password reset link sent to the HR office.")}
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" size="lg" className="h-12 w-full">
              Sign in as {role.label}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Looking for work?{" "}
            <Link to="/jobs" className="font-medium text-primary hover:underline">
              Browse job openings
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
