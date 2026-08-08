import { useState } from "react";
import {
  ArrowLeftRight,
  Award,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileCheck,
  FileText,
  Filter,
  GitBranch,
  Info,
  Layers,
  Plus,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  UserX,
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
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  employees as seedEmployees,
  orgChart as seedOrgChart,
  positions as seedPositions,
  salaryGrades as seedSalaryGrades,
  hr3Recommendations as seedHr3Recommendations,
  type Department,
  type OrgNode,
  type Position,
  type Employee,
  type SalaryGrade,
  type HR3Recommendation,
} from "@/data/hr";
import {
  createProbationaryUserAccount,
  deactivateUserAccount,
  addAuditLog,
  auditLogs,
  type AuditEntry,
} from "@/data/users";
import { cn } from "@/lib/utils";
import { requisitionStore, useRequisitions } from "@/data/requisitions";
import { type Role } from "@/lib/nav";

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const formatMoney = (val: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(val);

/* =========================================================================
   1. ORGANIZATIONAL CHART MODULE (Org Chart, Employee List, Lifecycle Logs)
   ========================================================================= */

export function OrgChartModule({ role = "admin" }: { role?: Role }) {
  const [activeTab, setActiveTab] = useState<"org" | "employees" | "logs">("org");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Core HCM · Human Capital Management"
        title="Organizational Structure & Employee Roster"
        description="Visualize reporting hierarchy, manage employee regularization & promotions, and track lifecycle transitions."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "org" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("org")}
            >
              <GitBranch className="mr-2 h-4 w-4" /> Org Chart
            </Button>
            <Button
              variant={activeTab === "employees" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("employees")}
            >
              <Users className="mr-2 h-4 w-4" /> Employee List
            </Button>
            <Button
              variant={activeTab === "logs" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("logs")}
            >
              <FileText className="mr-2 h-4 w-4" /> Lifecycle Logs
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/60 p-1">
          <TabsTrigger value="org">Org Chart</TabsTrigger>
          <TabsTrigger value="employees">Employee List</TabsTrigger>
          <TabsTrigger value="logs">Lifecycle Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="org" className="space-y-6">
          <OrgChartVisualizer />
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <EmployeeListManager role={role} />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <LifecycleLogsViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* --- Org Chart Visualizer Sub-Component --- */
function OrgChartVisualizer() {
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);

  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <h2 className="font-display text-xl font-semibold">Hierarchy Chart</h2>
            <p className="text-xs text-muted-foreground">
              Property reporting lines from General Management to department staff.
            </p>
          </div>
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-xs">
            Interactive Hierarchy Tree
          </Badge>
        </div>

        <div className="overflow-x-auto py-8">
          <OrgTree node={seedOrgChart} root onSelect={setSelectedNode} />
        </div>

        {/* Node detail modal */}
        <Dialog open={!!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {selectedNode ? initialsOf(selectedNode.name) : ""}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-display text-xl font-bold">{selectedNode?.name}</div>
                  <div className="text-xs font-medium text-muted-foreground">{selectedNode?.title}</div>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2 text-sm">
              <div className="flex justify-between border-b border-border/50 py-2">
                <span className="text-muted-foreground">Direct Reports:</span>
                <span className="font-semibold">{selectedNode?.children?.length || 0} teams</span>
              </div>
              <div className="flex justify-between border-b border-border/50 py-2">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="outline" className="border-success/40 bg-success/10 text-success">
                  Active Duty
                </Badge>
              </div>
              {selectedNode?.children && selectedNode.children.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Supervised Personnel:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.children.map((child) => (
                      <Badge key={child.name} variant="secondary" className="text-xs font-normal">
                        {child.name} ({child.title})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => setSelectedNode(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function OrgNodeCard({ node, root = false, onSelect }: { node: OrgNode; root?: boolean; onSelect: (n: OrgNode) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(node)}
      className={cn(
        "inline-flex min-w-[200px] flex-col items-center rounded-lg border px-4 py-3.5 text-center shadow-sm transition-all hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        root ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-border/80 bg-card"
      )}
    >
      <Avatar className="h-10 w-10">
        <AvatarFallback className={cn("text-xs font-semibold", root ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")}>
          {initialsOf(node.name)}
        </AvatarFallback>
      </Avatar>
      <p className="mt-2 text-sm font-semibold leading-tight">{node.name}</p>
      <p className="text-xs text-muted-foreground">{node.title}</p>
    </button>
  );
}

function OrgTree({ node, root = false, onSelect }: { node: OrgNode; root?: boolean; onSelect: (n: OrgNode) => void }) {
  return (
    <div className="flex flex-col items-center">
      <OrgNodeCard node={node} root={root} onSelect={onSelect} />
      {node.children && node.children.length > 0 && (
        <div className="flex flex-col items-center">
          <div className="h-6 w-px bg-border" />
          <div className="relative flex justify-center">
            {node.children.length > 1 && (
              <div className="absolute top-0 h-px bg-border" style={{ left: "15%", right: "15%" }} />
            )}
            <div className="flex gap-8 pt-6">
              {node.children.map((child) => (
                <div key={child.name} className="relative flex flex-col items-center">
                  <div className="absolute -top-6 h-6 w-px bg-border" />
                  <OrgTree node={child} onSelect={onSelect} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --- Employee List Manager Sub-Component --- */
function EmployeeListManager({ role }: { role: Role }) {
  const [empList, setEmpList] = useState<Employee[]>(seedEmployees);
  const [recommendations, setRecommendations] = useState<HR3Recommendation[]>(seedHr3Recommendations);
  const [empSearch, setEmpSearch] = useState("");
  const [empDeptFilter, setEmpDeptFilter] = useState("all");
  const [empStatusFilter, setEmpStatusFilter] = useState("all");
  const [empTypeFilter, setEmpTypeFilter] = useState("all");

  // Selection & Modal States
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [viewingEmpInfo, setViewingEmpInfo] = useState<Employee | null>(null);

  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Form States
  const [newPosition, setNewPosition] = useState("");
  const [newSalaryGrade, setNewSalaryGrade] = useState("SG-10");
  const [promotionNotes, setPromotionNotes] = useState("");

  const [exitType, setExitType] = useState<"Resigned" | "Retired" | "Terminated">("Resigned");
  const [exitNotes, setExitNotes] = useState("");

  // Confirmation Alert Dialog States
  const [pendingConfirm, setPendingConfirm] = useState<{ type: "save_promote" | "save_exit" | "regularize"; data?: any } | null>(null);
  const [pendingUnsavedExit, setPendingUnsavedExit] = useState<{ target: "promote" | "exit" } | null>(null);

  const filteredEmployees = empList.filter((e) => {
    const q = empSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q);
    const matchesDept = empDeptFilter === "all" || e.department === empDeptFilter;
    const matchesStatus = empStatusFilter === "all" || e.status === empStatusFilter;
    const matchesType = empTypeFilter === "all" || e.employmentType === empTypeFilter;
    return matchesSearch && matchesDept && matchesStatus && matchesType;
  });

  const empPage = usePagination(filteredEmployees);
  const deptOptions = Array.from(new Set(seedEmployees.map((e) => e.department))).sort();

  // Regularize Handler
  const executeRegularization = (emp: Employee) => {
    const updated = empList.map((e) =>
      e.id === emp.id ? { ...e, employmentType: "Regular" as const, status: "Active" as const } : e
    );
    setEmpList(updated);
    createProbationaryUserAccount(emp);
    addAuditLog({
      user: role === "superadmin" ? "Super Admin" : "HR Admin",
      role: role === "superadmin" ? "Super Admin" : "Admin",
      action: `Passed HR3 Evaluation & Regularized employee ${emp.name} (${emp.id})`,
      module: "Core HCM",
      ipAddress: "192.168.10.22",
      severity: "Info",
      department: emp.department,
      device: "Chrome on Windows",
    });

    // Update recommendation status if present
    setRecommendations((prev) =>
      prev.map((r) => (r.employeeId === emp.id ? { ...r, status: "Approved & Processed" as const } : r))
    );

    toast.success(`${emp.name} has passed evaluation and is now a Regular Employee! User account active.`);
  };

  // Promotion Handler
  const executePromotion = () => {
    if (!selectedEmp || !newPosition) return;
    const oldPosition = selectedEmp.position;
    const oldSalary = selectedEmp.salaryGrade || "SG-08";

    const updated: Employee[] = empList.map((e) => {
      if (e.id === selectedEmp.id) {
        const history = e.promotionHistory || [];
        return {
          ...e,
          position: newPosition,
          salaryGrade: newSalaryGrade,
          status: "Active" as const,
          promotionHistory: [
            ...history,
            {
              date: new Date().toISOString().slice(0, 10),
              oldPosition,
              newPosition,
              oldSalaryGrade: oldSalary,
              newSalaryGrade,
              notes: promotionNotes || "HR3 Succession planning promotion",
            },
          ],
        };
      }
      return e;
    });

    setEmpList(updated);
    addAuditLog({
      user: role === "superadmin" ? "Super Admin" : "HR Admin",
      role: role === "superadmin" ? "Super Admin" : "Admin",
      action: `Promoted ${selectedEmp.name} to ${newPosition} (${newSalaryGrade})`,
      module: "Core HCM",
      ipAddress: "192.168.10.22",
      severity: "Info",
      department: selectedEmp.department,
      device: "Chrome on Windows",
    });

    setRecommendations((prev) =>
      prev.map((r) => (r.employeeId === selectedEmp.id ? { ...r, status: "Approved & Processed" as const } : r))
    );

    toast.success(`Promoted ${selectedEmp.name} to ${newPosition}! Salary Grade updated.`);
    setShowPromoteModal(false);
    setSelectedEmp(null);
    setNewPosition("");
    setPromotionNotes("");
  };

  // Exit Separation Handler
  const executeExit = () => {
    if (!selectedEmp) return;

    const updated: Employee[] = empList.map((e) => {
      if (e.id === selectedEmp.id) {
        return {
          ...e,
          status: exitType as any,
          exitDetails: {
            exitType,
            exitDate: new Date().toISOString().slice(0, 10),
            clearanceStatus: "Pending" as const,
            coeStatus: "Pending" as const,
            notes: exitNotes || `Employee exit via ${exitType}`,
          },
        };
      }
      return e;
    });

    setEmpList(updated);
    deactivateUserAccount(selectedEmp.email, `Exit Status: ${exitType}`);

    addAuditLog({
      user: role === "superadmin" ? "Super Admin" : "HR Admin",
      role: role === "superadmin" ? "Super Admin" : "Admin",
      action: `Processed Exit Status (${exitType}) for ${selectedEmp.name}. ESS User account deactivated.`,
      module: "Core HCM",
      ipAddress: "192.168.10.22",
      severity: "Warning",
      department: selectedEmp.department,
      device: "Chrome on Windows",
    });

    toast.warning(`Exit processed for ${selectedEmp.name} (${exitType}). System user account disabled.`);
    setShowExitModal(false);
    setSelectedEmp(null);
    setExitNotes("");
  };

  return (
    <div className="space-y-6">
      {/* PERFORMANCE & DEVELOPMENT (HR3) EVALUATION RECOMMENDATIONS CARD */}
      <Card className="border-gold/40 bg-gradient-to-r from-gold-soft/30 via-background to-background shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-gold/20 text-gold-foreground">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <CardTitle className="font-display text-lg font-semibold">
                  Performance &amp; Development Handoff (HR3 Evaluations)
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Prerequisites for employee Regularization and Promotion based on recent performance scores.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-gold/50 bg-gold/10 text-gold-foreground text-xs">
              HR3 Evaluation Sync Active
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="grid gap-3 sm:grid-cols-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className={cn(
                  "flex flex-col justify-between rounded-lg border p-3.5 transition-all",
                  rec.status === "Approved & Processed"
                    ? "border-success/30 bg-success/5 opacity-70"
                    : "border-border/80 bg-card hover:border-gold/60 shadow-2xs"
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-sm">{rec.employeeName}</span>
                    <Badge
                      variant="outline"
                      className={
                        rec.recommendationType === "Regularization"
                          ? "border-primary/40 bg-primary/10 text-primary text-[10px]"
                          : "border-gold/50 bg-gold/10 text-gold-foreground text-[10px]"
                      }
                    >
                      {rec.recommendationType}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{rec.department} · Score: <strong className="text-foreground">{rec.evaluationScore}%</strong></p>
                  <p className="mt-2 text-xs text-muted-foreground italic line-clamp-2">"{rec.comments}"</p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5">
                  <span className="text-[11px] text-muted-foreground">{rec.status}</span>
                  {rec.status === "Pending HR Action" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-gold/50 text-gold-foreground hover:bg-gold/10"
                      onClick={() => {
                        const target = empList.find((e) => e.id === rec.employeeId);
                        if (!target) return;
                        if (rec.recommendationType === "Regularization") {
                          setPendingConfirm({ type: "regularize", data: target });
                        } else {
                          setSelectedEmp(target);
                          setNewPosition(rec.suggestedPosition || target.position);
                          setNewSalaryGrade(rec.suggestedSalaryGrade || "SG-10");
                          setShowPromoteModal(true);
                        }
                      }}
                    >
                      Apply Action
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MAIN EMPLOYEE ROSTER CARD */}
      <Card className="border-border/70 shadow-sm">
        <CardContent className="p-6">
          {/* SEARCH & FILTER CONTROLS (UNIFIED HEIGHT & STYLES) */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold">Employee Roster</h2>
              <p className="text-xs text-muted-foreground">
                {filteredEmployees.length} record{filteredEmployees.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[14rem]">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-9 border-border bg-card pl-8 text-xs shadow-2xs"
                  placeholder="Search name, ID, position…"
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                />
              </div>
              <Select value={empDeptFilter} onValueChange={setEmpDeptFilter}>
                <SelectTrigger className="h-9 w-44 text-xs bg-card shadow-2xs">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {deptOptions.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={empTypeFilter} onValueChange={setEmpTypeFilter}>
                <SelectTrigger className="h-9 w-36 text-xs bg-card shadow-2xs">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="Probationary">Probationary</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                </SelectContent>
              </Select>
              <Select value={empStatusFilter} onValueChange={setEmpStatusFilter}>
                <SelectTrigger className="h-9 w-36 text-xs bg-card shadow-2xs">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Resigned">Resigned</SelectItem>
                  <SelectItem value="Retired">Retired</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
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
                  <TableHead>Position &amp; Grade</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Hired</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empPage.pageItems.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs font-medium">{e.id}</TableCell>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{e.department}</TableCell>
                    <TableCell className="text-xs">
                      <div>{e.position}</div>
                      <div className="text-[11px] text-muted-foreground">{e.salaryGrade || "SG-08"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          e.employmentType === "Regular"
                            ? "border-success/40 text-success text-[11px]"
                            : e.employmentType === "Probationary"
                            ? "border-gold/40 text-gold text-[11px]"
                            : "border-border text-[11px]"
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
                            ? "border-success/40 bg-success/10 text-success text-[11px]"
                            : e.status === "Resigned" || e.status === "Retired" || e.status === "Terminated"
                            ? "border-destructive/40 bg-destructive/10 text-destructive text-[11px]"
                            : "border-border text-muted-foreground text-[11px]"
                        }
                      >
                        {e.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => setViewingEmpInfo(e)}
                        >
                          <Info className="mr-1 h-3.5 w-3.5 text-primary" /> View Info
                        </Button>

                        {e.employmentType === "Probationary" && e.status === "Active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-xs border-success/50 text-success hover:bg-success/10"
                            onClick={() => setPendingConfirm({ type: "regularize", data: e })}
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Regularize
                          </Button>
                        )}

                        {e.status === "Active" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-xs"
                              onClick={() => {
                                setSelectedEmp(e);
                                setNewPosition(e.position);
                                setNewSalaryGrade(e.salaryGrade || "SG-10");
                                setShowPromoteModal(true);
                              }}
                            >
                              <TrendingUp className="mr-1 h-3.5 w-3.5 text-primary" /> Promote
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setSelectedEmp(e);
                                setShowExitModal(true);
                              }}
                            >
                              <UserX className="mr-1 h-3.5 w-3.5" /> Exit
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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

      {/* VIEW EMPLOYEE INFO MODAL */}
      <Dialog open={!!viewingEmpInfo} onOpenChange={(open) => !open && setViewingEmpInfo(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {viewingEmpInfo ? initialsOf(viewingEmpInfo.name) : ""}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-display text-xl font-bold">{viewingEmpInfo?.name}</div>
                <div className="text-xs text-muted-foreground">{viewingEmpInfo?.id} · {viewingEmpInfo?.department}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            <div className="grid grid-cols-2 gap-4 rounded-lg border p-3 bg-muted/20">
              <div>
                <span className="text-xs text-muted-foreground">Current Position:</span>
                <p className="font-semibold">{viewingEmpInfo?.position}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Salary Grade:</span>
                <p className="font-semibold text-primary">{viewingEmpInfo?.salaryGrade || "SG-08 (₱18,000 – ₱22,000)"}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Employment Type:</span>
                <p className="font-semibold">{viewingEmpInfo?.employmentType}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Date Hired:</span>
                <p className="font-semibold">{viewingEmpInfo?.dateHired}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Work Email:</span>
                <p className="font-medium text-xs truncate">{viewingEmpInfo?.email}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Supervisor:</span>
                <p className="font-medium text-xs">{viewingEmpInfo?.supervisor}</p>
              </div>
            </div>

            {viewingEmpInfo?.promotionHistory && viewingEmpInfo.promotionHistory.length > 0 && (
              <div className="space-y-2 border-t pt-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Promotion &amp; Career Progression Log:
                </span>
                <div className="space-y-2">
                  {viewingEmpInfo.promotionHistory.map((h, i) => (
                    <div key={i} className="rounded-md border p-2.5 text-xs space-y-1 bg-card">
                      <div className="flex justify-between font-semibold">
                        <span>{h.oldPosition} ➔ {h.newPosition}</span>
                        <span className="text-muted-foreground">{h.date}</span>
                      </div>
                      <div className="text-muted-foreground">Salary: {h.oldSalaryGrade} ➔ {h.newSalaryGrade}</div>
                      <div className="italic text-muted-foreground">{h.notes}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setViewingEmpInfo(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PROMOTION MODAL WITH CONFIRMATIONS */}
      <Dialog
        open={showPromoteModal}
        onOpenChange={(open) => {
          if (!open && (newPosition !== selectedEmp?.position || promotionNotes)) {
            setPendingUnsavedExit({ target: "promote" });
          } else {
            setShowPromoteModal(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" /> Promote Employee — {selectedEmp?.name}
            </DialogTitle>
            <DialogDescription>Update position title and salary grade in Core HCM.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Current Position Title</Label>
              <Input value={selectedEmp?.position || ""} disabled className="bg-muted text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">New Promoted Position Title</Label>
              <Input
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                placeholder="e.g. Senior Receptionist / Supervisor"
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">New Salary Grade</Label>
              <Select value={newSalaryGrade} onValueChange={setNewSalaryGrade}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {seedSalaryGrades.map((sg) => (
                    <SelectItem key={sg.id} value={sg.code}>
                      {sg.code} ({sg.title} · {formatMoney(sg.minSalary)} – {formatMoney(sg.maxSalary)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Succession Justification &amp; Evaluation Notes</Label>
              <Textarea
                value={promotionNotes}
                onChange={(e) => setPromotionNotes(e.target.value)}
                placeholder="HR3 evaluation score details..."
                rows={3}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (newPosition !== selectedEmp?.position || promotionNotes) {
                  setPendingUnsavedExit({ target: "promote" });
                } else {
                  setShowPromoteModal(false);
                }
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => setPendingConfirm({ type: "save_promote" })}>
              Save Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EXIT MODAL WITH CONFIRMATIONS */}
      <Dialog
        open={showExitModal}
        onOpenChange={(open) => {
          if (!open && exitNotes) {
            setPendingUnsavedExit({ target: "exit" });
          } else {
            setShowExitModal(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <UserX className="h-5 w-5" /> Process Exit Status — {selectedEmp?.name}
            </DialogTitle>
            <DialogDescription>Mark exit status in HCM. This will automatically deactivate user account.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Exit Reason / Trigger</Label>
              <Select value={exitType} onValueChange={(v: any) => setExitType(v)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Resigned">Resigned (Initiated via ESS / HR)</SelectItem>
                  <SelectItem value="Retired">Retired (Age / Policy)</SelectItem>
                  <SelectItem value="Terminated">Terminated (Disciplinary / Performance)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Clearance &amp; Exit Notes</Label>
              <Textarea
                value={exitNotes}
                onChange={(e) => setExitNotes(e.target.value)}
                placeholder="Exit clearance interview notes..."
                rows={3}
                className="text-xs"
              />
            </div>

            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
              ⚠️ <strong>Security Action</strong>: Confirming exit status will instantly revoke user credentials in User Management.
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (exitNotes) {
                  setPendingUnsavedExit({ target: "exit" });
                } else {
                  setShowExitModal(false);
                }
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setPendingConfirm({ type: "save_exit" })}>
              Confirm Exit &amp; Deactivate Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION ALERT DIALOG (SAVE / ACTION) */}
      <AlertDialog open={!!pendingConfirm} onOpenChange={(open) => !open && setPendingConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingConfirm?.type === "save_promote" && `Are you sure you want to promote ${selectedEmp?.name} to ${newPosition}?`}
              {pendingConfirm?.type === "save_exit" && `Are you sure you want to process exit status (${exitType}) for ${selectedEmp?.name}? User account will be disabled.`}
              {pendingConfirm?.type === "regularize" && `Are you sure you want to convert ${pendingConfirm?.data?.name} to Regular employee status?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingConfirm(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingConfirm?.type === "save_promote") executePromotion();
                if (pendingConfirm?.type === "save_exit") executeExit();
                if (pendingConfirm?.type === "regularize") executeRegularization(pendingConfirm.data);
                setPendingConfirm(null);
              }}
            >
              Yes, Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONFIRMATION ALERT DIALOG (UNSAVED CHANGES EXIT) */}
      <AlertDialog open={!!pendingUnsavedExit} onOpenChange={(open) => !open && setPendingUnsavedExit(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-600">Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in this form. Are you sure you want to exit without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingUnsavedExit(null)}>Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingUnsavedExit?.target === "promote") setShowPromoteModal(false);
                if (pendingUnsavedExit?.target === "exit") setShowExitModal(false);
                setPendingUnsavedExit(null);
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

/* --- Lifecycle Logs Viewer Sub-Component --- */
function LifecycleLogsViewer() {
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");

  const lifecycleEntries = auditLogs.filter(
    (log) =>
      log.action.includes("Regularized") ||
      log.action.includes("Promoted") ||
      log.action.includes("Exit") ||
      log.action.includes("Deactivated") ||
      log.module === "Core HCM"
  );

  const filteredLogs = lifecycleEntries.filter((log) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || log.action.toLowerCase().includes(q) || log.user.toLowerCase().includes(q);
    const matchesType =
      filterType === "all" ||
      (filterType === "Promoted" && log.action.includes("Promoted")) ||
      (filterType === "Regularized" && log.action.includes("Regularized")) ||
      (filterType === "Exit" && (log.action.includes("Exit") || log.action.includes("Deactivated")));
    return matchesSearch && matchesType;
  });

  const page = usePagination(filteredLogs);

  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display text-xl font-semibold">Lifecycle Transition Logs</h2>
            <p className="text-xs text-muted-foreground">
              Audit log records of promotions, regularizations, and employee exit separations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search employee or action…"
              className="h-9 w-52 text-xs bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-9 w-40 text-xs bg-card">
                <SelectValue placeholder="All events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All lifecycle events</SelectItem>
                <SelectItem value="Regularized">Regularization</SelectItem>
                <SelectItem value="Promoted">Promotion</SelectItem>
                <SelectItem value="Exit">Exits &amp; Separations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Log ID</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor / Role</TableHead>
                <TableHead>Action Details</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {page.pageItems.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs font-medium">{log.id}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.timestamp}</TableCell>
                  <TableCell className="text-xs">
                    <span className="font-medium">{log.user}</span>
                    <span className="text-muted-foreground block text-[11px]">{log.role}</span>
                  </TableCell>
                  <TableCell className="text-xs font-medium">{log.action}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.department}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        log.severity === "Warning" || log.severity === "Critical"
                          ? "border-destructive/40 text-destructive text-[10px]"
                          : "border-primary/40 text-primary text-[10px]"
                      }
                    >
                      {log.severity}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                    No lifecycle transition log entries found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <TablePagination
          page={page.page}
          pageCount={page.pageCount}
          from={page.from}
          to={page.to}
          total={page.total}
          label="lifecycle logs"
          onPageChange={page.setPage}
        />
      </CardContent>
    </Card>
  );
}

/* =========================================================================
   2. DEPARTMENT & POSITION MODULE (Dept & Pos, Salary Grades, Requisitions)
   ========================================================================= */

export function DeptPosModule({ role = "admin" }: { role?: Role }) {
  const [activeTab, setActiveTab] = useState<"deptpos" | "salary" | "reqs">("deptpos");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Core HCM · Organization Setup"
        title="Department, Position &amp; Salary Grade Management"
        description="Configure property departments, define position headcounts, manage salary grade structures, and approve requisitions."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "deptpos" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("deptpos")}
            >
              <Building2 className="mr-2 h-4 w-4" /> Dept &amp; Positions
            </Button>
            <Button
              variant={activeTab === "salary" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("salary")}
            >
              <DollarSign className="mr-2 h-4 w-4" /> Salary Grades
            </Button>
            <Button
              variant={activeTab === "reqs" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("reqs")}
            >
              <FileCheck className="mr-2 h-4 w-4" /> Requisitions
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/60 p-1">
          <TabsTrigger value="deptpos">Dept &amp; Position</TabsTrigger>
          <TabsTrigger value="salary">Salary Grades</TabsTrigger>
          <TabsTrigger value="reqs">Requisitions</TabsTrigger>
        </TabsList>

        <TabsContent value="deptpos" className="space-y-6">
          <DepartmentAndPositionManager role={role} />
        </TabsContent>

        <TabsContent value="salary" className="space-y-6">
          <SalaryGradeManager />
        </TabsContent>

        <TabsContent value="reqs" className="space-y-6">
          <RequisitionManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* --- Department and Position Manager Sub-Component --- */
function DepartmentAndPositionManager({ role }: { role: Role }) {
  const [deptList, setDeptList] = useState<Department[]>(seedDepartments);
  const [posList, setPosList] = useState<Position[]>(seedPositions);
  const [sGrades] = useState<SalaryGrade[]>(seedSalaryGrades);

  // NOT preselected! Shows ALL departments and ALL positions by default!
  const [deptFilter, setDeptFilter] = useState("all");

  // Modals & Form States
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingPos, setEditingPos] = useState<Position | null>(null);
  const [isNewPos, setIsNewPos] = useState(false);
  const [isNewDept, setIsNewDept] = useState(false);

  // Department Form
  const [deptCode, setDeptCode] = useState("");
  const [deptName, setDeptName] = useState("");
  const [deptHead, setDeptHead] = useState("");

  // Position Form
  const [posTitle, setPosTitle] = useState("");
  const [posDept, setPosDept] = useState("Front Office");
  const [posLevel, setPosLevel] = useState<Position["level"]>("Rank & File");
  const [posTarget, setPosTarget] = useState("5");
  const [posFilled, setPosFilled] = useState("3");
  const [posSGrade, setPosSGrade] = useState("SG-05");

  // Confirmation Alert States
  const [pendingConfirmSave, setPendingConfirmSave] = useState<{ type: "dept" | "pos" } | null>(null);
  const [pendingUnsavedExit, setPendingUnsavedExit] = useState<{ target: "dept" | "pos" } | null>(null);

  // Helper: derive department staff count dynamically by summing position filled counts under that department
  const getDerivedStaffCount = (deptName: string) => {
    return posList.filter((p) => p.department === deptName).reduce((acc, curr) => acc + curr.filled, 0);
  };

  // Helper: list candidate heads (Active employees, excluding heads of OTHER departments)
  const candidateHeads = seedEmployees.filter(
    (emp) => emp.status === "Active"
  );

  // Filter positions
  const filteredPositions = posList.filter(
    (p) => deptFilter === "all" || p.department === deptFilter
  );

  // Save Department Handler
  const executeSaveDepartment = () => {
    if (!deptName || !deptCode) {
      toast.error("Department Name and Code are required.");
      return;
    }

    if (isNewDept) {
      const newD: Department = {
        code: deptCode,
        name: deptName,
        description: "",
        head: deptHead || "Unassigned",
        staff: 0,
        openRequisitions: 0,
        budget: 0,
      };
      setDeptList((prev) => [...prev, newD]);
      toast.success(`Department ${deptName} created.`);
    } else if (editingDept) {
      setDeptList((prev) =>
        prev.map((d) => (d.code === editingDept.code ? { ...d, code: deptCode, name: deptName, head: deptHead } : d))
      );
      toast.success(`Department ${deptName} updated.`);
    }

    setEditingDept(null);
    setIsNewDept(false);
  };

  // Save Position Handler
  const executeSavePosition = () => {
    if (!posTitle) {
      toast.error("Job position title is required.");
      return;
    }

    const sgObj = sGrades.find((sg) => sg.code === posSGrade);
    const bandLabel = sgObj ? `${posSGrade} (${formatMoney(sgObj.minSalary)} – ${formatMoney(sgObj.maxSalary)})` : posSGrade;

    if (isNewPos) {
      const newP: Position = {
        id: `POS-0${posList.length + 1}`,
        title: posTitle,
        department: posDept,
        level: posLevel,
        headcount: Number(posTarget) || 1,
        filled: Number(posFilled) || 0,
        salaryBand: bandLabel,
      };
      setPosPosList((prev) => [...prev, newP]);
      toast.success(`Position ${posTitle} added to ${posDept}.`);
    } else if (editingPos) {
      setPosPosList((prev) =>
        prev.map((p) =>
          p.id === editingPos.id
            ? {
                ...p,
                title: posTitle,
                department: posDept,
                level: posLevel,
                headcount: Number(posTarget),
                filled: Number(posFilled),
                salaryBand: bandLabel,
              }
            : p
        )
      );
      toast.success(`Position ${posTitle} updated.`);
    }

    setEditingPos(null);
    setIsNewPos(false);
  };

  const setPosPosList = setPosList;

  return (
    <div className="space-y-8">
      {/* 1. DEPARTMENTS SECTION CARD */}
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
          <div>
            <CardTitle className="font-display text-xl font-semibold">Hotel &amp; Restaurant Departments</CardTitle>
            <p className="text-xs text-muted-foreground">
              Master department registry with dynamic staff aggregation from job positions.
            </p>
          </div>
          {/* ADD DEPARTMENT BUTTON ASSOCIATED DIRECTLY IN DEPARTMENT CARD */}
          <Button
            size="sm"
            onClick={() => {
              setDeptCode(`DEP-0${deptList.length + 1}`);
              setDeptName("");
              setDeptHead("");
              setIsNewDept(true);
              setEditingDept({ code: "", name: "", description: "", head: "", staff: 0, openRequisitions: 0, budget: 0 });
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add Department
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28 pl-6">Dept Code</TableHead>
                <TableHead>Department Name</TableHead>
                <TableHead>Department Head</TableHead>
                <TableHead className="text-center">Positions Count</TableHead>
                <TableHead className="text-center">Staff Count (Derived)</TableHead>
                <TableHead className="w-28 text-center pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deptList.map((d) => {
                const positionsUnder = posList.filter((p) => p.department === d.name);
                const derivedStaff = getDerivedStaffCount(d.name);

                return (
                  <TableRow key={d.code}>
                    <TableCell className="pl-6 font-mono text-xs font-medium">{d.code}</TableCell>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{d.head}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{positionsUnder.length}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {derivedStaff} active staff
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center pr-6">
                      <div className="flex justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs"
                          onClick={() => {
                            setEditingDept(d);
                            setDeptCode(d.code);
                            setDeptName(d.name);
                            setDeptHead(d.head);
                            setIsNewDept(false);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 2. POSITIONS SECTION CARD */}
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
          <div>
            <CardTitle className="font-display text-xl font-semibold">Job Positions &amp; Salary Bands</CardTitle>
            <p className="text-xs text-muted-foreground">
              Define position titles, department assignments, headcount targets, and assigned salary grade structure.
            </p>
          </div>
          {/* ADD POSITION BUTTON ASSOCIATED DIRECTLY IN POSITION CARD */}
          <Button
            size="sm"
            onClick={() => {
              setPosTitle("");
              setPosDept(deptList[0]?.name || "Front Office");
              setPosLevel("Rank & File");
              setPosTarget("5");
              setPosFilled("3");
              setPosSGrade("SG-05");
              setIsNewPos(true);
              setEditingPos({ id: "", title: "", department: "", level: "Rank & File", headcount: 5, filled: 3, salaryBand: "" });
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add Position
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* FILTER DROPDOWN: DEFAULTS TO ALL DEPARTMENTS & ALL POSITIONS */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Filtered Position Roster
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Filter by Dept:</span>
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="h-9 w-52 text-xs bg-card">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {deptList.map((d) => (
                    <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">POS ID</TableHead>
                  <TableHead>Job Position Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-center">Target Headcount</TableHead>
                  <TableHead className="text-center">Filled Staff</TableHead>
                  <TableHead>Assigned Salary Grade / Band</TableHead>
                  <TableHead className="w-28 text-center pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPositions.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-medium">{p.id}</TableCell>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.department}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px]">
                        {p.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs">{p.headcount}</TableCell>
                    <TableCell className="text-center font-mono text-xs font-semibold">{p.filled}</TableCell>
                    <TableCell className="text-xs text-primary font-medium">{p.salaryBand}</TableCell>
                    <TableCell className="text-center pr-4">
                      <div className="flex justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs"
                          onClick={() => {
                            setEditingPos(p);
                            setPosTitle(p.title);
                            setPosDept(p.department);
                            setPosLevel(p.level);
                            setPosTarget(String(p.headcount));
                            setPosFilled(String(p.filled));
                            setPosSGrade(p.salaryBand.split(" ")[0] || "SG-05");
                            setIsNewPos(false);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* EDIT / ADD DEPARTMENT MODAL WITH DYNAMIC POSITIONS & DERIVED STAFF */}
      <Dialog
        open={!!editingDept}
        onOpenChange={(open) => {
          if (!open) {
            setPendingUnsavedExit({ target: "dept" });
          } else {
            setEditingDept(editingDept);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isNewDept ? "Add New Department" : `Edit Department — ${editingDept?.name}`}</DialogTitle>
            <DialogDescription>
              Configure department information. Associated positions and staff count are updated automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Department Code</Label>
                <Input value={deptCode} onChange={(e) => setDeptCode(e.target.value)} className="text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Department Name</Label>
                <Input value={deptName} onChange={(e) => setDeptName(e.target.value)} className="text-xs" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Department Head (Active Staff Only)</Label>
              <Select value={deptHead} onValueChange={setDeptHead}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select active manager/supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {candidateHeads.map((h) => (
                    <SelectItem key={h.id} value={h.name}>
                      {h.name} ({h.position} · {h.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* DYNAMIC ASSOCIATED POSITIONS LISTING */}
            <div className="space-y-1.5 rounded-lg border p-3 bg-muted/20">
              <Label className="text-xs font-semibold">Associated Job Positions in {deptName || "Department"}:</Label>
              {posList.filter((p) => p.department === deptName).length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {posList
                    .filter((p) => p.department === deptName)
                    .map((p) => (
                      <Badge key={p.id} variant="secondary" className="text-[11px]">
                        {p.title} ({p.filled} staff)
                      </Badge>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic text-[11px]">
                  No job positions currently assigned. Positions added to this department will display here automatically.
                </p>
              )}
            </div>

            {/* DERIVED STAFF COUNT (READ ONLY) */}
            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/40">
              <div>
                <span className="font-semibold text-xs text-foreground">Total Staff Count (Derived):</span>
                <p className="text-[11px] text-muted-foreground">Calculated automatically from filled staff across all positions.</p>
              </div>
              <Badge variant="default" className="font-mono text-sm">
                {getDerivedStaffCount(deptName)} Staff
              </Badge>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingUnsavedExit({ target: "dept" })}>
              Cancel
            </Button>
            <Button onClick={() => setPendingConfirmSave({ type: "dept" })}>
              Save Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT / ADD POSITION MODAL WITH SALARY GRADE SELECTOR */}
      <Dialog
        open={!!editingPos}
        onOpenChange={(open) => {
          if (!open) {
            setPendingUnsavedExit({ target: "pos" });
          } else {
            setEditingPos(editingPos);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isNewPos ? "Add New Job Position" : `Edit Position — ${editingPos?.title}`}</DialogTitle>
            <DialogDescription>
              Assign job level, target headcount, department and dynamic Salary Grade.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Job Position Title</Label>
              <Input value={posTitle} onChange={(e) => setPosTitle(e.target.value)} className="text-xs" placeholder="e.g. Pastry Chef" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Department</Label>
                <Select value={posDept} onValueChange={setPosDept}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {deptList.map((d) => (
                      <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Job Level</Label>
                <Select value={posLevel} onValueChange={(v: any) => setPosLevel(v)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rank & File">Rank &amp; File</SelectItem>
                    <SelectItem value="Supervisory">Supervisory</SelectItem>
                    <SelectItem value="Managerial">Managerial</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Target Headcount</Label>
                <Input type="number" value={posTarget} onChange={(e) => setPosTarget(e.target.value)} className="text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Filled Staff</Label>
                <Input type="number" value={posFilled} onChange={(e) => setPosFilled(e.target.value)} className="text-xs" />
              </div>
            </div>

            {/* DYNAMIC SALARY GRADE SELECTION DROPDOWN */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-primary">Assign Salary Grade (From Salary Grade Management)</Label>
              <Select value={posSGrade} onValueChange={setPosSGrade}>
                <SelectTrigger className="text-xs border-primary/40 bg-primary/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sGrades.map((sg) => (
                    <SelectItem key={sg.id} value={sg.code}>
                      {sg.code} — {sg.title} ({formatMoney(sg.minSalary)} – {formatMoney(sg.maxSalary)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingUnsavedExit({ target: "pos" })}>
              Cancel
            </Button>
            <Button onClick={() => setPendingConfirmSave({ type: "pos" })}>
              Save Position
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION ALERT DIALOG (SAVE DEPT / SAVE POS) */}
      <AlertDialog open={!!pendingConfirmSave} onOpenChange={(open) => !open && setPendingConfirmSave(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingConfirmSave?.type === "dept" && `Are you sure you want to save changes to department "${deptName}"?`}
              {pendingConfirmSave?.type === "pos" && `Are you sure you want to save changes to position "${posTitle}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingConfirmSave(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingConfirmSave?.type === "dept") executeSaveDepartment();
                if (pendingConfirmSave?.type === "pos") executeSavePosition();
                setPendingConfirmSave(null);
              }}
            >
              Yes, Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONFIRMATION ALERT DIALOG (UNSAVED CHANGES EXIT) */}
      <AlertDialog open={!!pendingUnsavedExit} onOpenChange={(open) => !open && setPendingUnsavedExit(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-600">Discard Unsaved Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have modified fields in this modal. Are you sure you want to exit without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingUnsavedExit(null)}>Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingUnsavedExit?.target === "dept") {
                  setEditingDept(null);
                  setIsNewDept(false);
                }
                if (pendingUnsavedExit?.target === "pos") {
                  setEditingPos(null);
                  setIsNewPos(false);
                }
                setPendingUnsavedExit(null);
              }}
            >
              Discard &amp; Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* --- Salary Grade Manager Sub-Component --- */
function SalaryGradeManager() {
  const [grades, setGrades] = useState<SalaryGrade[]>(seedSalaryGrades);
  const [editingSG, setEditingSG] = useState<SalaryGrade | null>(null);
  const [isNewSG, setIsNewSG] = useState(false);

  // Form states
  const [sgCode, setSgCode] = useState("");
  const [sgTitle, setSgTitle] = useState("");
  const [sgMin, setSgMin] = useState("20000");
  const [sgMax, setSgMax] = useState("28000");
  const [sgLevel, setSgLevel] = useState<SalaryGrade["level"]>("Rank & File");
  const [sgNotes, setSgNotes] = useState("");

  // Confirmation Alert States
  const [pendingConfirmSave, setPendingConfirmSave] = useState(false);
  const [pendingDeleteSG, setPendingDeleteSG] = useState<SalaryGrade | null>(null);

  const executeSaveGrade = () => {
    if (!sgCode || !sgTitle) {
      toast.error("Salary Grade Code and Title are required.");
      return;
    }

    if (isNewSG) {
      const newSG: SalaryGrade = {
        id: sgCode,
        code: sgCode,
        title: sgTitle,
        minSalary: Number(sgMin) || 18000,
        maxSalary: Number(sgMax) || 25000,
        currency: "PHP",
        level: sgLevel,
        notes: sgNotes,
      };
      setGrades((prev) => [...prev, newSG]);
      toast.success(`Salary Grade ${sgCode} created.`);
    } else if (editingSG) {
      setGrades((prev) =>
        prev.map((g) =>
          g.id === editingSG.id
            ? {
                ...g,
                code: sgCode,
                title: sgTitle,
                minSalary: Number(sgMin),
                maxSalary: Number(sgMax),
                level: sgLevel,
                notes: sgNotes,
              }
            : g
        )
      );
      toast.success(`Salary Grade ${sgCode} updated.`);
    }

    setEditingSG(null);
    setIsNewSG(false);
  };

  const executeDeleteGrade = (sg: SalaryGrade) => {
    setGrades((prev) => prev.filter((g) => g.id !== sg.id));
    toast.success(`Salary Grade ${sg.code} deleted.`);
  };

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
        <div>
          <CardTitle className="font-display text-xl font-semibold">Salary Grade &amp; Compensation Management</CardTitle>
          <p className="text-xs text-muted-foreground">
            Configure dynamic salary grades, pay band ranges, and job level alignment.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setSgCode(`SG-${grades.length + 10}`);
            setSgTitle("New Grade Level");
            setSgMin("25000");
            setSgMax("35000");
            setSgLevel("Supervisory");
            setSgNotes("");
            setIsNewSG(true);
            setEditingSG({ id: "", code: "", title: "", minSalary: 25000, maxSalary: 35000, currency: "PHP", level: "Supervisory" });
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add Salary Grade
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28 pl-6">Grade Code</TableHead>
              <TableHead>Band Title</TableHead>
              <TableHead>Job Level</TableHead>
              <TableHead className="text-right">Min Salary</TableHead>
              <TableHead className="text-right">Max Salary</TableHead>
              <TableHead>Pay Band Range</TableHead>
              <TableHead className="w-28 text-center pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grades.map((sg) => (
              <TableRow key={sg.id}>
                <TableCell className="pl-6 font-mono text-xs font-semibold text-primary">{sg.code}</TableCell>
                <TableCell className="font-medium text-xs">{sg.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[11px]">
                    {sg.level}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-xs">{formatMoney(sg.minSalary)}</TableCell>
                <TableCell className="text-right font-mono text-xs">{formatMoney(sg.maxSalary)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatMoney(sg.minSalary)} – {formatMoney(sg.maxSalary)}
                </TableCell>
                <TableCell className="text-center pr-6">
                  <div className="flex justify-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2.5 text-xs"
                      onClick={() => {
                        setEditingSG(sg);
                        setSgCode(sg.code);
                        setSgTitle(sg.title);
                        setSgMin(String(sg.minSalary));
                        setSgMax(String(sg.maxSalary));
                        setSgLevel(sg.level);
                        setSgNotes(sg.notes || "");
                        setIsNewSG(false);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => setPendingDeleteSG(sg)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* EDIT / ADD SALARY GRADE MODAL */}
      <Dialog open={!!editingSG} onOpenChange={(open) => !open && setEditingSG(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isNewSG ? "Create Salary Grade" : `Edit Salary Grade — ${editingSG?.code}`}</DialogTitle>
            <DialogDescription>Define compensation ranges for positions.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Grade Code</Label>
                <Input value={sgCode} onChange={(e) => setSgCode(e.target.value)} className="text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Job Level Alignment</Label>
                <Select value={sgLevel} onValueChange={(v: any) => setSgLevel(v)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rank & File">Rank &amp; File</SelectItem>
                    <SelectItem value="Supervisory">Supervisory</SelectItem>
                    <SelectItem value="Managerial">Managerial</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Pay Band Title</Label>
              <Input value={sgTitle} onChange={(e) => setSgTitle(e.target.value)} className="text-xs" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Minimum Monthly Salary (₱)</Label>
                <Input type="number" value={sgMin} onChange={(e) => setSgMin(e.target.value)} className="text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Maximum Monthly Salary (₱)</Label>
                <Input type="number" value={sgMax} onChange={(e) => setSgMax(e.target.value)} className="text-xs" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Notes / Coverage</Label>
              <Textarea value={sgNotes} onChange={(e) => setSgNotes(e.target.value)} rows={2} className="text-xs" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSG(null)}>
              Cancel
            </Button>
            <Button onClick={() => setPendingConfirmSave(true)}>
              Save Salary Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION SAVE SALARY GRADE */}
      <AlertDialog open={pendingConfirmSave} onOpenChange={setPendingConfirmSave}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Salary Grade Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save salary grade "{sgCode}" ({formatMoney(Number(sgMin))} – {formatMoney(Number(sgMax))})?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingConfirmSave(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                executeSaveGrade();
                setPendingConfirmSave(false);
              }}
            >
              Yes, Save Grade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONFIRMATION DELETE SALARY GRADE */}
      <AlertDialog open={!!pendingDeleteSG} onOpenChange={(open) => !open && setPendingDeleteSG(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Delete Salary Grade?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete salary grade "{pendingDeleteSG?.code}"? Positions assigned to this grade will need to be re-assigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDeleteSG(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingDeleteSG) executeDeleteGrade(pendingDeleteSG);
                setPendingDeleteSG(null);
              }}
            >
              Delete Grade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

/* --- Requisition Manager Sub-Component --- */
function RequisitionManager() {
  const reqs = useRequisitions();

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
        <div>
          <CardTitle className="font-display text-xl font-semibold">Vacancy Requisitions</CardTitle>
          <p className="text-xs text-muted-foreground">Department requests for staff expansion or replacement hiring.</p>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Req Code</TableHead>
              <TableHead>Position Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-center">Slots Requested</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-6">Date Requested</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reqs.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="pl-6 font-mono text-xs font-medium">{r.id}</TableCell>
                <TableCell className="font-medium text-xs">{r.position}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.department}</TableCell>
                <TableCell className="text-center font-mono text-xs">{r.count}</TableCell>
                <TableCell className="text-xs">
                  <Badge variant="outline" className="text-[10px]">
                    {r.urgency}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      r.status === "Approved"
                        ? "border-success/40 bg-success/10 text-success text-[10px]"
                        : r.status === "Converted"
                        ? "border-primary/40 bg-primary/10 text-primary text-[10px]"
                        : "border-gold/40 text-gold text-[10px]"
                    }
                  >
                    {r.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-6 text-xs text-muted-foreground">{r.requestedAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* Backward-compatible default CoreHCM wrapper */
export function CoreHCM({ role = "admin" }: { role?: Role }) {
  return <OrgChartModule role={role} />;
}
