import { useState } from "react";
import {
  Bell,
  ArrowRight,
  Building2,
  Database,
  Download,
  KeyRound,
  Laptop,
  Monitor,
  Plus,
  RotateCcw,
  Search,
  Shield,
  SlidersHorizontal,
  Smartphone,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";

import { toast } from "sonner";

import { PageHeader } from "@/components/portal/PageHeader";
import { SortHead, useSort } from "@/components/portal/sortable";
import { StatCard } from "@/components/portal/StatCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  auditLogs,
  permissionGroups,
  permissionLevels,
  roleGroupMatrix,
  roleLabels,
  systemUsers,
  type PermissionGroup,
  type PermissionLevel,
  type SystemUser,
} from "@/data/users";
import { TablePagination } from "@/components/ui/table-pagination";
import { ListBody } from "@/components/portal/ListBody";
import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";
import { departments, newHires } from "@/data/hr";
import { myProfile } from "@/data/ess";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

const DEFAULT_PASSWORD = "Oxford@2026";

function generateDefaultPassword() {
  return `Oxford@${Math.floor(1000 + Math.random() * 9000)}`;
}

type ActiveSession = {
  id: string;
  user: string;
  department: string;
  position: string;
  device: string;
  browserOs: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  current?: boolean;
};

const activeSessionsSeed: ActiveSession[] = [
  {
    id: "SES-1",
    user: "Bullseur Santiago",
    department: "Administration / HR",
    position: "System Administrator",
    device: "Desktop",
    browserOs: "Chrome 126 on Windows 11",
    location: "Makati, PH",
    ipAddress: "192.168.10.4",
    lastActive: "Active now",
    current: true,
  },
  {
    id: "SES-2",
    user: "Juan Dela Cruz",
    department: "Administration / HR",
    position: "HR Officer",
    device: "Mobile",
    browserOs: "Safari 17 on iOS 17",
    location: "Makati, PH",
    ipAddress: "120.28.44.10",
    lastActive: "12 mins ago",
  },
  {
    id: "SES-3",
    user: "Ana Ramos",
    department: "Front Office",
    position: "Front Office Supervisor",
    device: "Desktop",
    browserOs: "Edge 125 on Windows 10",
    location: "Quezon City, PH",
    ipAddress: "203.177.65.2",
    lastActive: "3 hrs ago",
  },
  {
    id: "SES-4",
    user: "Kevin Dela Cruz",
    department: "Kitchen / Culinary",
    position: "Line Cook",
    device: "Mobile",
    browserOs: "Chrome 126 on Android 14",
    location: "Makati, PH",
    ipAddress: "10.0.4.88",
    lastActive: "26 mins ago",
  },
  {
    id: "SES-5",
    user: "Rosa Aquino",
    department: "Housekeeping",
    position: "Room Attendant",
    device: "Desktop",
    browserOs: "Chrome 125 on Windows 10",
    location: "Pasay, PH",
    ipAddress: "10.0.4.57",
    lastActive: "1 hr ago",
  },
];

const permissionLevelTone: Record<PermissionLevel, string> = {
  Full: "border-success/30 bg-success/15 text-success",
  Edit: "border-primary/30 bg-primary/10 text-primary",
  View: "border-border bg-muted/40 text-foreground",
  Delete: "border-destructive/30 bg-destructive/15 text-destructive",
  "Approve / Reject Only": "border-warning/40 bg-warning/20 text-warning-foreground",
  None: "border-border bg-muted/20 text-muted-foreground",
};

const backupSeed = [
  { id: "BKP-104", timestamp: "2026-07-26 03:00", size: "482 MB", type: "Automatic (Daily)" },
  { id: "BKP-103", timestamp: "2026-07-25 03:00", size: "480 MB", type: "Automatic (Daily)" },
  { id: "BKP-102", timestamp: "2026-07-24 16:22", size: "479 MB", type: "Manual" },
  { id: "BKP-101", timestamp: "2026-07-24 03:00", size: "477 MB", type: "Automatic (Daily)" },
];

export function UserManagement() {
  const [users, setUsers] = useState<SystemUser[]>(systemUsers);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editUser, setEditUser] = useState<SystemUser | null>(null);
  const [editDraft, setEditDraft] = useState<SystemUser | null>(null);

  const [resetUser, setResetUser] = useState<SystemUser | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [confirmResetPassword, setConfirmResetPassword] = useState("");
  const [pendingConfirmReset, setPendingConfirmReset] = useState(false);
  const [pendingUnsavedResetExit, setPendingUnsavedResetExit] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    role: "Employee",
    department: "",
    password: "",
  });

  const [matrix, setMatrix] =
    useState<Record<SystemUser["role"], Record<PermissionGroup, PermissionLevel>>>(roleGroupMatrix);
  const [matrixDraft, setMatrixDraft] =
    useState<Record<SystemUser["role"], Record<PermissionGroup, PermissionLevel>>>(roleGroupMatrix);
  const [isEditingMatrix, setIsEditingMatrix] = useState(false);

  const [sessions, setSessions] = useState<ActiveSession[]>(activeSessionsSeed);
  const [twoFactor, setTwoFactor] = useState(true);
  const [passwordPolicy, setPasswordPolicy] = useState("strong");
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [maxAttempts, setMaxAttempts] = useState("3");

  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const usersPage = usePagination(filteredUsers);

  const openEdit = (u: SystemUser) => {
    setEditUser(u);
    setEditDraft({ ...u });
  };
  const saveEdit = () => {
    if (!editDraft) return;
    setUsers((p) => p.map((x) => (x.id === editDraft.id ? editDraft : x)));
    toast.success(`${editDraft.username} updated`);
    setEditUser(null);
  };

  const openReset = (u: SystemUser) => {
    setResetUser(u);
    setResetPassword("");
    setConfirmResetPassword("");
  };
  const submitReset = () => {
    if (!resetUser) return;
    if (!resetPassword) {
      toast.error("Please enter a new password.");
      return;
    }
    if (resetPassword !== confirmResetPassword) {
      toast.error("Passwords do not match. Please re-enter for verification.");
      return;
    }
    toast.success(`Password reset for ${resetUser.username}`, {
      description: "New password saved and user verified.",
    });
    setResetUser(null);
    setResetPassword("");
    setConfirmResetPassword("");
  };

  const createUser = () => {
    if (!newUser.name || !newUser.username) {
      toast.error("Full name and username are required");
      return;
    }
    const id = `USR-${String(users.length + 1).padStart(3, "0")}`;
    setUsers((p) => [
      ...p,
      {
        id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role as SystemUser["role"],
        department:
          newUser.role === "Super Admin"
            ? "Administration / HR"
            : newUser.department || departments[0]?.name || "",
        status: "Active",
        lastLogin: "—",
        ipAddress: "—",
      },
    ]);
    toast.success(`${newUser.name} created`);
    setCreateOpen(false);
    setNewUser({
      name: "",
      username: "",
      email: "",
      phone: "",
      role: "Employee",
      department: "",
      password: "",
    });
  };

  const revokeSession = (id: string) => {
    const s = sessions.find((x) => x.id === id);
    setSessions((p) => p.filter((x) => x.id !== id));
    if (s) toast(`Session on ${s.device} (${s.browserOs}) revoked`);
  };

  const revokeAllOtherSessions = () => {
    setSessions((p) => p.filter((x) => x.current));
    toast.success("All other sessions were revoked");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Super Admin"
        title="User Management"
        description="System accounts, login activity, and per-module permission matrix."
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={users.length} tone="primary" />
        <StatCard
          label="Active"
          value={users.filter((u) => u.status === "Active").length}
          tone="success"
        />
        <StatCard
          label="Suspended"
          value={users.filter((u) => u.status === "Suspended").length}
          tone="caution"
        />
        <StatCard
          label="Admins"
          value={users.filter((u) => u.role !== "Employee").length}
          tone="gold"
        />
      </div>

      <Tabs defaultValue="users" className="mt-6">
        <TabsList className="inline-flex h-11 items-center justify-start rounded-xl bg-muted/80 p-1 text-muted-foreground w-fit border border-border/70 shadow-2xs">
          <TabsTrigger
            value="users"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs"
          >
            <Users className="h-4 w-4 text-primary" /> User List
          </TabsTrigger>
          <TabsTrigger
            value="matrix"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs"
          >
            <Shield className="h-4 w-4 text-primary" /> Permission Matrix
          </TabsTrigger>
          <TabsTrigger
            value="auth"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs"
          >
            <KeyRound className="h-4 w-4 text-primary" /> Authentication &amp; Login Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-display text-xl font-semibold">System Users</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {filteredUsers.length} user account{filteredUsers.length !== 1 ? "s" : ""} registered
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[14rem]">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="h-9 pl-8 text-xs bg-card shadow-2xs"
                      placeholder="Search users…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="h-9 w-40 text-xs bg-card shadow-2xs">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      {["Super Admin", "Admin", "Employee"].map((r) => (
                        <SelectItem key={r} value={r}>
                          {roleLabels[r as SystemUser["role"]]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9 w-36 text-xs bg-card shadow-2xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      {["Active", "Suspended", "Disabled"].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="mr-2 h-4 w-4" /> Create user
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="font-display text-2xl">
                          Create User Account
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Full name</Label>
                          <Input
                            value={newUser.name}
                            onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Username</Label>
                          <Input
                            value={newUser.username}
                            onChange={(e) => setNewUser((p) => ({ ...p, username: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone number</Label>
                          <Input
                            value={newUser.phone}
                            onChange={(e) => setNewUser((p) => ({ ...p, phone: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Select
                            value={newUser.role}
                            onValueChange={(v) =>
                              setNewUser((p) => ({
                                ...p,
                                role: v,
                                department: v === "Super Admin" ? "" : p.department,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {["Super Admin", "Admin", "Employee"].map((r) => (
                                <SelectItem key={r} value={r}>
                                  {roleLabels[r as SystemUser["role"]]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {newUser.role !== "Super Admin" && (
                          <div className="space-y-2">
                            <Label>Department</Label>
                            <Select
                              value={newUser.department}
                              onValueChange={(v) => setNewUser((p) => ({ ...p, department: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {departments.map((d) => (
                                  <SelectItem key={d.code} value={d.name}>
                                    {d.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Password</Label>
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              value={newUser.password}
                              onChange={(e) =>
                                setNewUser((p) => ({ ...p, password: e.target.value }))
                              }
                              placeholder="Enter password"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setNewUser((p) => ({ ...p, password: DEFAULT_PASSWORD }))
                              }
                            >
                              Use default password
                            </Button>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={createUser}>Create user</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-4">

              <div className="mt-4 overflow-x-auto">
                <ListBody>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersPage.pageItems.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <p className="text-sm font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </TableCell>
                        <TableCell className="text-sm">{roleLabels[u.role]}</TableCell>
                        <TableCell className="text-sm">{u.department}</TableCell>
                        <TableCell className="text-xs">{u.lastLogin}</TableCell>
                        <TableCell className="text-xs font-mono">{u.ipAddress}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              u.status === "Active"
                                ? "border-success/30 bg-success/15 text-success"
                                : "border-caution/30 bg-caution/15 text-caution"
                            }
                          >
                            {u.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="outline" onClick={() => openEdit(u)}>
                              Edit
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Reset password"
                              onClick={() => openReset(u)}
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            {u.status !== "Active" && (
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Recover account"
                                onClick={() => {
                                  setUsers((p) =>
                                    p.map((x) => (x.id === u.id ? { ...x, status: "Active" } : x)),
                                  );
                                  toast.success(`${u.username} account recovered`);
                                }}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" title="Delete user">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete {u.name}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently remove the user account. This action
                                    cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      setUsers((p) => p.filter((x) => x.id !== u.id));
                                      toast(`${u.username} deleted`);
                                    }}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="py-8 text-center text-sm text-muted-foreground"
                        >
                          No users match your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </ListBody>
              </div>
              <TablePagination
                page={usersPage.page}
                pageCount={usersPage.pageCount}
                from={usersPage.from}
                to={usersPage.to}
                total={usersPage.total}
                label="users"
                onPageChange={usersPage.setPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold">Permission Matrix</h2>
                  <p className="text-xs text-muted-foreground">
                    Role-based access matrix — click Edit to modify checkbox permissions.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!isEditingMatrix ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          setMatrixDraft({ ...matrix });
                          setIsEditingMatrix(true);
                        }}
                      >
                        Edit matrix
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setMatrix(roleGroupMatrix);
                          setMatrixDraft(roleGroupMatrix);
                          toast.success("Permission matrix reset to default settings");
                        }}
                      >
                        Reset to default
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          setMatrix({ ...matrixDraft });
                          setIsEditingMatrix(false);
                          toast.success("Permission matrix saved successfully");
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsEditingMatrix(false);
                          setMatrixDraft({ ...matrix });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setMatrixDraft(roleGroupMatrix);
                          toast.info("Draft permissions reset to defaults");
                        }}
                      >
                        Reset to default
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-36">Role</TableHead>
                      {permissionGroups.map((g) => (
                        <TableHead key={g} className="min-w-[12rem]">
                          {g}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(["Super Admin", "Admin", "Employee"] as const).map((role) => (
                      <TableRow key={role}>
                        <TableCell className="text-sm font-medium align-top pt-4">
                          {roleLabels[role]}
                        </TableCell>
                        {permissionGroups.map((g) => {
                          const active = isEditingMatrix ? matrixDraft : matrix;
                          const level = active[role]?.[g] ?? "None";
                          const isView =
                            level === "View" ||
                            level === "Edit" ||
                            level === "Full" ||
                            level === "Approve / Reject Only";
                          const isEdit =
                            level === "Edit" || level === "Full" || level === "Approve / Reject Only";
                          const isFull = level === "Full";

                          const handleToggle = (type: "View" | "Edit" | "Full", checked: boolean) => {
                            let next: PermissionLevel = "None";
                            if (type === "Full") {
                              next = checked ? "Full" : "Edit";
                            } else if (type === "Edit") {
                              next = checked ? "Edit" : "View";
                            } else if (type === "View") {
                              next = checked ? "View" : "None";
                            }
                            setMatrixDraft((prev) => ({
                              ...prev,
                              [role]: { ...prev[role], [g]: next },
                            }));
                          };

                          return (
                            <TableCell key={g} className="align-top py-3">
                              <div
                                className={cn(
                                  "space-y-1.5 rounded-md border border-border bg-card p-2.5 transition-opacity",
                                  !isEditingMatrix && "opacity-85 pointer-events-none bg-muted/30",
                                )}
                              >
                                <label className="flex items-center gap-2 text-xs font-normal cursor-pointer select-none">
                                  <Checkbox
                                    checked={isView}
                                    disabled={!isEditingMatrix}
                                    onCheckedChange={(c) => handleToggle("View", !!c)}
                                  />
                                  <span>View Access</span>
                                </label>
                                <label className="flex items-center gap-2 text-xs font-normal cursor-pointer select-none">
                                  <Checkbox
                                    checked={isEdit}
                                    disabled={!isEditingMatrix}
                                    onCheckedChange={(c) => handleToggle("Edit", !!c)}
                                  />
                                  <span>Edit Access</span>
                                </label>
                                <label className="flex items-center gap-2 text-xs font-normal cursor-pointer select-none">
                                  <Checkbox
                                    checked={isFull}
                                    disabled={!isEditingMatrix}
                                    onCheckedChange={(c) => handleToggle("Full", !!c)}
                                  />
                                  <span>Full Control</span>
                                </label>
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {isEditingMatrix
                  ? "Checkboxes active — click Save when finished editing permissions."
                  : "Click the 'Edit matrix' button above to unlock and modify role permission checkboxes."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border/70">
              <CardContent className="flex flex-1 flex-col space-y-4 p-6">
                <h2 className="font-display text-2xl font-semibold">Login Security Policy</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Two-factor authentication</p>
                    <p className="text-xs text-muted-foreground">
                      Require an OTP code for all admin logins.
                    </p>
                  </div>
                  <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                </div>
                <div className="space-y-2">
                  <Label>Password policy</Label>
                  <Select value={passwordPolicy} onValueChange={setPasswordPolicy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic (min 6 characters)</SelectItem>
                      <SelectItem value="strong">Strong (upper, lower, number, symbol)</SelectItem>
                      <SelectItem value="strict">Strict (12+ chars, no reuse)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Session timeout (minutes)</Label>
                  <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["15", "30", "60", "120"].map((v) => (
                        <SelectItem key={v} value={v}>
                          {v} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max failed login attempts / lockout</Label>
                  <Select value={maxAttempts} onValueChange={setMaxAttempts}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["3", "5", "10"].map((v) => (
                        <SelectItem key={v} value={v}>
                          {v} attempts
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => toast.success("Authentication & login security settings saved")}
                >
                  Save security policy
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="flex flex-1 flex-col space-y-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display text-2xl font-semibold">Active Sessions</h2>
                    <p className="text-xs text-muted-foreground">
                      {sessions.length} user session{sessions.length === 1 ? "" : "s"} currently
                      signed in across all accounts.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={sessions.length <= 1}
                    onClick={revokeAllOtherSessions}
                  >
                    <Shield className="mr-2 h-4 w-4" /> Revoke all other sessions
                  </Button>
                </div>
                <div className="space-y-3">
                  {sessions.length === 0 && (
                    <p className="text-sm text-muted-foreground">No active sessions.</p>
                  )}
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        {s.device === "Mobile" ? (
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Monitor className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{s.user}</p>
                            {s.current && (
                              <Badge
                                variant="outline"
                                className="border-success/30 bg-success/15 text-[10px] text-success"
                              >
                                This device
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {s.department} · {s.position}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s.browserOs} · {s.location} · {s.ipAddress} · {s.lastActive}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={s.current}
                        onClick={() => revokeSession(s.id)}
                      >
                        Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Edit User</DialogTitle>
          </DialogHeader>
          {editDraft && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input
                  value={editDraft.name}
                  onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={editDraft.username}
                  onChange={(e) => setEditDraft({ ...editDraft, username: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editDraft.email}
                  onChange={(e) => setEditDraft({ ...editDraft, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={editDraft.role}
                  onValueChange={(v) =>
                    setEditDraft({ ...editDraft, role: v as SystemUser["role"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Super Admin", "Admin", "Employee"].map((r) => (
                      <SelectItem key={r} value={r}>
                        {roleLabels[r as SystemUser["role"]]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editDraft.role !== "Super Admin" && (
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={editDraft.department}
                    onValueChange={(v) => setEditDraft({ ...editDraft, department: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.code} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editDraft.status}
                  onValueChange={(v) =>
                    setEditDraft({ ...editDraft, status: v as SystemUser["status"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Active", "Suspended", "Disabled"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={saveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!resetUser}
        onOpenChange={(o) => {
          if (!o && (resetPassword || confirmResetPassword)) {
            setPendingUnsavedResetExit(true);
          } else {
            setResetUser(null);
            setResetPassword("");
            setConfirmResetPassword("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Reset User Password</DialogTitle>
          </DialogHeader>
          {resetUser && (
            <div className="space-y-4 py-2">
              <p className="text-xs text-muted-foreground">
                Specify a new password for account <strong className="text-foreground">{resetUser.username}</strong> ({resetUser.name}).
              </p>
              <div className="space-y-1.5">
                <Label className="text-xs">New Password</Label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="text-xs shrink-0"
                    onClick={() => {
                      const gen = generateDefaultPassword();
                      setResetPassword(gen);
                      setConfirmResetPassword(gen);
                    }}
                  >
                    Generate Default
                  </Button>
                </div>
              </div>

              {/* RE-ENTER NEW PASSWORD FOR VERIFICATION */}
              <div className="space-y-1.5">
                <Label className="text-xs">Re-enter New Password (Verification)</Label>
                <Input
                  type="password"
                  value={confirmResetPassword}
                  onChange={(e) => setConfirmResetPassword(e.target.value)}
                  placeholder="Re-enter new password to confirm"
                  className="text-xs"
                />
              </div>

              {resetPassword && confirmResetPassword && resetPassword !== confirmResetPassword && (
                <p className="text-xs text-destructive font-medium">
                  Passwords do not match. Please ensure both fields match exactly.
                </p>
              )}

              {resetPassword && confirmResetPassword && resetPassword === confirmResetPassword && (
                <p className="text-xs text-success font-medium flex items-center gap-1.5">
                  Passwords match successfully!
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (resetPassword || confirmResetPassword) {
                  setPendingUnsavedResetExit(true);
                } else {
                  setResetUser(null);
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!resetPassword) {
                  toast.error("Please enter a new password.");
                  return;
                }
                if (resetPassword !== confirmResetPassword) {
                  toast.error("Passwords do not match. Please verify.");
                  return;
                }
                setPendingConfirmReset(true);
              }}
            >
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRM RESET PASSWORD SAVE */}
      <AlertDialog open={pendingConfirmReset} onOpenChange={setPendingConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Password Reset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update the password for user <strong>{resetUser?.username}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingConfirmReset(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                submitReset();
                setPendingConfirmReset(false);
              }}
            >
              Yes, Reset Password
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONFIRM UNSAVED EXIT */}
      <AlertDialog open={pendingUnsavedResetExit} onOpenChange={setPendingUnsavedResetExit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-600">Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unconfirmed password entries. Are you sure you want to exit without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingUnsavedResetExit(false)}>Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setResetUser(null);
                setResetPassword("");
                setConfirmResetPassword("");
                setPendingUnsavedResetExit(false);
              }}
            >
              Discard &amp; Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function AuditLogs() {
  const [severity, setSeverity] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const moduleOptions = Array.from(new Set(auditLogs.map((a) => a.module)));
  const filteredRows = auditLogs.filter((a) => {
    const matchesSeverity = severity === "all" || a.severity === severity;
    const matchesModule = moduleFilter === "all" || a.module === moduleFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      a.user.toLowerCase().includes(q) ||
      a.action.toLowerCase().includes(q) ||
      a.module.toLowerCase().includes(q) ||
      a.department.toLowerCase().includes(q) ||
      a.ipAddress.toLowerCase().includes(q);
    return matchesSeverity && matchesModule && matchesSearch;
  });
  const {
    sort,
    toggle,
    sorted: rows,
  } = useSort(filteredRows, {
    timestamp: (a) => a.timestamp,
    user: (a) => a.user,
    role: (a) => a.role,
    action: (a) => a.action,
    module: (a) => a.module,
    department: (a) => a.department,
    device: (a) => a.device,
    ipAddress: (a) => a.ipAddress,
    severity: (a) => a.severity,
  });

  const auditPage = usePagination(rows, 5);

  const totalEvents = auditLogs.length;
  const criticalCount = auditLogs.filter((a) => a.severity === "Critical").length;
  const warningCount = auditLogs.filter((a) => a.severity === "Warning").length;
  const uniqueActors = new Set(auditLogs.map((a) => a.user)).size;

  return (
    <div>
      <PageHeader
        eyebrow="Super Admin"
        title="Audit Logs"
        description="Full system activity trail across all modules and users."
        actions={
          <Dialog open={reportOpen} onOpenChange={setReportOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Download className="mr-2 h-4 w-4" /> Generate report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Generate Audit Report</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Report type</Label>
                  <Select defaultValue="summary">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary report</SelectItem>
                      <SelectItem value="detailed">Detailed activity report</SelectItem>
                      <SelectItem value="security">Security incidents report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>From date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>To date</Label>
                  <Input type="date" />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    toast.success("Audit log report generated");
                    setReportOpen(false);
                  }}
                >
                  Generate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Events" value={totalEvents} tone="primary" />
        <StatCard label="Critical" value={criticalCount} tone="caution" />
        <StatCard label="Warnings" value={warningCount} tone="gold" />
        <StatCard label="Unique Actors" value={uniqueActors} tone="success" />
      </div>

      <Card className="mt-4 border-border/70">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold">System Activity</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[14rem] flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search user, action, module, IP…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All modules</SelectItem>
                  {moduleOptions.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  {["Info", "Warning", "Critical"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <ListBody>
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHead sortKey="timestamp" sort={sort} onSort={toggle}>
                    Timestamp
                  </SortHead>
                  <SortHead sortKey="user" sort={sort} onSort={toggle}>
                    User &amp; Role
                  </SortHead>
                  <TableHead>Action Type</TableHead>
                  <SortHead sortKey="action" sort={sort} onSort={toggle}>
                    Action Details
                  </SortHead>
                  <SortHead sortKey="module" sort={sort} onSort={toggle}>
                    Module
                  </SortHead>
                  <SortHead sortKey="device" sort={sort} onSort={toggle}>
                    Device &amp; IP
                  </SortHead>
                  <SortHead sortKey="severity" sort={sort} onSort={toggle}>
                    Severity
                  </SortHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditPage.pageItems.map((a) => {
                  const actLower = a.action.toLowerCase();
                  const actionType: "Create" | "Update" | "Delete" | "Security" =
                    actLower.includes("create") || actLower.includes("add") || actLower.includes("generate") || actLower.includes("regularized")
                      ? "Create"
                      : actLower.includes("delete") || actLower.includes("revoke") || actLower.includes("disable") || actLower.includes("exit") || actLower.includes("deactivated")
                      ? "Delete"
                      : actLower.includes("login") || actLower.includes("password") || actLower.includes("2fa") || actLower.includes("permission") || actLower.includes("policy") || actLower.includes("security")
                      ? "Security"
                      : "Update";

                  const actionTypeTone =
                    actionType === "Create"
                      ? "border-success/40 bg-success/10 text-success"
                      : actionType === "Delete"
                      ? "border-destructive/40 bg-destructive/10 text-destructive"
                      : actionType === "Security"
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-600"
                      : "border-primary/40 bg-primary/10 text-primary";

                  return (
                    <TableRow key={a.id}>
                      <TableCell className="text-xs text-muted-foreground">{a.timestamp}</TableCell>
                      {/* USER & ROLE COLUMN */}
                      <TableCell className="text-xs">
                        <div className="font-semibold text-foreground">{a.user}</div>
                        <Badge variant="outline" className="mt-0.5 text-[10px] py-0 h-4 border-border/60 text-muted-foreground font-normal">
                          {a.role}
                        </Badge>
                      </TableCell>
                      {/* ACTION TYPE CATEGORY COLUMN */}
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px] font-semibold", actionTypeTone)}>
                          {actionType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium max-w-sm">{a.action}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{a.module}</TableCell>
                      <TableCell className="text-xs">
                        <div>{a.device}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">{a.ipAddress}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            a.severity === "Critical"
                              ? "border-destructive/30 bg-destructive/15 text-destructive text-[10px]"
                              : a.severity === "Warning"
                              ? "border-warning/40 bg-warning/20 text-warning-foreground text-[10px]"
                              : "border-border text-muted-foreground text-[10px]"
                          }
                        >
                          {a.severity}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No activity matches your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </ListBody>
          </div>
          <TablePagination
            page={auditPage.page}
            pageCount={auditPage.pageCount}
            from={auditPage.from}
            to={auditPage.to}
            total={auditPage.total}
            label="entries"
            onPageChange={auditPage.setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsCard({
  icon,
  title,
  subtitle,
  action,
  className,
  children,
  footer,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  footer?: { label: string; onClick?: () => void };
}) {
  return (
    <Card className={cn("flex h-full flex-col rounded-xl border-border/70 shadow-sm", className)}>
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              {icon}
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold">{title}</h2>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          {action}
        </div>
        <div className="mt-4 flex-1">{children}</div>
        {footer && (
          <button
            type="button"
            onClick={footer.onClick}
            className="mt-4 flex items-center gap-1.5 self-start border-t border-border/60 pt-4 text-sm font-medium text-primary transition hover:gap-2.5"
          >
            {footer.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </CardContent>
    </Card>
  );
}

function InfoRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "default";
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      {tone === "success" ? (
        <Badge variant="outline" className="border-success/30 bg-success/15 text-success">
          {value}
        </Badge>
      ) : (
        <span className="text-sm font-medium">{value}</span>
      )}
    </div>
  );
}

export function SettingsPage({ role }: { role: "superadmin" | "admin" | "employee" }) {
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [backupSchedule, setBackupSchedule] = useState("daily");
  const [backups, setBackups] = useState(backupSeed);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreTarget, setRestoreTarget] = useState<(typeof backupSeed)[number] | null>(null);
  const [notify, setNotify] = useState<Record<string, boolean>>({
    "Email notifications": true,
    "Browser notifications": true,
    "System announcements": true,
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notifications dialog
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifDraft, setNotifDraft] = useState(notify);

  // Preferences
  const [preferences, setPreferences] = useState({
    theme: "Light",
    language: "English",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12-hour",
    timeZone: "Asia/Manila (GMT+8)",
  });
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefsDraft, setPrefsDraft] = useState(preferences);

  // Login security
  const [security, setSecurity] = useState({
    twoFactor: true,
    passwordPolicy: "Strong",
    sessionTimeout: "30 minutes",
    maxLoginAttempts: "3 attempts",
  });
  const [securityOpen, setSecurityOpen] = useState(false);
  const [securityDraft, setSecurityDraft] = useState(security);

  // Company info
  const [company, setCompany] = useState({
    name: "Oxford Suites Makati",
    email: "info@oxfordsuites.com.ph",
    contact: "(02) 8888-0000",
    businessHours: "24/7 Front Desk Operations",
    address: "Ayala Center, Makati City",
    tin: "000-000-000-000",
  });
  const [companyOpen, setCompanyOpen] = useState(false);
  const [companyDraft, setCompanyDraft] = useState(company);

  const createBackup = () => {
    if (backupInProgress) return;
    setBackupInProgress(true);
    setBackupProgress(0);
    const timer = setInterval(() => {
      setBackupProgress((p) => {
        const next = p + 20;
        if (next >= 100) {
          clearInterval(timer);
          setBackupInProgress(false);
          setBackups((prev) => [
            {
              id: `BKP-${105 + prev.length}`,
              timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
              size: "483 MB",
              type: "Manual",
            },
            ...prev,
          ]);
          toast.success("Backup created successfully");
          return 0;
        }
        return next;
      });
    }, 300);
  };

  const restoreBackup = () => {
    if (!restoreTarget) return;
    toast.success(`System restored from ${restoreTarget.id} (${restoreTarget.timestamp})`);
    setRestoreTarget(null);
  };

  const changeOwnPassword = () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error("New password and confirmation must match");
      return;
    }
    toast.success("Password updated");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const isSuperAdmin = role === "superadmin";

  const [activeTab, setActiveTab] = useState<"notifications" | "security" | "company" | "preferences" | "backup">("security");

  const settingsTabs = [
    { id: "security" as const, label: "Login & Security", icon: Shield, desc: "Passwords, 2FA & lockout policy" },
    { id: "notifications" as const, label: "Notifications", icon: Bell, desc: "Email, browser & SMS alert settings" },
    { id: "preferences" as const, label: "Preferences", icon: SlidersHorizontal, desc: "Theme, date formats & language" },
    ...(showCompany ? [{ id: "company" as const, label: "Company", icon: Building2, desc: "Property & organization profile" }] : []),
    ...(showBackup ? [{ id: "backup" as const, label: "Backup & Restore", icon: Database, desc: "Database snapshots & restore points" }] : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={role === "superadmin" ? "Super Admin" : role === "admin" ? "Admin" : "Employee"}
        title="System & Account Settings"
        description="Configure account preferences, notification channels, security policies, and system data backups."
      />

      {/* REVAMPED 2-COLUMN LAYOUT: LEFT TAB NAVIGATION, RIGHT FUNCTION PANEL */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr] items-start">
        {/* LEFT COLUMN: DEDICATED TAB NAVIGATION */}
        <Card className="border-border/70 shadow-sm overflow-hidden sticky top-6">
          <CardContent className="p-2 space-y-1">
            <p className="px-3 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Settings Category
            </p>
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium shadow-2xs border border-primary/20"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-md text-xs", isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold leading-tight">{tab.label}</p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{tab.desc}</p>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* RIGHT COLUMN: ACTIVE SETTINGS CONTROLS */}
        <div className="space-y-6">
          {/* 1. NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <Card className="rounded-xl border-border/70 shadow-sm">
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Bell className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-semibold">Notification Settings</h2>
                    <p className="text-xs text-muted-foreground">Configure email digest alerts, browser push notifications, and HR announcements.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {(["Email notifications", "Browser notifications", "System announcements"] as const).map((label) => (
                    <div key={label} className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-muted/30 p-4">
                      <div className="min-w-0">
                        <span className="text-sm font-medium">{label}</span>
                        <p className="text-xs text-muted-foreground">
                          {label === "Email notifications"
                            ? "Digest and request updates sent to your inbox."
                            : label === "Browser notifications"
                            ? "Real-time pop-ups while signed in."
                            : "Property-wide announcements from HR."}
                        </p>
                      </div>
                      <Switch
                        aria-label={label}
                        checked={notify[label] ?? false}
                        onCheckedChange={(v) => {
                          setNotify((prev) => ({ ...prev, [label]: v }));
                          toast.success(`${label} ${v ? "enabled" : "disabled"}`);
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end border-t border-border/60 pt-4">
                  <Button onClick={() => toast.success("Notification settings saved")}>Save Notification Settings</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 2. LOGIN & SECURITY */}
          {activeTab === "security" && (
            <Card className="rounded-xl border-border/70 shadow-sm">
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Shield className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-semibold">{showSystemSecurity ? "Login Security Policy" : "Account Security"}</h2>
                    <p className="text-xs text-muted-foreground">
                      {showSystemSecurity ? "System-wide login security policy for all employee and admin portals." : "Update your personal account password."}
                    </p>
                  </div>
                </div>

                {!showSystemSecurity && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="cur-pw">Current password</Label>
                        <Input id="cur-pw" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-pw">New password</Label>
                        <Input id="new-pw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-pw">Confirm new password</Label>
                        <Input id="confirm-pw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
                      </div>
                    </div>
                    <div className="flex justify-end border-t border-border/60 pt-4">
                      <Button onClick={changeOwnPassword}>
                        <KeyRound className="mr-2 h-4 w-4" /> Update Password
                      </Button>
                    </div>
                  </div>
                )}

                {showSystemSecurity && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-muted/30 p-4">
                      <div>
                        <p className="text-sm font-medium">Two-Factor Authentication (OTP)</p>
                        <p className="text-xs text-muted-foreground">Require a 6-digit OTP code for all admin portal logins.</p>
                      </div>
                      <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Password Strength Policy</Label>
                        <Select value={passwordPolicy} onValueChange={setPasswordPolicy}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic (min 6 characters)</SelectItem>
                            <SelectItem value="strong">Strong (upper, lower, number, symbol)</SelectItem>
                            <SelectItem value="strict">Strict (12+ chars, mandatory periodic reset)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Inactivity Session Timeout</Label>
                        <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["15", "30", "60", "120"].map((v) => (
                              <SelectItem key={v} value={v}>{v} minutes</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Max Failed Attempts Before Lockout</Label>
                        <Select value={maxAttempts} onValueChange={setMaxAttempts}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["3", "5", "10"].map((v) => (
                              <SelectItem key={v} value={v}>{v} attempts</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end border-t border-border/60 pt-4">
                      <Button onClick={() => toast.success("System-wide login security policy saved")}>Save Login Security Policy</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 3. COMPANY */}
          {activeTab === "company" && showCompany && (
            <Card className="rounded-xl border-border/70 shadow-sm">
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-semibold">Company Profile</h2>
                    <p className="text-xs text-muted-foreground">Property profile details used across job postings, COE documents, and reports.</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="co-name">Company Name</Label>
                    <Input id="co-name" value={company.name} disabled={role !== "superadmin"} onChange={(e) => setCompany((c) => ({ ...c, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="co-email">Official HR Email</Label>
                    <Input id="co-email" type="email" value={company.email} disabled={role !== "superadmin"} onChange={(e) => setCompany((c) => ({ ...c, email: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="co-contact">Property Contact Line</Label>
                    <Input id="co-contact" value={company.contact} disabled={role !== "superadmin"} onChange={(e) => setCompany((c) => ({ ...c, contact: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="co-hours">Business Hours</Label>
                    <Input id="co-hours" value={company.hours} disabled={role !== "superadmin"} onChange={(e) => setCompany((c) => ({ ...c, hours: e.target.value }))} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="co-address">Property Address</Label>
                    <Input id="co-address" value={company.address} disabled={role !== "superadmin"} onChange={(e) => setCompany((c) => ({ ...c, address: e.target.value }))} />
                  </div>
                </div>
                {role === "superadmin" ? (
                  <div className="flex justify-end border-t border-border/60 pt-4">
                    <Button onClick={() => toast.success("Company information saved")}>Save Company Info</Button>
                  </div>
                ) : (
                  <p className="border-t border-border/60 pt-4 text-xs text-muted-foreground">Read-only view. Contact Super Admin to update company information.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* 4. PREFERENCES */}
          {activeTab === "preferences" && (
            <Card className="rounded-xl border-border/70 shadow-sm">
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <SlidersHorizontal className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-semibold">System Preferences</h2>
                    <p className="text-xs text-muted-foreground">Personalize interface theme mode, date/time formatting, and regional language.</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Palette className="h-3.5 w-3.5 text-muted-foreground" /> Theme Mode
                    </Label>
                    <Select value={prefs.theme} onValueChange={setPref("theme")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light Mode</SelectItem>
                        <SelectItem value="dark">Dark Mode</SelectItem>
                        <SelectItem value="system">System Default</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" /> Display Language
                    </Label>
                    <Select value={prefs.language} onValueChange={setPref("language")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English (US)</SelectItem>
                        <SelectItem value="fil">Filipino (Tagalog)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select value={prefs.dateFormat} onValueChange={setPref("dateFormat")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Time Format
                    </Label>
                    <Select value={prefs.timeFormat} onValueChange={setPref("timeFormat")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Default Time Zone</Label>
                    <Select value={prefs.timeZone} onValueChange={setPref("timeZone")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ph">Asia/Manila (GMT+8)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
                  <Button variant="outline" onClick={() => setPrefs({ theme: "light", language: "en", dateFormat: "mdy", timeFormat: "12h", timeZone: "ph" })}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Reset
                  </Button>
                  <Button onClick={() => toast.success("Preferences saved")}>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 5. BACKUP & RESTORE */}
          {activeTab === "backup" && showBackup && (
            <Card className="rounded-xl border-border/70 shadow-sm">
              <CardContent className="space-y-5 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Database className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-display text-xl font-semibold">Backup &amp; Restore Manager</h2>
                      <p className="text-xs text-muted-foreground">Generate database snapshots, schedule automated backups, and perform system rollbacks.</p>
                    </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {/* Notifications */}
        <SettingsCard
          icon={<Bell className="h-5 w-5" />}
          title="Notifications"
          subtitle="Choose how you receive alerts and updates"
          footer={{
            label: "Manage notifications",
            onClick: () => {
              setNotifDraft(notify);
              setNotifOpen(true);
            },
          }}
        >
          <div className="divide-y divide-border/60">
            {(
              ["Email notifications", "Browser notifications", "System announcements"] as const
            ).map((label) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Switch
                  aria-label={label}
                  checked={notify[label] ?? false}
                  onCheckedChange={(v) => {
                    setNotify((prev) => ({ ...prev, [label]: v }));
                    toast.success(`${label} ${v ? "enabled" : "disabled"}`);
                  }}
                />
              </div>
            ))}
          </div>
        </SettingsCard>

        <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Manage notifications</DialogTitle>
            </DialogHeader>
            <div className="divide-y divide-border/60">
              {(
                ["Email notifications", "Browser notifications", "System announcements"] as const
              ).map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <Switch
                    aria-label={label}
                    checked={notifDraft[label] ?? false}
                    onCheckedChange={(v) => setNotifDraft((prev) => ({ ...prev, [label]: v }))}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNotifOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setNotify(notifDraft);
                  setNotifOpen(false);
                  toast.success("Notification settings saved");
                }}
              >
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preferences */}
        <SettingsCard
          icon={<SlidersHorizontal className="h-5 w-5" />}
          title="Preferences"
          subtitle="Personalize how the portal looks and formats data"
          footer={{
            label: "Edit preferences",
            onClick: () => {
              setPrefsDraft(preferences);
              setPrefsOpen(true);
            },
          }}
        >
          <div className="divide-y divide-border/60">
            <InfoRow label="Theme" value={preferences.theme} />
            <InfoRow label="Language" value={preferences.language} />
            <InfoRow label="Date format" value={preferences.dateFormat} />
            <InfoRow label="Time format" value={preferences.timeFormat} />
            <InfoRow label="Time zone" value={preferences.timeZone} />
          </div>
        </SettingsCard>

        <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Edit preferences</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={prefsDraft.theme} onValueChange={(v) => setPrefsDraft((p) => ({ ...p, theme: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Light">Light</SelectItem>
                    <SelectItem value="Dark">Dark</SelectItem>
                    <SelectItem value="System">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={prefsDraft.language}
                  onValueChange={(v) => setPrefsDraft((p) => ({ ...p, language: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Filipino">Filipino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date format</Label>
                <Select
                  value={prefsDraft.dateFormat}
                  onValueChange={(v) => setPrefsDraft((p) => ({ ...p, dateFormat: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time format</Label>
                <Select
                  value={prefsDraft.timeFormat}
                  onValueChange={(v) => setPrefsDraft((p) => ({ ...p, timeFormat: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12-hour">12-hour</SelectItem>
                    <SelectItem value="24-hour">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time zone</Label>
                <Select
                  value={prefsDraft.timeZone}
                  onValueChange={(v) => setPrefsDraft((p) => ({ ...p, timeZone: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Manila (GMT+8)">Asia/Manila (GMT+8)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/Los_Angeles (GMT-8)">America/Los_Angeles (GMT-8)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPrefsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setPreferences(prefsDraft);
                  setPrefsOpen(false);
                  toast.success("Preferences saved");
                }}
              >
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Login Security (superadmin) or Change Password (admin/employee) */}
        {isSuperAdmin ? (
          <SettingsCard
            icon={<Shield className="h-5 w-5" />}
            title="Login Security"
            subtitle="System-wide login security policy for all portals"
            footer={{
              label: "Manage security",
              onClick: () => {
                setSecurityDraft(security);
                setSecurityOpen(true);
              },
            }}
          >
            <div className="divide-y divide-border/60">
              <InfoRow
                label="Two-factor authentication"
                value={security.twoFactor ? "Enabled" : "Disabled"}
                tone={security.twoFactor ? "success" : "default"}
              />
              <InfoRow label="Default password policy" value={security.passwordPolicy} />
              <InfoRow label="Session timeout" value={security.sessionTimeout} />
              <InfoRow label="Max login attempts" value={security.maxLoginAttempts} />
            </div>
          </SettingsCard>
        ) : (
          <Card id="change-password" className="flex h-full flex-col scroll-mt-20 rounded-xl border-border/70 shadow-sm">
            <CardContent className="flex flex-1 flex-col space-y-4 p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <KeyRound className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold">Change Password</h2>
                  <p className="text-xs text-muted-foreground">Update your account password.</p>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cur-pw">Current password</Label>
                  <Input
                    id="cur-pw"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-pw">New password</Label>
                  <Input
                    id="new-pw"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-pw">Confirm new password</Label>
                  <Input
                    id="confirm-pw"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="mt-auto flex justify-end pt-1">
                <Button onClick={changeOwnPassword}>
                  <KeyRound className="mr-2 h-4 w-4" /> Update password
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isSuperAdmin && (
          <Dialog open={securityOpen} onOpenChange={setSecurityOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Manage security</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-4">
                  <Label>Two-factor authentication</Label>
                  <Switch
                    checked={securityDraft.twoFactor}
                    onCheckedChange={(v) => setSecurityDraft((p) => ({ ...p, twoFactor: v }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default password policy</Label>
                  <Select
                    value={securityDraft.passwordPolicy}
                    onValueChange={(v) => setSecurityDraft((p) => ({ ...p, passwordPolicy: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Strong">Strong</SelectItem>
                      <SelectItem value="Very strong">Very strong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Session timeout</Label>
                  <Select
                    value={securityDraft.sessionTimeout}
                    onValueChange={(v) => setSecurityDraft((p) => ({ ...p, sessionTimeout: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15 minutes">15 minutes</SelectItem>
                      <SelectItem value="30 minutes">30 minutes</SelectItem>
                      <SelectItem value="60 minutes">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max login attempts</Label>
                  <Select
                    value={securityDraft.maxLoginAttempts}
                    onValueChange={(v) => setSecurityDraft((p) => ({ ...p, maxLoginAttempts: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3 attempts">3 attempts</SelectItem>
                      <SelectItem value="5 attempts">5 attempts</SelectItem>
                      <SelectItem value="10 attempts">10 attempts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSecurityOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setSecurity(securityDraft);
                    setSecurityOpen(false);
                    toast.success("System-wide login security policy saved");
                  }}
                >
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Company (superadmin only) */}
        {isSuperAdmin && (
          <SettingsCard
            icon={<Building2 className="h-5 w-5" />}
            title="Company"
            subtitle="Default used in documents, job post and portals"
            footer={{
              label: "Edit company info",
              onClick: () => {
                setCompanyDraft(company);
                setCompanyOpen(true);
              },
            }}
          >
            <div className="divide-y divide-border/60">
              <InfoRow label="Company name" value={company.name} />
              <InfoRow label="Company email" value={company.email} />
              <InfoRow label="Contact number" value={company.contact} />
              <InfoRow label="Business hours" value={company.businessHours} />
              <InfoRow label="Company address" value={company.address} />
              <InfoRow label="TIN" value={company.tin} />
            </div>
          </SettingsCard>
        )}

        {isSuperAdmin && (
          <Dialog open={companyOpen} onOpenChange={setCompanyOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Edit company info</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="co-name">Company name</Label>
                  <Input
                    id="co-name"
                    value={companyDraft.name}
                    onChange={(e) => setCompanyDraft((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co-email">Company email</Label>
                  <Input
                    id="co-email"
                    value={companyDraft.email}
                    onChange={(e) => setCompanyDraft((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co-contact">Contact number</Label>
                  <Input
                    id="co-contact"
                    value={companyDraft.contact}
                    onChange={(e) => setCompanyDraft((p) => ({ ...p, contact: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co-hours">Business hours</Label>
                  <Input
                    id="co-hours"
                    value={companyDraft.businessHours}
                    onChange={(e) => setCompanyDraft((p) => ({ ...p, businessHours: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co-address">Company address</Label>
                  <Input
                    id="co-address"
                    value={companyDraft.address}
                    onChange={(e) => setCompanyDraft((p) => ({ ...p, address: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co-tin">TIN</Label>
                  <Input
                    id="co-tin"
                    value={companyDraft.tin}
                    onChange={(e) => setCompanyDraft((p) => ({ ...p, tin: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCompanyOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setCompany(companyDraft);
                    setCompanyOpen(false);
                    toast.success("Company information saved");
                  }}
                >
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Backup & Restore (superadmin only) */}
        {isSuperAdmin && (
          <Card className="rounded-xl border-border/70 shadow-sm xl:col-span-2">
            <CardContent className="flex flex-1 flex-col space-y-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Database className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-semibold">Backup &amp; Restore</h2>
                    <p className="text-xs text-muted-foreground">
                      Manage system backups and restore points
                    </p>
                  </div>
                  <Button onClick={createBackup} disabled={backupInProgress}>
                    {backupInProgress ? "Creating Snapshot…" : "Create Backup Snapshot"}
                  </Button>
                </div>

                {backupInProgress && (
                  <div className="space-y-1">
                    <Progress value={backupProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground">Backing up database tables… {backupProgress}%</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border/70 bg-muted/30 p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Automated Scheduled Backups</p>
                    <p className="text-xs text-muted-foreground">Automatically trigger system data snapshots on a recurring schedule.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {autoBackupEnabled && (
                      <Select value={backupSchedule} onValueChange={setBackupSchedule}>
                        <SelectTrigger className="h-9 w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Switch checked={autoBackupEnabled} onCheckedChange={setAutoBackupEnabled} aria-label="Automatic backups" />
                  </div>
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-caution/30 bg-caution/10 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Automatic backups</p>
                  <p className="text-xs text-muted-foreground">
                    Run scheduled backups without manual action
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {autoBackupEnabled && (
                    <Select value={backupSchedule} onValueChange={setBackupSchedule}>
                      <SelectTrigger className="h-9 w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Switch
                    checked={autoBackupEnabled}
                    onCheckedChange={setAutoBackupEnabled}
                    aria-label="Automatic backups"
                  />
                </div>

                <div className="max-h-[18rem] overflow-auto rounded-lg border border-border/70">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Snapshot ID</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backupsPage.pageItems.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell className="text-xs font-mono font-medium">{b.id}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{b.timestamp}</TableCell>
                          <TableCell className="text-xs">{b.size}</TableCell>
                          <TableCell className="text-xs">{b.type}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8" title="Download backup" onClick={() => toast.success(`Downloading ${b.id}`)}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <AlertDialog open={restoreTarget?.id === b.id} onOpenChange={(o) => !o && setRestoreTarget(null)}>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setRestoreTarget(b)}>
                                    Restore
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Restore System from {b.id}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will roll back system data to the {b.timestamp} snapshot. Any unsaved changes made after this point will be overwritten.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={restoreBackup}>Yes, Restore</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <TablePagination
                  page={backupsPage.page}
                  pageCount={backupsPage.pageCount}
                  from={backupsPage.from}
                  to={backupsPage.to}
                  total={backupsPage.total}
                  label="backups"
                  onPageChange={backupsPage.setPage}
                />
              </CardContent>
            </Card>
          )}
        </div>
              <div className="max-h-80 overflow-y-auto rounded-lg border border-border/70">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-card">
                    <TableRow>
                      <TableHead>Backup id</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="text-sm font-medium">{b.id}</TableCell>
                        <TableCell className="text-xs">{b.timestamp}</TableCell>
                        <TableCell className="text-xs">{b.size}</TableCell>
                        <TableCell className="text-xs">{b.type}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Download backup"
                              onClick={() => toast.success(`Downloading ${b.id}`)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <AlertDialog
                              open={restoreTarget?.id === b.id}
                              onOpenChange={(o) => !o && setRestoreTarget(null)}
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setRestoreTarget(b)}
                                >
                                  Restore
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Restore from {b.id}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will roll back system data to the {b.timestamp} snapshot.
                                    Any changes made after this backup will be lost.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={restoreBackup}>
                                    Restore
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground">
                Showing {backups.length > 0 ? 1 : 0}-{backups.length} of {backups.length} backups
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export function EmployeeOnboarding() {
  const hire = newHires.find((h) => h.name === myProfile.name) ?? newHires[0]!;
  const [checklist, setChecklist] = useState(hire.checklist);
  const pct = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);
  return (
    <div>
      <PageHeader
        eyebrow="Employee"
        title="My Onboarding"
        description="Complete your requirements to move to the next stage."
      />
      <Card className="border-border/70">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Current stage</p>
              <p className="font-display text-3xl font-semibold text-primary">{hire.stage}</p>
            </div>
            <Badge variant="outline">{pct}% complete</Badge>
          </div>
          <Progress value={pct} className="mt-3 h-2" />
          <div className="mt-5 space-y-2">
            {checklist.map((c) => (
              <label
                key={c.item}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3"
              >
                <Checkbox
                  checked={c.done}
                  onCheckedChange={() =>
                    setChecklist((p) =>
                      p.map((x) => (x.item === c.item ? { ...x, done: !x.done } : x)),
                    )
                  }
                />
                <span className={c.done ? "text-sm text-muted-foreground line-through" : "text-sm"}>
                  {c.item}
                </span>
              </label>
            ))}
          </div>
          <Button className="mt-4" onClick={() => toast.success("Requirements submitted to HR")}>
            <Plus className="mr-2 h-4 w-4" /> Submit requirements
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
