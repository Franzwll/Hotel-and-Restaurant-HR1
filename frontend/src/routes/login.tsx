import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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

const roles = [
  {
    id: "superadmin" as const,
    label: "Super Admin",
    short: "Super Admin",
    icon: ShieldCheck,
    email: "superadmin@oxfordsuites.com.ph",
    body: "Property-wide control of hotel and restaurant operations.",
    to: "/superadmin",
  },
  {
    id: "admin" as const,
    label: "HR Admin",
    short: "HR Admin",
    icon: UserCog,
    email: "hr.admin@oxfordsuites.com.ph",
    body: "Recruitment, onboarding, 201 files and HR operations.",
    to: "/admin",
  },
  {
    id: "employee" as const,
    label: "Team Member",
    short: "Team Member",
    icon: ConciergeBell,
    email: "maria.santos@oxfordsuites.com.ph",
    body: "Front office, housekeeping, kitchen and service crew self-service.",
    to: "/employee",
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

function LoginPage() {
  const navigate = useNavigate();
  const [roleId, setRoleId] = useState<(typeof roles)[number]["id"]>("admin");
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const role = roles.find((r) => r.id === roleId)!;
  const [email, setEmail] = useState(role.email);

  const pickRole = (id: (typeof roles)[number]["id"]) => {
    setRoleId(id);
    setEmail(roles.find((r) => r.id === id)!.email);
    setError("");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Property panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden px-12 py-10 text-primary-foreground lg:flex">
        <img
          src={loginHero}
          alt="Oxford Suites Makati lobby opening into the fine-dining restaurant at dusk"
          width={1024}
          height={1536}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/75 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/35 to-foreground/55" />

        <div className="relative flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Logo tone="invert" />
          </Link>
          <span className="rounded-full border border-primary-foreground/30 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary-foreground/80">
            Est. Makati City
          </span>
        </div>

        <div className="relative max-w-lg">
          <p className="eyebrow text-gold">Hotel &amp; Restaurant Human Resource System</p>
          <div className="mt-4 h-px w-16 bg-gold/70" />
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.08]">
            The house is ready.
            <br />
            Welcome back to duty.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-primary-foreground/85">
            One portal for the entire property — from the front desk and housekeeping floors to the
            kitchen brigade and banquet service. Hiring, 201 files, schedules and employee
            self-service, kept in a single register.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-primary-foreground/80">
            {brigades.map((b) => (
              <span key={b} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-gold" />
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-between border-t border-primary-foreground/20 pt-5 text-xs text-primary-foreground/70">
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
              setError("");
              toast.success(`Welcome back — signed in as ${role.label}`);
              navigate({ to: role.to });
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
                  placeholder="you@oxfordsuites.com.ph"
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

          <div className="mt-8 space-y-2 border-t border-border pt-5">
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
              Access is role-based and every action is written to the system audit log.
            </p>
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
              No account yet? Ask the HR office at the 2nd floor admin desk to create one.
            </p>
          </div>

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
