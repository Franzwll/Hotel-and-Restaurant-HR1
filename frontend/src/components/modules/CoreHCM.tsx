import { useState } from "react";
import { ArrowLeftRight, Building2, ChevronDown, GitBranch, Plus, Search, Send, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
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
import { Textarea } from "@/components/ui/textarea";
import {
  departments as seedDepartments,
  employees,
  orgChart,
  positions as seedPositions,
  type Department,
  type OrgNode,
  type Position,
} from "@/data/hr";
import { cn } from "@/lib/utils";
import { requisitionStore, useRequisitions } from "@/data/requisitions";

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** Top-down organizational chart with proper connector lines. */
function OrgNodeCard({
  node,
  root = false,
  onSelect,
}: {
  node: OrgNode;
  root?: boolean;
  onSelect: (n: OrgNode) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(node)}
      aria-label={`View details for ${node.name}`}
      className={cn(
        "inline-flex min-w-[190px] flex-col items-center rounded-md border px-4 py-3 text-center shadow-sm transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        root ? "border-primary bg-primary/10" : "border-border bg-card",
      )}
    >
      <Avatar className="h-9 w-9">
        <AvatarFallback
          className={cn(
            "text-[0.7rem]",
            root ? "bg-primary text-primary-foreground" : "bg-secondary",
          )}
        >
          {initialsOf(node.name)}
        </AvatarFallback>
      </Avatar>
      <p className="mt-2 text-sm font-medium leading-tight">{node.name}</p>
      <p className="text-xs text-muted-foreground">{node.title}</p>
    </button>
  );
}

function OrgTree({
  node,
  root = false,
  onSelect,
}: {
  node: OrgNode;
  root?: boolean;
  onSelect: (n: OrgNode) => void;
}) {
  const children = node.children ?? [];
  return (
    <div className="flex flex-col items-center">
      <OrgNodeCard node={node} root={root} onSelect={onSelect} />
      {children.length > 0 && (
        <>
          {/* stem down from parent */}
          <div className="h-6 w-px bg-border" />
          <div className="relative flex items-start justify-center gap-6">
            {/* horizontal connector spanning children */}
            {children.length > 1 && (
              <div className="absolute left-0 right-0 top-0 mx-auto h-px bg-border" />
            )}
            {children.map((c) => (
              <div key={c.name} className="relative flex flex-col items-center pt-6">
                <div className="absolute top-0 h-6 w-px bg-border" />
                <OrgTree node={c} onSelect={onSelect} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}


export function CoreHCM({ role }: { role: "superadmin" | "admin" }) {
  const [departments, setDepartments] = useState<Department[]>(seedDepartments);
  const [positions, setPositions] = useState<Position[]>(seedPositions);
  const requisitions = useRequisitions();

  const [selectedDept, setSelectedDept] = useState<string>(departments[0]!.name);
  const [posFilter, setPosFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [openPositionId, setOpenPositionId] = useState<string | null>(null);

  const [createDeptOpen, setCreateDeptOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: "", description: "", head: "", budget: "" });
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [transferEmployee, setTransferEmployee] = useState<(typeof employees)[number] | null>(null);
  const [transfer, setTransfer] = useState({ department: "", date: "2026-08-16" });
  const [createPosOpen, setCreatePosOpen] = useState(false);
  const [posForm, setPosForm] = useState({
    title: "",
    department: seedDepartments[0]!.name,
    level: "Rank & File",
    headcount: 1,
    salaryBand: "",
  });
  const [orgNode, setOrgNode] = useState<OrgNode | null>(null);
  const [requestFor, setRequestFor] = useState<Position | null>(null);
  const [reqForm, setReqForm] = useState({ count: 1, urgency: "Normal", justification: "" });

  const totalStaff = departments.reduce((t, d) => t + d.staff, 0);
  const totalReq = departments.reduce((t, d) => t + d.openRequisitions, 0) + requisitions.length;

  const deletePosition = (id: string) => {
    if (role !== "superadmin") {
      toast.error("Only a Super Admin can delete a job position");
      return;
    }
    setPositions((prev) => prev.filter((p) => p.id !== id));
    toast.success(`Position ${id} deleted`);
  };

  const membersOf = (positionTitle: string) =>
    employees.filter((e) => e.position === positionTitle);

  const q = query.trim().toLowerCase();

  const deptMatchesQuery = (d: Department) =>
    !q ||
    d.name.toLowerCase().includes(q) ||
    positions.some((p) => p.department === d.name && p.title.toLowerCase().includes(q)) ||
    employees.some((e) => e.department === d.name && e.name.toLowerCase().includes(q));

  const posMatchesQuery = (p: Position) =>
    !q ||
    p.title.toLowerCase().includes(q) ||
    p.department.toLowerCase().includes(q) ||
    membersOf(p.title).some((e) => e.name.toLowerCase().includes(q));

  const visibleDepartments = departments.filter(deptMatchesQuery);

  const visiblePositions = positions.filter(
    (p) =>
      (selectedDept === "all" || p.department === selectedDept) &&
      (posFilter === "all" || p.title === posFilter) &&
      posMatchesQuery(p),
  );

  return (
    <div>
      <PageHeader
        eyebrow={role === "superadmin" ? "Super Admin · Core HR" : "Admin · Core HR"}
        title="Core HCM"
        description="Organization structure, departments, job positions, and roster transfers."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Departments" value={departments.length} icon={Building2} tone="primary" />
        <StatCard label="Total Headcount" value={totalStaff} icon={Users} tone="gold" />
        <StatCard label="Job Positions" value={positions.length} icon={GitBranch} />
        <StatCard label="Open Requisitions" value={totalReq} tone="caution" />
      </div>

      <Tabs defaultValue="org" className="mt-6">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="org">Organizational Chart</TabsTrigger>
          <TabsTrigger value="dept-positions">Departments &amp; Positions</TabsTrigger>
        </TabsList>

        {/* ORG CHART */}
        <TabsContent value="org" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold">Organizational Chart</h2>
              <p className="text-xs text-muted-foreground">
                Oxford Suites Makati reporting structure — General Manager down to line staff.
              </p>
              <div className="mt-8 overflow-x-auto pb-4">
                <div className="mx-auto flex min-w-max justify-center px-6">
                  <OrgTree node={orgChart} root onSelect={setOrgNode} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DEPARTMENTS & POSITIONS */}
        <TabsContent value="dept-positions" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search department, position, or employee…"
                className="pl-8"
              />
            </div>
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="All departments" />
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
            <Select value={posFilter} onValueChange={setPosFilter}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="All positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All positions</SelectItem>
                {positions.map((p) => (
                  <SelectItem key={p.id} value={p.title}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setCreateDeptOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create department
              </Button>
              <Button size="sm" onClick={() => setCreatePosOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create job position
              </Button>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
            {/* DEPARTMENT LIST */}
            <Card className="border-border/70">
              <CardContent className="p-5">
                <h2 className="font-display text-xl font-semibold">Departments</h2>
                <p className="text-xs text-muted-foreground">
                  Select a department to view its job positions.
                </p>
                <div className="mt-3 space-y-2">
                  {visibleDepartments.map((d) => (
                    <button
                      key={d.code}
                      type="button"
                      onClick={() => setSelectedDept(d.name)}
                      className={cn(
                        "w-full rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
                        selectedDept === d.name
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{d.name}</p>
                        <Badge variant="secondary">{d.staff} staff</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{d.description}</p>
                      <div className="mt-2 flex items-center justify-between text-[0.7rem] text-muted-foreground">
                        <span>Head: {d.head}</span>
                        <span>{positions.filter((p) => p.department === d.name).length} positions</span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditDept(d);
                          }}
                          className="text-[0.7rem] font-medium text-primary hover:underline"
                        >
                          Edit
                        </span>
                      </div>
                    </button>
                  ))}
                  {visibleDepartments.length === 0 && (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No departments match your search.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* POSITIONS FOR SELECTED DEPARTMENT */}
            <Card className="border-border/70">
              <CardContent className="p-5">
                <h2 className="font-display text-xl font-semibold">
                  {selectedDept === "all" ? "Job Positions" : `${selectedDept} — Positions`}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Expand a position to see the employees who hold it.
                  {role !== "superadmin" && " Deletion is restricted to Super Admin."}
                </p>

                <div className="mt-3 space-y-2">
                  {visiblePositions.map((p) => {
                    const vacant = p.headcount - p.filled;
                    const requested = requisitions.some((r) => r.position === p.title);
                    const members = membersOf(p.title);
                    const isOpen = openPositionId === p.id;
                    return (
                      <Collapsible
                        key={p.id}
                        open={isOpen}
                        onOpenChange={(o) => setOpenPositionId(o ? p.id : null)}
                      >
                        <div className="rounded-md border border-border/70">
                          <div className="flex w-full items-center justify-between gap-3 px-3 py-2.5">
                            <CollapsibleTrigger asChild>
                              <button
                                type="button"
                                className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="truncate text-sm font-medium">{p.title}</p>
                                    <Badge variant="outline" className="text-[0.65rem]">
                                      {p.level}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {p.department} · {p.salaryBand}
                                  </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-3">
                                  <div className="w-28">
                                    <Progress
                                      value={(p.filled / p.headcount) * 100}
                                      className="h-2"
                                    />
                                    <p className="mt-1 text-[0.65rem] text-muted-foreground">
                                      {p.filled} of {p.headcount}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={
                                      vacant > 0
                                        ? "border-caution/30 bg-caution/15 text-caution"
                                        : "border-success/30 bg-success/15 text-success"
                                    }
                                  >
                                    {vacant > 0 ? `${vacant} to fill` : "Fully staffed"}
                                  </Badge>
                                  <ChevronDown
                                    className={cn(
                                      "h-4 w-4 text-muted-foreground transition-transform",
                                      isOpen && "rotate-180",
                                    )}
                                  />
                                </div>
                              </button>
                            </CollapsibleTrigger>
                            <div className="flex shrink-0 items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={vacant === 0 || requested}
                                onClick={() => {
                                  setRequestFor(p);
                                  setReqForm({
                                    count: vacant,
                                    urgency: "Normal",
                                    justification: "",
                                  });
                                }}
                              >
                                <Send className="mr-1.5 h-3.5 w-3.5" />
                                {requested ? "Requested" : "Request vacancy"}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                title={
                                  role === "superadmin" ? "Delete position" : "Super Admin only"
                                }
                                onClick={() => deletePosition(p.id)}
                              >
                                <Trash2
                                  className={
                                    role === "superadmin"
                                      ? "h-4 w-4 text-destructive"
                                      : "h-4 w-4 text-muted-foreground"
                                  }
                                />
                              </Button>
                            </div>
                          </div>
                          <CollapsibleContent className="border-t border-border/70 px-3 py-3">
                            <p className="eyebrow">Members ({members.length})</p>

                            {members.length > 0 ? (
                              <ul className="mt-2 space-y-1.5">
                                {members.map((e) => (
                                  <li
                                    key={e.id}
                                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-border/60 px-2.5 py-1.5 text-xs sm:flex sm:flex-wrap"
                                  >
                                    <div className="flex min-w-0 items-center gap-2 sm:w-52">
                                      <Avatar className="h-6 w-6 shrink-0">
                                        <AvatarFallback className="bg-primary/10 text-[0.6rem] text-primary">
                                          {initialsOf(e.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="truncate font-medium">{e.name}</span>
                                    </div>
                                    <span className="text-muted-foreground sm:w-24">{e.id}</span>
                                    <span className="truncate text-muted-foreground sm:w-32">
                                      {e.department}
                                    </span>
                                    <span className="truncate text-muted-foreground sm:w-40">
                                      {e.position}
                                    </span>
                                    <Badge variant="outline" className="shrink-0 text-[0.6rem]">
                                      {e.employmentType} {e.status}
                                    </Badge>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 shrink-0 px-2 text-[0.7rem] sm:ml-auto"
                                      onClick={() => {
                                        setTransferEmployee(e);
                                        setTransfer({ department: "", date: "2026-08-16" });
                                      }}
                                    >
                                      <ArrowLeftRight className="mr-1.5 h-3 w-3" /> Transfer
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="mt-2 text-xs text-muted-foreground">
                                No employees currently hold this position.
                              </p>
                            )}
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  })}
                  {visiblePositions.length === 0 && (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No positions match your filters.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>


      {/* CREATE DEPARTMENT */}
      <Dialog open={createDeptOpen} onOpenChange={setCreateDeptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Create Department</DialogTitle>
            <DialogDescription>Adds a new department to the property structure.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Department name</Label>
              <Input
                value={deptForm.name}
                onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                placeholder="e.g. Banquet & Events"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={deptForm.description}
                onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                placeholder="Scope of the department…"
              />
            </div>
            <div className="space-y-2">
              <Label>Department head</Label>
              <Select
                value={deptForm.head}
                onValueChange={(v) => setDeptForm({ ...deptForm, head: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign a head" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.name}>
                      {e.name} — {e.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Annual budget (₱)</Label>
              <Input
                type="number"
                value={deptForm.budget}
                onChange={(e) => setDeptForm({ ...deptForm, budget: e.target.value })}
                placeholder="2500000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDeptOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!deptForm.name || !deptForm.head) {
                  toast.error("Department name and head are required.");
                  return;
                }
                setDepartments((prev) => [
                  ...prev,
                  {
                    code: `DEP-${deptForm.name.slice(0, 2).toUpperCase()}`,
                    name: deptForm.name,
                    description: deptForm.description || "Newly created department.",
                    head: deptForm.head,
                    staff: 0,
                    openRequisitions: 0,
                    budget: Number(deptForm.budget) || 0,
                  },
                ]);
                toast.success(`${deptForm.name} department created`);
                setDeptForm({ name: "", description: "", head: "", budget: "" });
                setCreateDeptOpen(false);
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT DEPARTMENT */}
      <Dialog open={!!editDept} onOpenChange={(o) => !o && setEditDept(null)}>
        <DialogContent>
          {editDept && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Edit {editDept.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Department name</Label>
                  <Input
                    value={editDept.name}
                    onChange={(e) => setEditDept({ ...editDept, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    rows={3}
                    value={editDept.description}
                    onChange={(e) => setEditDept({ ...editDept, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department head</Label>
                  <Select
                    value={editDept.head}
                    onValueChange={(v) => setEditDept({ ...editDept, head: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((e) => (
                        <SelectItem key={e.id} value={e.name}>
                          {e.name} — {e.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Staff count</Label>
                    <Input
                      type="number"
                      value={editDept.staff}
                      onChange={(e) =>
                        setEditDept({ ...editDept, staff: Number(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Annual budget (₱)</Label>
                    <Input
                      type="number"
                      value={editDept.budget}
                      onChange={(e) =>
                        setEditDept({ ...editDept, budget: Number(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDept(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setDepartments((prev) =>
                      prev.map((d) => (d.code === editDept.code ? editDept : d)),
                    );
                    toast.success(`${editDept.name} updated`);
                    setEditDept(null);
                  }}
                >
                  Save changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ORG NODE DETAILS */}
      <Dialog open={!!orgNode} onOpenChange={(o) => !o && setOrgNode(null)}>
        <DialogContent>
          {orgNode && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{orgNode.name}</DialogTitle>
                <DialogDescription>{orgNode.title}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <span className="text-muted-foreground">Direct reports</span>
                  <span className="font-medium">{orgNode.children?.length ?? 0}</span>
                </div>
                {(orgNode.children ?? []).length > 0 && (
                  <div className="rounded-md border border-border p-3">
                    <p className="eyebrow mb-2">Reports to {orgNode.name}</p>
                    <ul className="space-y-1.5">
                      {(orgNode.children ?? []).map((c) => (
                        <li key={c.name} className="flex items-center gap-2 text-xs">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-secondary text-[0.6rem]">
                              {initialsOf(c.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{c.name}</span>
                          <span className="text-muted-foreground">— {c.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOrgNode(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>


      {/* TRANSFER EMPLOYEE */}
      <Dialog open={!!transferEmployee} onOpenChange={(o) => !o && setTransferEmployee(null)}>
        <DialogContent>
          {transferEmployee && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  Transfer {transferEmployee.name}
                </DialogTitle>
                <DialogDescription>
                  Currently in {transferEmployee.department} · {transferEmployee.position}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>New department</Label>
                  <Select
                    value={transfer.department}
                    onValueChange={(v) => setTransfer({ ...transfer, department: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments
                        .filter((d) => d.name !== transferEmployee.department)
                        .map((d) => (
                          <SelectItem key={d.code} value={d.name}>
                            {d.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Effective date</Label>
                  <Input
                    type="date"
                    value={transfer.date}
                    onChange={(e) => setTransfer({ ...transfer, date: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTransferEmployee(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!transfer.department) {
                      toast.error("Select a destination department.");
                      return;
                    }
                    toast.success(
                      `${transferEmployee.name} transferred to ${transfer.department} effective ${transfer.date}`,
                    );
                    setTransferEmployee(null);
                  }}
                >
                  Confirm transfer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* CREATE POSITION */}
      <Dialog open={createPosOpen} onOpenChange={setCreatePosOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Create Job Position</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Position title</Label>
              <Input
                value={posForm.title}
                onChange={(e) => setPosForm({ ...posForm, title: e.target.value })}
                placeholder="e.g. Banquet Server"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={posForm.department}
                  onValueChange={(v) => setPosForm({ ...posForm, department: v })}
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
              <div className="space-y-2">
                <Label>Level</Label>
                <Select
                  value={posForm.level}
                  onValueChange={(v) => setPosForm({ ...posForm, level: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Rank & File", "Supervisory", "Managerial", "Executive"].map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Approved headcount</Label>
                <Input
                  type="number"
                  value={posForm.headcount}
                  onChange={(e) =>
                    setPosForm({ ...posForm, headcount: Number(e.target.value) || 1 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Salary band</Label>
                <Input
                  value={posForm.salaryBand}
                  onChange={(e) => setPosForm({ ...posForm, salaryBand: e.target.value })}
                  placeholder="₱16,000 – ₱19,000"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatePosOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!posForm.title) {
                  toast.error("Position title is required.");
                  return;
                }
                setPositions((prev) => [
                  ...prev,
                  {
                    id: `POS-${String(prev.length + 1).padStart(3, "0")}`,
                    title: posForm.title,
                    department: posForm.department,
                    level: posForm.level as Position["level"],
                    headcount: posForm.headcount,
                    filled: 0,
                    salaryBand: posForm.salaryBand || "To be defined",
                  },
                ]);
                toast.success(`${posForm.title} created`);
                setPosForm({
                  title: "",
                  department: departments[0]!.name,
                  level: "Rank & File",
                  headcount: 1,
                  salaryBand: "",
                });
                setCreatePosOpen(false);
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REQUEST VACANCY */}
      <Dialog open={!!requestFor} onOpenChange={(o) => !o && setRequestFor(null)}>
        <DialogContent>
          {requestFor && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Request Vacancy</DialogTitle>
                <DialogDescription>
                  {requestFor.title} · {requestFor.department} ·{" "}
                  {requestFor.headcount - requestFor.filled} seat(s) unfilled
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Openings requested</Label>
                    <Input
                      type="number"
                      min={1}
                      max={requestFor.headcount - requestFor.filled}
                      value={reqForm.count}
                      onChange={(e) =>
                        setReqForm({ ...reqForm, count: Number(e.target.value) || 1 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Urgency</Label>
                    <Select
                      value={reqForm.urgency}
                      onValueChange={(v) => setReqForm({ ...reqForm, urgency: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Normal", "High", "Urgent"].map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Justification</Label>
                  <Textarea
                    rows={3}
                    value={reqForm.justification}
                    onChange={(e) => setReqForm({ ...reqForm, justification: e.target.value })}
                    placeholder="Reason for the additional headcount…"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRequestFor(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    requisitionStore.add({
                      id: `REQ-${1000 + requisitions.length + 1}`,
                      position: requestFor.title,
                      department: requestFor.department,
                      count: reqForm.count,
                      urgency: reqForm.urgency,
                      justification: reqForm.justification,
                      status: "Pending",
                      requestedAt: new Date().toISOString().slice(0, 10),
                    });
                    toast.success("Vacancy requisition submitted to Recruitment Management", {
                      description: `${requestFor.title} · ${reqForm.count} opening(s)`,
                    });
                    setRequestFor(null);
                  }}
                >
                  Submit request
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
