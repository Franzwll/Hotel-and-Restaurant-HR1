import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ConciergeBell, Eye, EyeOff, Lock, Mail, ShieldCheck, UserCog } from "lucide-react";
import { toast } from "sonner";

import loginHero from "@/assets/oxford-suite-makati-interior1.png";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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




function LoginPage() {
  const navigate = useNavigate();
  const [roleId, setRoleId] = useState<(typeof roles)[number]["id"]>("employee");
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
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,30rem)] xl:grid-cols-[minmax(0,1.1fr)_minmax(27rem,34rem)]">
      {/* Property panel */}
      <div
        className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col"
        style={{ padding: "clamp(1.75rem, 3vw, 4rem)" }}
      >
        <img
          src={loginHero}
          alt="Oxford Suites Makati lobby with marble flooring and warm lighting"
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
        />
        {/* Layered scrims: brand tint, left depth for text contrast, vignette */}
        <div aria-hidden className="absolute inset-0 bg-primary/65 mix-blend-multiply" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-tr from-foreground/85 via-foreground/40 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 shadow-[inset_0_0_9rem_2rem_hsl(0_0%_0%/0.45)]"
        />

        <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col justify-between gap-10">
          {/* Top row */}
          <div className="flex items-start justify-between gap-6">
            <Link to="/" className="block">
              <Logo tone="invert" size="lg" />
            </Link>
            <span className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary-foreground/25 bg-foreground/25 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-primary-foreground/85 backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-gold" />
              Oxford Suites Makati
            </span>
          </div>

          {/* Bottom stack — single left alignment axis */}
          <div className="flex min-h-0 max-w-[40rem] flex-col gap-7">
            <span aria-hidden className="block h-px w-16 bg-gold" />

            <h1
              className="max-w-[18ch] font-display font-semibold leading-[1.1] tracking-tight"
              style={{ fontSize: "clamp(2rem, 2.8vw, 3.25rem)" }}
            >
              Welcome to Oxford Suites Makati
            </h1>

            <h2
              className="-mt-4 max-w-[26ch] font-display font-medium leading-[1.2] tracking-tight text-primary-foreground/90"
              style={{ fontSize: "clamp(1.25rem, 1.6vw, 1.75rem)" }}
            >
              Where hospitality meets excellence
            </h2>

            <p
              className="max-w-[54ch] text-primary-foreground/80"
              style={{ fontSize: "clamp(0.875rem, 1vw, 1rem)" }}
            >
              This platform supports the Oxford Suites Makati team in delivering thoughtful,
              seamless service across every guest touchpoint — from hotel rooms and restaurant
              tables to the operations that keep everything running behind the scenes.
            </p>

            <blockquote className="border-l-2 border-gold pl-5 pt-1 text-primary-foreground/85">
              <p className="text-sm font-medium italic leading-relaxed">
                "Great service starts with a team that is organized, supported, and empowered."
              </p>
            </blockquote>

            <dl className="flex flex-wrap gap-x-10 gap-y-4 border-t border-primary-foreground/20 pt-6">
              {facts.map((i) => (
                <div key={i.k} className="min-w-0">
                  <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-primary-foreground/60">
                    {i.k}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-primary-foreground/90">{i.v}</dd>
                </div>
              ))}
            </dl>
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
