import { useState } from "react";
import {
  Download,
  FileText,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { departments, employees as seedEmployees, type Employee } from "@/data/hr";

const documentTypes = [
  "Certificate of Employment (COE)",
  "Certificate of Compensation",
  "Service Record",
  "Employment Verification Letter",
  "Certificate of Training Completion",
  "Clearance Certificate",
];

const reportTypes = [
  "Employee Masterlist Report",
  "Headcount by Department Report",
  "Employment Status Report",
  "Tenure & Regularization Report",
  "New Hire & Turnover Report",
  "Record Completion & Compliance Report",
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

/** Deterministic pseudo-random helper so demo records stay stable per employee. */
const seedOf = (id: string) =>
  id.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7);

type GeneratedDoc = {
  id: string;
  employeeName: string;
  docType: string;
  generatedAt: string;
};

type RecordLog = {
  id: string;
  timestamp: string;
  actor: string;
  action: "Added" | "Edited" | "Deleted";
  target: string;
  notes: string;
};

const recordLogs: RecordLog[] = [
  {
    id: "LOG-001",
    timestamp: "2026-01-14 09:12",
    actor: "Juan Dela Cruz",
    action: "Added",
    target: "EMP-0004 · Camille Ortega (201 file)",
    notes: "New employee record created after onboarding approval.",
  },
  {
    id: "LOG-002",
    timestamp: "2026-01-15 13:47",
    actor: "Maria Lim",
    action: "Edited",
    target: "EMP-0006 · Marjun Devera (Employment information)",
    notes: "Updated department assignment after transfer.",
  },
  {
    id: "LOG-003",
    timestamp: "2026-01-16 10:05",
    actor: "Juan Dela Cruz",
    action: "Edited",
    target: "EMP-0002 · Chef Gabriel Mendoza (Personal information)",
    notes: "Corrected contact number.",
  },
  {
    id: "LOG-004",
    timestamp: "2026-01-18 16:30",
    actor: "Paolo Cruz",
    action: "Deleted",
    target: "EMP-0009 · Test Record",
    notes: "Removed duplicate record created in error.",
  },
  {
    id: "LOG-005",
    timestamp: "2026-01-20 08:55",
    actor: "Maria Lim",
    action: "Added",
    target: "EMP-0005 · Kevin Dela Cruz (NBI Clearance file)",
    notes: "Uploaded renewed NBI clearance to 201 file.",
  },
  {
    id: "LOG-006",
    timestamp: "2026-01-21 11:20",
    actor: "Juan Dela Cruz",
    action: "Deleted",
    target: "EMP-0003 · Lourdes Bautista (Expired Health Certificate)",
    notes: "Removed expired document after renewal was uploaded.",
  },
];

type HistoryEntry = {
  id: string;
  type: "Promotion" | "Transfer" | "Employment";
  date: string;
  detail: string;
};

type Profile = {
  birthDate: string;
  civilStatus: string;
  gender: string;
  nationality: string;
  address: string;
  personalEmail: string;
  family: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  sss: string;
  pagibig: string;
  philhealth: string;
  tin: string;
  contract: string;
  certificates: string[];
  licenses: string[];
  medical: string[];
  missing: string[];
};

const civil = ["Single", "Married", "Widowed", "Separated"];
const genders = ["Female", "Male"];

function buildProfile(e: Employee): Profile {
  const s = seedOf(e.id);
  const missingPool = [
    "PSA Birth Certificate",
    "NBI Clearance (renewal)",
    "Latest Medical Exam",
    "TESDA Certificate",
  ];
  const missingCount = s % 3;
  return {
    birthDate: `19${80 + (s % 18)}-${String((s % 12) + 1).padStart(2, "0")}-${String(
      (s % 27) + 1,
    ).padStart(2, "0")}`,
    civilStatus: civil[s % civil.length]!,
    gender: genders[s % 2]!,
    nationality: "Filipino",
    address: `${(s % 300) + 1} Kalayaan Ave., Barangay Poblacion, Makati City`,
    personalEmail: `${e.name.split(" ")[0]!.toLowerCase()}.personal@email.com`,
    family: `Spouse / Parent: ${["Elena", "Ramon", "Teresa", "Miguel"][s % 4]} ${
      e.name.split(" ").slice(-1)[0]
    } · ${s % 4} dependent(s)`,
    emergencyName: `${["Elena", "Ramon", "Teresa", "Miguel"][(s + 1) % 4]} ${e.name
      .split(" ")
      .slice(-1)[0]}`,
    emergencyPhone: `0917 ${String(100 + (s % 800))} ${String(1000 + (s % 8000))}`,
    emergencyRelation: ["Spouse", "Parent", "Sibling", "Guardian"][s % 4]!,
    sss: `34-${String(1000000 + (s * 971) % 8999999)}-${s % 10}`,
    pagibig: `1211-${String(1000 + (s % 8999))}-${String(1000 + ((s * 7) % 8999))}`,
    philhealth: `02-${String(100000000 + (s * 613) % 899999999)}-${s % 10}`,
    tin: `${String(100 + (s % 800))}-${String(100 + ((s * 3) % 800))}-${String(
      100 + ((s * 5) % 800),
    )}-000`,
    contract: `${e.employmentType} Employment Contract · signed ${e.dateHired}`,
    certificates: [
      "Basic Occupational Safety & Health",
      "Guest Service Excellence Training",
      ...(s % 2 ? ["TESDA NC II"] : []),
    ],
    licenses: s % 3 === 0 ? ["Food Handler's Permit", "Health Certificate"] : ["Health Certificate"],
    medical: ["Annual Physical Exam (2026)", "Drug Test Clearance"],
    missing: missingPool.slice(0, missingCount),
  };
}

function buildHistory(e: Employee): HistoryEntry[] {
  const s = seedOf(e.id);
  const list: HistoryEntry[] = [
    {
      id: `${e.id}-H1`,
      type: "Employment",
      date: e.dateHired,
      detail: `Hired as ${e.position} (${e.department})`,
    },
  ];
  if (s % 2 === 0)
    list.push({
      id: `${e.id}-H2`,
      type: "Promotion",
      date: `20${22 + (s % 3)}-0${(s % 8) + 1}-15`,
      detail: `Promoted to ${e.position}`,
    });
  if (s % 3 === 0)
    list.push({
      id: `${e.id}-H3`,
      type: "Transfer",
      date: `20${21 + (s % 4)}-1${s % 2}-02`,
      detail: `Transferred to ${e.department}`,
    });
  return list;
}

const emptyEmployee = {
  name: "",
  position: "",
  department: departments[0]?.name ?? "Front Office",
  employmentType: "Probationary" as Employee["employmentType"],
  dateHired: new Date().toISOString().slice(0, 10),
  email: "",
  phone: "",
  supervisor: "",
};

export function EmployeeRecords({ role }: { role: "superadmin" | "admin" }) {
  const isSuper = role === "superadmin";

  const [list, setList] = useState<Employee[]>(seedEmployees);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [docType, setDocType] = useState(documentTypes[0]!);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDoc[]>([]);
  const [generatedOpen, setGeneratedOpen] = useState(false);
  const [logSearch, setLogSearch] = useState("");
  const [form, setForm] = useState(emptyEmployee);
  const [history, setHistory] = useState<Record<string, HistoryEntry[]>>({});
  const [newHistory, setNewHistory] = useState({
    type: "Promotion" as HistoryEntry["type"],
    date: new Date().toISOString().slice(0, 10),
    detail: "",
  });
  const [profileTab, setProfileTab] = useState("personal");
  const [historyFormOpen, setHistoryFormOpen] = useState(false);
  const [logAction, setLogAction] = useState("all");
  const [bulkPickOpen, setBulkPickOpen] = useState(false);
  const [bulkTypes, setBulkTypes] = useState<string[]>([documentTypes[0]!]);

  const profile = list.find((e) => e.id === profileId) ?? null;

  const filtered = list.filter((e) => {
    if (dept !== "all" && e.department !== dept) return false;
    if (search && !`${e.name} ${e.position} ${e.id}`.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const historyFor = (e: Employee) => history[e.id] ?? buildHistory(e);

  const addHistory = () => {
    if (!profile || !newHistory.detail.trim()) {
      toast.error("Enter the history details");
      return;
    }
    const entry: HistoryEntry = {
      id: `${profile.id}-${Date.now()}`,
      type: newHistory.type,
      date: newHistory.date,
      detail: newHistory.detail,
    };
    setHistory((h) => ({ ...h, [profile.id]: [...historyFor(profile), entry] }));
    setNewHistory({ ...newHistory, detail: "" });
    toast.success("History record created");
  };

  const deleteHistory = (id: string) => {
    if (!profile) return;
    setHistory((h) => ({
      ...h,
      [profile.id]: historyFor(profile).filter((x) => x.id !== id),
    }));
    toast.success("History record deleted");
  };

  const createEmployee = () => {
    if (!form.name.trim() || !form.position.trim()) {
      toast.error("Name and position are required");
      return;
    }
    const emp: Employee = {
      ...form,
      id: `EMP-${String(list.length + 1).padStart(4, "0")}`,
      status: "Active",
    };
    setList((prev) => [emp, ...prev]);
    setForm(emptyEmployee);
    setAddOpen(false);
    toast.success(`${emp.name} added to employee records`);
  };

  const removeEmployee = (id: string) => {
    setList((prev) => prev.filter((e) => e.id !== id));
    setProfileId(null);
    toast.success("Employee record deleted");
  };

  return (
    <div>
      <PageHeader
        eyebrow={isSuper ? "Super Admin · Core HR" : "Admin · Core HR"}
        title="Employee Records"
        description="201 files, employment details, records analytics and document generation."
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)}>
              <FileText className="mr-2 h-4 w-4" /> Generate reports
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Employees" value={list.length} icon={Users} tone="primary" />
        <StatCard
          label="Regular"
          value={list.filter((e) => e.employmentType === "Regular").length}
          tone="success"
        />
        <StatCard
          label="Probationary"
          value={list.filter((e) => e.employmentType === "Probationary").length}
          tone="gold"
        />
        <StatCard
          label="Inactive"
          value={list.filter((e) => e.status === "Inactive").length}
          icon={Users}
          tone="caution"
        />
      </div>

      <Tabs defaultValue="list" className="mt-6">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="list">Employee List</TabsTrigger>
          <TabsTrigger value="history">Record History</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold">Employee List</h2>
                  <p className="text-xs text-muted-foreground">
                    {selected.length > 0
                      ? `${selected.length} selected for bulk generation.`
                      : "Select employees to generate documents in bulk."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="w-56 pl-9"
                      placeholder="Search employee…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={dept} onValueChange={setDept}>
                    <SelectTrigger className="w-52">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All departments</SelectItem>
                      {departments.map((d) => (
                        <SelectItem key={d.code} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    disabled={selected.length === 0}
                    onClick={() => {
                      setBulkTypes([documentTypes[0]!]);
                      setBulkPickOpen(true);
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" /> Bulk generate
                  </Button>
                  <Button size="sm" onClick={() => setAddOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add employee
                  </Button>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10" />
                      <TableHead>Employee</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date Hired</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>
                          <Checkbox
                            checked={selected.includes(e.id)}
                            onCheckedChange={() => toggle(e.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-secondary text-[0.7rem]">
                                {initials(e.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{e.name}</p>
                              <p className="text-xs text-muted-foreground">{e.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{e.position}</TableCell>
                        <TableCell className="text-sm">{e.department}</TableCell>
                        <TableCell className="text-xs">{e.employmentType}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {e.dateHired}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              e.status === "Active"
                                ? "border-success/30 bg-success/15 text-success"
                                : "border-muted-foreground/30 bg-muted text-muted-foreground"
                            }
                          >
                            {e.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setProfileId(e.id);
                              setProfileTab("personal");
                              setHistoryFormOpen(false);
                            }}
                          >
                            View 201 file
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold">Record History</h2>
                  <p className="text-xs text-muted-foreground">
                    Log of who added, edited, or deleted employee records and files.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="w-64 pl-9"
                      placeholder="Search logs…"
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                    />
                  </div>
                  <Select value={logAction} onValueChange={setLogAction}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All actions</SelectItem>
                      <SelectItem value="Added">Added</SelectItem>
                      <SelectItem value="Edited">Edited</SelectItem>
                      <SelectItem value="Deleted">Deleted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target Record / File</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recordLogs
                      .filter(
                        (l) =>
                          (logAction === "all" || l.action === logAction) &&
                          `${l.actor} ${l.target} ${l.notes}`
                            .toLowerCase()
                            .includes(logSearch.toLowerCase()),
                      )
                      .map((l) => (
                        <TableRow key={l.id}>
                          <TableCell className="text-xs text-muted-foreground">
                            {l.timestamp}
                          </TableCell>
                          <TableCell className="text-sm">{l.actor}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                l.action === "Added"
                                  ? "border-success/30 bg-success/15 text-success"
                                  : l.action === "Edited"
                                    ? "border-gold/40 bg-gold-soft text-foreground"
                                    : "border-destructive/30 bg-destructive/15 text-destructive"
                              }
                            >
                              {l.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{l.target}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {l.notes}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 201 FILE */}
      <Dialog open={!!profile} onOpenChange={(o) => !o && setProfileId(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
          {profile &&
            (() => {
              const p = buildProfile(profile);
              const hist = historyFor(profile);
              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl">{profile.name}</DialogTitle>
                    <DialogDescription>
                      {profile.position} · {profile.department} · {profile.id}
                    </DialogDescription>
                  </DialogHeader>

                  {!isSuper && (
                    <p className="flex items-center gap-2 rounded-md border border-border bg-muted/40 p-2.5 text-xs text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Admin access: records are read-only and statutory government IDs are hidden.
                      You may create history entries.
                    </p>
                  )}

                  <Tabs value={profileTab} onValueChange={setProfileTab}>
                    <TabsList className="flex h-auto flex-wrap justify-start">
                      <TabsTrigger value="personal">Personal Information</TabsTrigger>
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                      <TabsTrigger value="history">Employment History</TabsTrigger>
                    </TabsList>

                    {isSuper && (
                      <div className="mt-3 flex flex-wrap gap-2 border-b border-border pb-3">
                        {profileTab === "personal" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toast.success("Personal information updated")}
                            >
                              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit personal data
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toast.success("Employment information updated")}
                            >
                              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit employment
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeEmployee(profile.id)}
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete record
                            </Button>
                          </>
                        )}
                        {profileTab === "documents" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast.success("Document uploaded to 201 file")}
                          >
                            <Plus className="mr-2 h-3.5 w-3.5" /> Add document
                          </Button>
                        )}
                        {profileTab === "history" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setHistoryFormOpen((v) => !v)}
                          >
                            <Plus className="mr-2 h-3.5 w-3.5" /> Create history entry
                          </Button>
                        )}
                      </div>
                    )}

                    <TabsContent value="personal" className="mt-3 space-y-3">
                      <Section title="Personal details">
                        <Field k="Full name" v={profile.name} />
                        <Field k="Birth date" v={p.birthDate} />
                        <Field k="Gender" v={p.gender} />
                        <Field k="Civil status" v={p.civilStatus} />
                        <Field k="Nationality" v={p.nationality} />
                      </Section>
                      <Section title="Contact information">
                        <Field k="Company email" v={profile.email} />
                        <Field k="Personal email" v={p.personalEmail} />
                        <Field k="Mobile number" v={profile.phone} />
                        <Field k="Home address" v={p.address} wide />
                      </Section>
                      <Section title="Family information">
                        <Field k="Family" v={p.family} wide />
                      </Section>
                      <Section title="Emergency contact">
                        <Field k="Name" v={p.emergencyName} />
                        <Field k="Relationship" v={p.emergencyRelation} />
                        <Field k="Contact number" v={p.emergencyPhone} />
                      </Section>

                      <Section title="Employment information">
                        <Field k="Employee number" v={profile.id} />
                        <Field k="Position" v={profile.position} />
                        <Field k="Department" v={profile.department} />
                        <Field k="Outlet / Branch" v="Oxford Suites Makati" />
                        <Field k="Status" v={profile.status} />
                        <Field k="Date hired" v={profile.dateHired} />
                        <Field k="Immediate supervisor" v={profile.supervisor} />
                        <Field k="Shift" v="AM Shift · 07:00 – 16:00" />
                        <Field k="Rate" v={`${profile.employmentType} · ${p.contract.split(" · ")[0]}`} />
                      </Section>

                      {isSuper ? (
                        <Section title="Government IDs">
                          <Field k="SSS number" v={p.sss} />
                          <Field k="Pag-IBIG MID" v={p.pagibig} />
                          <Field k="PhilHealth number" v={p.philhealth} />
                          <Field k="TIN" v={p.tin} />
                        </Section>
                      ) : (
                        <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                          Government IDs (SSS, Pag-IBIG, PhilHealth) are restricted to Super Admin.
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="documents" className="mt-3 space-y-3">
                      <div className="space-y-1.5">
                        {[
                          ...p.certificates.map((d) => ({ name: d, status: "Submitted" as const })),
                          ...p.licenses.map((d) => ({ name: d, status: "Submitted" as const })),
                          ...p.medical.map((d) => ({ name: d, status: "Submitted" as const })),
                          ...p.missing.map((d) => ({ name: d, status: "Missing" as const })),
                        ].map((doc, i) => (
                          <div
                            key={`${doc.name}-${i}`}
                            className="flex items-center justify-between rounded-md border border-border p-2.5"
                          >
                            <span className="text-sm">{doc.name}</span>
                            <Badge
                              variant="outline"
                              className={
                                doc.status === "Submitted"
                                  ? "border-success/30 bg-success/15 text-success"
                                  : "border-warning/40 bg-warning/20 text-warning-foreground"
                              }
                            >
                              {doc.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="history" className="mt-3 space-y-3">
                      {isSuper && historyFormOpen && (
                        <div className="rounded-md border border-border p-3">
                          <p className="eyebrow mb-2">New history entry</p>
                          <div className="grid gap-2 sm:grid-cols-3">
                            <Select
                              value={newHistory.type}
                              onValueChange={(v) =>
                                setNewHistory({ ...newHistory, type: v as HistoryEntry["type"] })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {["Promotion", "Transfer", "Employment"].map((t) => (
                                  <SelectItem key={t} value={t}>
                                    {t}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="date"
                              value={newHistory.date}
                              onChange={(e) =>
                                setNewHistory({ ...newHistory, date: e.target.value })
                              }
                            />
                            <Input
                              placeholder="Note (e.g. Front Desk Agent → Front Desk Supervisor)"
                              value={newHistory.detail}
                              onChange={(e) =>
                                setNewHistory({ ...newHistory, detail: e.target.value })
                              }
                            />
                          </div>
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              addHistory();
                              setHistoryFormOpen(false);
                            }}
                          >
                            <Plus className="mr-2 h-3.5 w-3.5" /> Save entry
                          </Button>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        {[...hist]
                          .sort((a, b) => (a.date < b.date ? 1 : -1))
                          .map((h) => (
                            <div
                              key={h.id}
                              className="flex items-center justify-between rounded-md border border-border p-2.5"
                            >
                              <div className="flex items-start gap-3">
                                <Badge variant="secondary" className="mt-0.5 shrink-0 text-[0.65rem]">
                                  {h.type}
                                </Badge>
                                <div>
                                  <p className="text-sm">{h.detail}</p>
                                  <p className="text-xs text-muted-foreground">{h.date}</p>
                                </div>
                              </div>
                              {isSuper && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 shrink-0"
                                  onClick={() => deleteHistory(h.id)}
                                  aria-label="Delete history entry"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          ))}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => toast("201 file exported as PDF")}>
                      Export 201 file
                    </Button>
                  </DialogFooter>

                </>
              );
            })()}
        </DialogContent>
      </Dialog>

      {/* ADD EMPLOYEE */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Add employee</DialogTitle>
            <DialogDescription>Create a new 201 file record.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Position</Label>
              <Input
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select
                value={form.department}
                onValueChange={(v) => setForm({ ...form, department: v })}
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
            <div className="space-y-1.5">
              <Label>Employment type</Label>
              <Select
                value={form.employmentType}
                onValueChange={(v) =>
                  setForm({ ...form, employmentType: v as Employee["employmentType"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Regular", "Probationary", "Contractual"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date hired</Label>
              <Input
                type="date"
                value={form.dateHired}
                onChange={(e) => setForm({ ...form, dateHired: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Immediate supervisor</Label>
              <Input
                value={form.supervisor}
                onChange={(e) => setForm({ ...form, supervisor: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone number</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createEmployee}>
              <Plus className="mr-2 h-4 w-4" /> Create employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BULK GENERATE RESULTS */}
      <Dialog open={generatedOpen} onOpenChange={setGeneratedOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Generated Documents</DialogTitle>
            <DialogDescription>
              Documents generated from the latest bulk generate action.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {generatedDocs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents generated yet.</p>
            ) : (
              generatedDocs.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between rounded-md border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{g.employeeName}</p>
                    <p className="text-xs text-muted-foreground">
                      {g.docType} · generated {g.generatedAt}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success(`${g.docType} for ${g.employeeName} downloaded`)}
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* BULK DOCUMENT PICKER */}
      <Dialog open={bulkPickOpen} onOpenChange={setBulkPickOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Choose documents</DialogTitle>
            <DialogDescription>
              Select which documents to generate for {selected.length} selected employee(s).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {documentTypes.map((d) => (
              <label
                key={d}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2 text-sm"
              >
                <Checkbox
                  checked={bulkTypes.includes(d)}
                  onCheckedChange={(v) =>
                    setBulkTypes((prev) =>
                      v ? [...prev, d] : prev.filter((x) => x !== d),
                    )
                  }
                />
                {d}
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkPickOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={bulkTypes.length === 0}
              onClick={() => {
                const targets = list.filter((e) => selected.includes(e.id));
                const batch: GeneratedDoc[] = targets.flatMap((e) =>
                  bulkTypes.map((t) => ({
                    id: `GEN-${Date.now()}-${e.id}-${t}`,
                    employeeName: e.name,
                    docType: t,
                    generatedAt: new Date().toLocaleString(),
                  })),
                );
                setGeneratedDocs((prev) => [...batch, ...prev]);
                setBulkPickOpen(false);
                setGeneratedOpen(true);
                toast.success(`${batch.length} document(s) generated`);
              }}
            >
              <Download className="mr-2 h-4 w-4" /> Generate {bulkTypes.length || ""} document
              {bulkTypes.length === 1 ? "" : "s"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BULK REPORTS */}

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Generate Reports</DialogTitle>
            <DialogDescription>
              Company-wide HR reports across all employee records.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {reportTypes.map((r) => (
              <div
                key={r}
                className="flex items-center justify-between rounded-md border border-border p-3"
              >
                <span className="text-sm">{r}</span>
                <Button size="sm" variant="outline" onClick={() => toast.success(`${r} generated`)}>
                  <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="eyebrow mb-2">{title}</p>
      <div className="grid gap-2 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ k, v, wide }: { k: string; v: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">{k}</p>
      <p className="text-sm">{v}</p>
    </div>
  );
}
