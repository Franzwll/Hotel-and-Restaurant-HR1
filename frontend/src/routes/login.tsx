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
import { toast } from "sonner";

import loginHero from "@/assets/login-hospitality.jpg";
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
      { title: "Portal Login — Oxford Suites Makati HRMS" },
      {
        name: "description",
        content:
          "Sign in to the Oxford Suites Makati HRMS portal as Super Admin, Admin, or Employee to manage recruitment, HR records, and self-service.",
      },
      { property: "og:title", content: "Portal Login — Oxford Suites Makati HRMS" },
      { property: "og:description", content: "Sign in to the Oxford Suites Makati HRMS portal." },
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

const brigades = [
  "Front Office",
  "Housekeeping",
  "Food & Beverage Service",
  "Kitchen Brigade",
  "Banquets & Events",
  "Engineering",
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

function LoginPage() {
  const navigate = useNavigate();
  const [roleId, setRoleId] = useState<(typeof roles)[number]["id"]>("employee");
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const role = roles.find((r) => r.id === roleId)!;
  const [email, setEmail] = useState(role.email);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const first = new Image();
    first.src = montageImages[0]!.src;
    const done = () => !cancelled && setReady(true);
    first.decode?.().then(done).catch(done) ?? done();
    first.onload = done;
    montageImages.slice(1).forEach((s) => {
      const img = new Image();
      img.src = s.src;
    });
    const safety = window.setTimeout(done, 1500);
    return () => {
      cancelled = true;
      window.clearTimeout(safety);
    };
  }, []);

  // Montage slideshow transition
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % montageImages.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, []);

  const pickRole = (id: (typeof roles)[number]["id"]) => {
    setRoleId(id);
    setEmail(roles.find((r) => r.id === id)!.email);
    setError("");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Property panel with omni-directional slow-motion montage edit */}
      <div className="relative hidden flex-col justify-between overflow-hidden px-12 py-10 text-primary-foreground lg:flex">
        {/* Loading veil until the first frame decodes */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 z-30 flex items-end bg-primary transition-opacity duration-700 p-12",
            ready ? "pointer-events-none opacity-0" : "opacity-100",
          )}
        >
          <div className="w-full max-w-sm space-y-4">
            <Logo tone="invert" size="lg" />
            <div className="h-px w-full overflow-hidden bg-primary-foreground/20">
              <span className="hero-progress block h-full w-1/3 bg-gold animate-pulse" />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60">
              Preparing your workspace
            </p>
          </div>
        </div>

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
        </div>
      </div>

      {/* Credential panel */}
      <div className="flex items-center justify-center bg-background px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 flex items-center gap-3 lg:hidden">
            <Logo />
          </Link>

          <p className="eyebrow">Staff Portal Access</p>
          <h2 className="mt-2 font-display text-4xl font-semibold">Sign in</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Select your post, then sign in with your work credentials.
          </p>
          <div className="gold-rule my-7" />

          <div className="grid grid-cols-3 gap-2 rounded-md border border-border bg-muted/40 p-1">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => pickRole(r.id)}
                aria-pressed={roleId === r.id}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-sm px-2 py-3 text-center transition-colors",
                  roleId === r.id
                    ? "bg-card text-foreground shadow-sm ring-1 ring-primary/25"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <r.icon className={cn("h-4 w-4", roleId === r.id ? "text-primary" : "")} />
                <span className="text-xs font-medium leading-tight">{r.short}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{role.body}</p>

          <form
            className="mt-7 space-y-5"
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
                  className="pl-9"
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
                  className="px-9"
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

            <div className="flex items-center justify-between gap-3">
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

            <Button type="submit" size="lg" className="w-full">
              Sign in as {role.label}
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-muted-foreground">
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
