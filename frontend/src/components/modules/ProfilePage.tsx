import { useRef, useState } from "react";
import { Camera, KeyRound, PencilLine, User } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { roleMeta, type Role } from "@/lib/nav";

type ProfileState = {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  employeeId: string;
  dateCreated: string;
  lastLogin: string;
  status: string;
};

const positionOptions = [
  "Super Administrator",
  "HR Administrator",
  "HR Officer",
  "Front Office Manager",
  "F&B Director",
  "Executive Housekeeper",
  "Line Cook",
  "Restaurant Server",
];

const departmentOptions = [
  "Human Resources",
  "Front Office",
  "Food & Beverage",
  "Kitchen / Culinary",
  "Housekeeping",
  "Administration / HR",
];

const seedByRole: Record<Role, ProfileState> = {
  superadmin: {
    fullName: "Bullseur Santiago",
    email: "superadmin@oxfordsuites.com.ph",
    phone: "+63 917 100 1000",
    position: "Super Administrator",
    department: "Human Resources",
    employeeId: "SA-00001",
    dateCreated: "January 12, 2024",
    lastLogin: "August 1, 2026 09:24 AM",
    status: "Active",
  },
  admin: {
    fullName: "Juan Dela Cruz",
    email: "admin@oxfordsuites.com.ph",
    phone: "+63 917 123 4567",
    position: "HR Administrator",
    department: "Human Resources",
    employeeId: "AD-00023",
    dateCreated: "February 5, 2024",
    lastLogin: "August 1, 2026 10:10 AM",
    status: "Active",
  },
  employee: {
    fullName: "Kevin Dela Cruz",
    email: "kevin.delacruz@oxfordsuites.com.ph",
    phone: "+63 921 774 9903",
    position: "Line Cook",
    department: "Kitchen / Culinary",
    employeeId: "EMP-0005",
    dateCreated: "April 15, 2026",
    lastLogin: "August 1, 2026 07:52 AM",
    status: "Active",
  },
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfilePage({ role }: { role: Role }) {
  const [profile, setProfile] = useState<ProfileState>(seedByRole[role]);
  const [draft, setDraft] = useState<ProfileState>(seedByRole[role]);
  const [editing, setEditing] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const value = editing ? draft : profile;

  function set<K extends keyof ProfileState>(key: K, v: ProfileState[K]) {
    setDraft((d) => ({ ...d, [key]: v }));
  }

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Photo must be 2MB or smaller");
      return;
    }
    setPhoto(URL.createObjectURL(file));
    toast.success("Profile photo updated");
  }

  return (
    <div>
      <PageHeader
        eyebrow={roleMeta[role].label}
        title="My Profile"
        description="Your account details, contact information and login activity."
      />

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Identity card */}
        <Card className="border-border/70">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="relative">
              <Avatar className="h-36 w-36 border border-border">
                {photo ? <AvatarImage src={photo} alt={value.fullName} /> : null}
                <AvatarFallback className="bg-muted font-display text-4xl text-primary">
                  {initialsOf(value.fullName)}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                aria-label="Change profile photo"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-2 right-2 grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-primary shadow-sm transition-colors hover:bg-accent"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <h2 className="mt-5 font-display text-2xl font-semibold">{value.fullName}</h2>
            <p className="text-sm text-muted-foreground">{value.position}</p>

            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={onPickPhoto}
            />
            <Button className="mt-4 w-full" onClick={() => fileRef.current?.click()}>
              <Camera className="mr-2 h-4 w-4" />
              Change Photo
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">JPG, PNG (Max. 2MB)</p>

            {role !== "superadmin" ? (
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => toast.info("Password change is available in Settings")}
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Change Password
              </Button>
            ) : null}
          </CardContent>
        </Card>

        {/* Details */}
        <div className="space-y-6">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </span>
                <h3 className="font-display text-xl font-semibold">Profile Information</h3>
              </div>

              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Personal Details
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="p-name">Full Name</Label>
                  <Input
                    id="p-name"
                    value={value.fullName}
                    disabled={!editing}
                    onChange={(e) => set("fullName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-position">Position</Label>
                  <Select
                    value={value.position}
                    disabled={!editing}
                    onValueChange={(v) => set("position", v)}
                  >
                    <SelectTrigger id="p-position">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {positionOptions.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-email">Email Address</Label>
                  <Input
                    id="p-email"
                    type="email"
                    value={value.email}
                    disabled={!editing}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
                {role !== "superadmin" && (
                  <div className="space-y-2">
                    <Label htmlFor="p-dept">Department</Label>
                    <Select
                      value={value.department}
                      disabled={!editing}
                      onValueChange={(v) => set("department", v)}
                    >
                      <SelectTrigger id="p-dept">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentOptions.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="p-phone">Contact Number</Label>
                  <Input
                    id="p-phone"
                    value={value.phone}
                    disabled={!editing}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </div>
              </div>

              <p className="mt-8 border-t border-border/60 pt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Account Details
              </p>

              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="p-id">Employee ID</Label>
                  <Input id="p-id" value={value.employeeId} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-login">Last Login</Label>
                  <Input id="p-login" value={value.lastLogin} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-created">Date Created</Label>
                  <Input id="p-created" value={value.dateCreated} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div>
                    <Badge
                      className="bg-success/15 text-success border-success/30"
                      variant="outline"
                    >
                      {value.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                {editing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDraft(profile);
                        setEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        setProfile(draft);
                        setEditing(false);
                        toast.success("Profile updated");
                      }}
                    >
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      setDraft(profile);
                      setEditing(true);
                    }}
                  >
                    <PencilLine className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
