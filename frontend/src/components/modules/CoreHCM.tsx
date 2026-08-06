import { useState } from "react";
import {
  ArrowLeftRight,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Plus,
  Search,
  Send,
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import { TablePagination } from "@/components/ui/table-pagination";
import { DEFAULT_PAGE_SIZE, usePagination } from "@/hooks/usePagination";
import { Textarea } from "@/components/ui/textarea";
import {
  departments as seedDepartments,
  employees,
  orgChart,
  positions as seedPositions,
  type Department,
  type OrgNode,
  type Position,
  type Employee,
} from "@/data/hr";
import { cn } from "@/lib/utils";
import { requisitionStore, useRequisitions } from "@/data/requisitions";
import { SortHead, useSort } from "@/components/portal/sortable";

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** Standalone Employee List tab component */
function EmployeeListTab() {
  const [empSearch, setEmpSearch] = useState("");
  const [empDeptFilter, setEmpDeptFilter] = useState("all");
  const [empStatusFilter, setEmpStatusFilter] = useState("all");

  const filteredEmployees = employees.filter((e: Employee) => {
    const q = empSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q);
    const matchesDept = empDeptFilter === "all" || e.department === empDeptFilter;
    const matchesStatus = empStatusFilter === "all" || e.status === empStatusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const empPage = usePagination(filteredEmployees);
  const deptOptions = Array.from(new Set(employees.map((e: Employee) => e.department))).sort();

  return (
    <Card className="border-border/70">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold">Employee List</h2>
            <p className="text-xs text-muted-foreground">
              {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? "s" : ""} shown
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[14rem]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search name, ID, position…"
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
              />
            </div>
            <Select value={empDeptFilter} onValueChange={setEmpDeptFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {deptOptions.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={empStatusFilter} onValueChange={setEmpStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date Hired</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empPage.pageItems.map((e: Employee) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs">{e.id}</TableCell>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.department}</TableCell>
                  <TableCell className="text-sm">{e.position}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        e.employmentType === "Regular"
                          ? "border-success/40 text-success"
                          : e.employmentType === "Probationary"
                          ? "border-gold/40 text-gold"
                          : "border-border"
                      }
                    >
                      {e.employmentType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{e.dateHired}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        e.status === "Active"
                          ? "border-success/40 bg-success/10 text-success"
                          : "border-border text-muted-foreground"
                      }
                    >
                      {e.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    No employees match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          page={empPage.page}
          pageCount={empPage.pageCount}
          from={empPage.from}
          to={empPage.to}
          total={empPage.total}
          label="employees"
          onPageChange={empPage.setPage}
        />
      </CardContent>
    </Card>
  );
}

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

  // Requisitions tab: filters, search, and pagination
  const [reqDeptFilter, setReqDeptFilter] = useState("all");
  const [reqDateFilter, setReqDateFilter] = useState("all");
  const [reqQuery, setReqQuery] = useState("");
  const [reqPage, setReqPage] = useState(1);
  const REQ_PAGE_SIZE = DEFAULT_PAGE_SIZE;

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

  const deptSort = useSort(visibleDepartments, {
    name: (d: Department) => d.name,
    head: (d: Department) => d.head,
    staff: (d: Department) => d.staff,
    positions: (d: Department) => positions.filter((p) => p.department === d.name).length,
  });

  const posSort = useSort(visiblePositions, {
    title: (p: Position) => p.title,
    department: (p: Position) => p.department,
    level: (p: Position) => p.level,
    headcount: (p: Position) => p.headcount,
    filled: (p: Position) => p.filled,
    vacant: (p: Position) => p.headcount - p.filled,
  });

  // ----- Requisitions tab derived data -----
  const reqDeptOptions = Array.from(new Set(requisitions.map((r) => r.department))).sort();

  const withinDateRange = (dateStr: string, range: string) => {
    if (range === "all") return true;
    const days = Number(range);
    const diffDays = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= days;
  };

  const rq = reqQuery.trim().toLowerCase();
  const filteredRequisitions = requisitions.filter(
    (r) =>
      (reqDeptFilter === "all" || r.department === reqDeptFilter) &&
      withinDateRange(r.requestedAt, reqDateFilter) &&
      (!rq ||
        r.id.toLowerCase().includes(rq) ||
        r.position.toLowerCase().includes(rq) ||
        r.department.toLowerCase().includes(rq) ||
        r.status.toLowerCase().includes(rq)),
  );

  const reqSort = useSort(filteredRequisitions, {
    id: (r) => r.id,
    position: (r) => r.position,
    department: (r) => r.department,
    count: (r) => r.count,
    urgency: (r) => r.urgency,
    status: (r) => r.status,
    requestedAt: (r) => r.requestedAt,
  });

  const reqTotalPages = Math.max(1, Math.ceil(reqSort.sorted.length / REQ_PAGE_SIZE));
  const reqCurrentPage = Math.min(reqPage, reqTotalPages);
  const reqPageRows = reqSort.sorted.slice(
    (reqCurrentPage - 1) * REQ_PAGE_SIZE,
    reqCurrentPage * REQ_PAGE_SIZE,
  );

  const deptPage = usePagination(deptSort.sorted);
  const posPage = usePagination(posSort.sorted);

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
          <TabsTrigger value="employee-list">Employee List</TabsTrigger>
          <TabsTrigger value="requisitions">Requisitions</TabsTrigger>
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

        {/* EMPLOYEE LIST */}
        <TabsContent value="employee-list" className="mt-4">
          <EmployeeListTab />
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
                <div className="mt-3 overflow-x-auto rounded-md border border-border/70">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortHead sortKey="name" sort={deptSort.sort} onSort={deptSort.toggle}>
                          Department
                        </SortHead>
                        <SortHead sortKey="head" sort={deptSort.sort} onSort={deptSort.toggle}>
                          Head
                        </SortHead>
                        <SortHead
                          sortKey="staff"
                          sort={deptSort.sort}
                          onSort={deptSort.toggle}
                          align="right"
                        >
                          Staff
                        </SortHead>
                        <SortHead
                          sortKey="positions"
                          sort={deptSort.sort}
                          onSort={deptSort.toggle}
                          align="right"
                        >
                          Positions
                        </SortHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deptPage.pageItems.map((d) => (
                        <TableRow
                          key={d.code}
                          onClick={() => setSelectedDept(d.name)}
                          className={cn(
                            "cursor-pointer",
                            selectedDept === d.name && "bg-primary/5",
                          )}
                        >
                          <TableCell>
                            <p className="font-medium">{d.name}</p>
                            <p className="text-xs text-muted-foreground">{d.description}</p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{d.head}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">{d.staff}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {positions.filter((p) => p.department === d.name).length}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditDept(d);
                              }}
                              className="text-xs font-medium text-primary hover:underline"
                            >
                              Edit
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                      {deptSort.sorted.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-6 text-center text-sm text-muted-foreground"
                          >
                            No departments match your search.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <TablePagination
                  page={deptPage.page}
                  pageCount={deptPage.pageCount}
                  from={deptPage.from}
                  to={deptPage.to}
                  total={deptPage.total}
                  label="departments"
                  onPageChange={deptPage.setPage}
                />
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

                <div className="mt-3 overflow-x-auto rounded-md border border-border/70">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortHead sortKey="title" sort={posSort.sort} onSort={posSort.toggle}>
                          Position
                        </SortHead>
                        <SortHead sortKey="department" sort={posSort.sort} onSort={posSort.toggle}>
                          Department
                        </SortHead>
                        <SortHead sortKey="level" sort={posSort.sort} onSort={posSort.toggle}>
                          Level
                        </SortHead>
                        <SortHead
                          sortKey="headcount"
                          sort={posSort.sort}
                          onSort={posSort.toggle}
                          align="right"
                        >
                          Headcount
                        </SortHead>
                        <SortHead
                          sortKey="vacant"
                          sort={posSort.sort}
                          onSort={posSort.toggle}
                          align="right"
                        >
                          Status
                        </SortHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posPage.pageItems.map((p) => {
                        const vacant = p.headcount - p.filled;
                        const requested = requisitions.some((r) => r.position === p.title);
                        const members = membersOf(p.title);
                        const isOpen = openPositionId === p.id;
                        return (
                          <>
                            <TableRow
                              key={p.id}
                              className="cursor-pointer"
                              onClick={() => setOpenPositionId(isOpen ? null : p.id)}
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <ChevronDown
                                    className={cn(
                                      "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
                                      isOpen && "rotate-180",
                                    )}
                                  />
                                  <span className="truncate text-sm font-medium">{p.title}</span>
                                </div>
                                <p className="ml-5 text-xs text-muted-foreground">{p.salaryBand}</p>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {p.department}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-[0.65rem]">
                                  {p.level}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="ml-auto w-28">
                                  <Progress
                                    value={(p.filled / p.headcount) * 100}
                                    className="h-2"
                                  />
                                  <p className="mt-1 text-[0.65rem] text-muted-foreground">
                                    {p.filled} of {p.headcount}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
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
                              </TableCell>
                              <TableCell
                                className="text-right"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex shrink-0 items-center justify-end gap-1.5">
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
                              </TableCell>
                            </TableRow>
                            {isOpen && (
                              <TableRow key={`${p.id}-members`}>
                                <TableCell colSpan={6} className="bg-muted/30 px-4 py-3">
                                  <p className="eyebrow">Members ({members.length})</p>
                                  {members.length > 0 ? (
                                    <ul className="mt-2 space-y-1.5">
                                      {members.map((e) => (
                                        <li
                                          key={e.id}
                                          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-border/60 bg-card px-2.5 py-1.5 text-xs sm:flex sm:flex-wrap"
                                        >
                                          <div className="flex min-w-0 items-center gap-2 sm:w-52">
                                            <Avatar className="h-6 w-6 shrink-0">
                                              <AvatarFallback className="bg-primary/10 text-[0.6rem] text-primary">
                                                {initialsOf(e.name)}
                                              </AvatarFallback>
                                            </Avatar>
                                            <span className="truncate font-medium">{e.name}</span>
                                          </div>
                                          <span className="text-muted-foreground sm:w-24">
                                            {e.id}
                                          </span>
                                          <span className="truncate text-muted-foreground sm:w-32">
                                            {e.department}
                                          </span>
                                          <span className="truncate text-muted-foreground sm:w-40">
                                            {e.position}
                                          </span>
                                          <Badge
                                            variant="outline"
                                            className="shrink-0 text-[0.6rem]"
                                          >
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
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        );
                      })}
                      {posSort.sorted.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="py-6 text-center text-sm text-muted-foreground"
                          >
                            No positions match your filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <TablePagination
                  page={posPage.page}
                  pageCount={posPage.pageCount}
                  from={posPage.from}
                  to={posPage.to}
                  total={posPage.total}
                  label="positions"
                  onPageChange={posPage.setPage}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* REQUISITIONS */}
        <TabsContent value="requisitions" className="mt-4 space-y-4">
          <Card className="border-border/70">
            <CardContent className="p-5">
              <h2 className="font-display text-xl font-semibold">Requisitions</h2>
              <p className="text-xs text-muted-foreground">
                All open and historical vacancy requisitions submitted for approval.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Select
                  value={reqDeptFilter}
                  onValueChange={(v) => {
                    setReqDeptFilter(v);
                    setReqPage(1);
                  }}
                >
                  <SelectTrigger className="w-52">
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All departments</SelectItem>
                    {reqDeptOptions.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={reqDateFilter}
                  onValueChange={(v) => {
                    setReqDateFilter(v);
                    setReqPage(1);
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative ml-auto w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={reqQuery}
                    onChange={(e) => {
                      setReqQuery(e.target.value);
                      setReqPage(1);
                    }}
                    placeholder="Search requisition, position, department…"
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="mt-4 overflow-x-auto rounded-md border border-border/70">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortHead sortKey="id" sort={reqSort.sort} onSort={reqSort.toggle}>
                        ID
                      </SortHead>
                      <SortHead sortKey="position" sort={reqSort.sort} onSort={reqSort.toggle}>
                        Position
                      </SortHead>
                      <SortHead sortKey="department" sort={reqSort.sort} onSort={reqSort.toggle}>
                        Department
                      </SortHead>
                      <SortHead
                        sortKey="count"
                        sort={reqSort.sort}
                        onSort={reqSort.toggle}
                        align="right"
                      >
                        Openings
                      </SortHead>
                      <SortHead sortKey="urgency" sort={reqSort.sort} onSort={reqSort.toggle}>
                        Urgency
                      </SortHead>
                      <SortHead sortKey="status" sort={reqSort.sort} onSort={reqSort.toggle}>
                        Status
                      </SortHead>
                      <SortHead sortKey="requestedAt" sort={reqSort.sort} onSort={reqSort.toggle}>
                        Requested
                      </SortHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reqPageRows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.id}</TableCell>
                        <TableCell>{r.position}</TableCell>
                        <TableCell className="text-muted-foreground">{r.department}</TableCell>
                        <TableCell className="text-right">{r.count}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              r.urgency === "Urgent" || r.urgency === "High"
                                ? "border-caution/30 bg-caution/15 text-caution"
                                : "border-border text-muted-foreground"
                            }
                          >
                            {r.urgency}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              r.status === "Approved"
                                ? "border-success/30 bg-success/15 text-success"
                                : r.status === "Converted"
                                  ? "border-primary/30 bg-primary/10 text-primary"
                                  : "border-border text-muted-foreground"
                            }
                          >
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{r.requestedAt}</TableCell>
                      </TableRow>
                    ))}
                    {reqPageRows.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="py-6 text-center text-sm text-muted-foreground"
                        >
                          No requisitions match your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <TablePagination
                page={reqCurrentPage}
                pageCount={reqTotalPages}
                from={reqSort.sorted.length === 0 ? 0 : (reqCurrentPage - 1) * REQ_PAGE_SIZE + 1}
                to={Math.min(reqCurrentPage * REQ_PAGE_SIZE, reqSort.sorted.length)}
                total={reqSort.sorted.length}
                label="requisitions"
                onPageChange={setReqPage}
              />
            </CardContent>
          </Card>
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
