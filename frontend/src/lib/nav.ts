import {
  LayoutDashboard,
  Users,
  Megaphone,
  UserCheck,
  Building2,
  FolderOpen,
  Headset,
  ShieldCheck,
  ScrollText,
  Settings,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";

export type Role = "superadmin" | "admin" | "employee";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  children?: { label: string; to: string }[];
};

export const roleMeta: Record<
  Role,
  { label: string; user: string; initials: string; base: string }
> = {
  superadmin: {
    label: "Super Admin",
    user: "Bullseur Santiago",
    initials: "BS",
    base: "/superadmin",
  },
  admin: { label: "Admin", user: "Juan Dela Cruz", initials: "JD", base: "/admin" },
  employee: { label: "Employee", user: "Kevin Dela Cruz", initials: "KD", base: "/employee" },
};

const recruitmentChildren = (base: string) => [
  { label: "Applicant Management", to: `${base}/applicants` },
  { label: "Recruitment Management", to: `${base}/recruitment` },
  { label: "New Hire Onboarding", to: `${base}/onboarding` },
];

export function navForRole(role: Role): NavItem[] {
  const base = roleMeta[role].base;

  if (role === "employee") {
    return [
      { label: "Dashboard", to: base, icon: LayoutDashboard },
      { label: "ESS", to: `${base}/ess`, icon: Headset },
      { label: "Onboarding", to: `${base}/onboarding`, icon: ClipboardCheck },
      { label: "Settings", to: `${base}/settings`, icon: Settings },
    ];
  }

  const shared: NavItem[] = [
    { label: "Dashboard", to: base, icon: LayoutDashboard },
    {

      label: "Recruitment & Onboarding",
      to: `${base}/applicants`,
      icon: Megaphone,
      children: recruitmentChildren(base),
    },
    { label: "Core HCM", to: `${base}/hcm`, icon: Building2 },
    { label: "Employee Records", to: `${base}/employees`, icon: FolderOpen },
    { label: "ESS Management", to: `${base}/ess`, icon: Headset },
  ];


  if (role === "superadmin") {
    return [
      ...shared,
      { label: "User Management", to: `${base}/users`, icon: ShieldCheck },
      { label: "Audit Logs", to: `${base}/audit`, icon: ScrollText },
      { label: "Settings", to: `${base}/settings`, icon: Settings },
    ];
  }

  return [...shared, { label: "Settings", to: `${base}/settings`, icon: Settings }];
}

export const iconRegistry = { Users, UserCheck };
