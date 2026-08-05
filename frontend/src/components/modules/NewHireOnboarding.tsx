import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Pencil, Search, UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { TablePagination } from "@/components/ui/table-pagination";
import { usePagination } from "@/hooks/usePagination";
import { departments, newHires as seedHires, positions, type NewHire } from "@/data/hr";
import { applicants } from "@/data/applicants";
import { DEFAULT_ACCOUNT_PASSWORD, hireStore, useHires, usePendingHire } from "@/data/hires";
import { cn } from "@/lib/utils";
import { SortHead, useSort } from "@/components/portal/sortable";

/** Today's date in yyyy-mm-dd, used as the default start date for new hires. */
const todayIso = new Date().toISOString().slice(0, 10);

const stages: NewHire["stage"][] = ["Pre-onboarding", "Probationary", "Regular"];

const stageBlurb: Record<NewHire["stage"], string> = {
  "Pre-onboarding": "Requirements submission, contract signing, orientation scheduling.",
  Probationary: "Active probation period with department training and monthly evaluation.",
  Regular: "Regularization approved — full benefits and HMO coverage activated.",
};

const defaultChecklist = [
  "Signed employment contract",
  "NBI / Police clearance",
  "Pre-employment medical exam",
  "SSS / PhilHealth / Pag-IBIG / TIN",
  "Birth certificate (PSA)",
  "Company orientation attended",
  "Uniform & ID issued",
  "Department on-the-job training",
];

/** Requirements checklist a hire starts with when they enter each stage. */
const stageChecklists: Record<NewHire["stage"], string[]> = {
  "Pre-onboarding": defaultChecklist,
  Probationary: [
    "Department orientation completed",
    "Job description acknowledged",
    "1st month performance evaluation",
    "3rd month performance evaluation",
    "5th month performance evaluation",
    "Training hours completed",
  ],
  Regular: [
    "Regularization contract signed",
    "HMO enrollment submitted",
    "Leave credits activated",
    "Performance goals set",
  ],
};

const freshChecklist = (stage: NewHire["stage"]) =>
  stageChecklists[stage].map((item) => ({ item, done: false }));

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 3)
    .join("")
    .toUpperCase();

export function NewHireOnboarding({ role }: { role: "superadmin" | "admin" }) {
  const hires = useHires();
  const setHires = (updater: (prev: NewHire[]) => NewHire[]) => hireStore.setHires(updater);
  const pending = usePendingHire();
  const [stage, setStage] = useState<NewHire["stage"]>("Pre-onboarding");
  const [showAllStages, setShowAllStages] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(seedHires[0]?.id ?? null);
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSnapshot, setEditSnapshot] = useState<{ item: string; done: boolean }[] | null>(null);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [form, setForm] = useState({
    name: "",
    position: "",
    department: "",
    startDate: todayIso,
    email: "",
    phone: "",
  });
  /** True when the modal was opened from an accepted applicant — name is fixed. */
  const [nameLocked, setNameLocked] = useState(false);

  /** Opens a clean Add New Hire modal: nothing pre-set except today's start date. */
  const openAddHire = () => {
    setForm({
      name: "",
      position: "",
      department: "",
      startDate: todayIso,
      email: "",
      phone: "",
    });
    setNameLocked(false);
    setAddOpen(true);
  };

  /** An accepted applicant arrives here with a pre-filled Add New Hire modal. */
  useEffect(() => {
    if (!pending) return;
    setForm({
      name: pending.name,
      position: pending.position,
      department: pending.department,
      startDate: todayIso,
      email: pending.email,
      phone: pending.phone,
    });
    setNameLocked(true);
    setAddOpen(true);
    hireStore.setPending(null);
  }, [pending]);

  const selected = hires.find((h) => h.id === selectedId) ?? null;


  const toggleItem = (hireId: string, item: string) => {
    if (editingId !== hireId) return;
    setHires((prev) =>
      prev.map((h) => {
        if (h.id !== hireId) return h;
        const checklist = h.checklist.map((c) => (c.item === item ? { ...c, done: !c.done } : c));
        const complete = checklist.every((c) => c.done);
        const idx = stages.indexOf(h.stage);
        if (complete && idx < stages.length - 1) {
          const next = stages[idx + 1]!;
          // Auto-promote: requirements fully met, move to the destination stage.
          setTimeout(() => {
            toast.success(`${h.name} completed all requirements — moved to ${next}`);
            setStage(next);
            setShowAllStages(false);
          }, 0);
          // A new stage starts from zero — issue that stage's own checklist.
          return { ...h, checklist: freshChecklist(next), stage: next };
        }
        return { ...h, checklist };
      }),
    );
  };

  const startEditChecklist = (hire: NewHire) => {
    setEditingId(hire.id);
    setEditSnapshot(hire.checklist.map((c) => ({ ...c })));
    setSelectedId(hire.id);
  };

  const cancelEditChecklist = () => {
    if (editingId && editSnapshot) {
      setHires((prev) =>
        prev.map((h) => (h.id === editingId ? { ...h, checklist: editSnapshot } : h)),
      );
    }
    setEditingId(null);
    setEditSnapshot(null);
  };

  const saveEditChecklist = () => {
    setEditingId(null);
    setEditSnapshot(null);
  };

  const advance = (hire: NewHire) => {
    const idx = stages.indexOf(hire.stage);
    if (idx >= stages.length - 1) {
      toast("Already at Regular status");
      return;
    }
    const next = stages[idx + 1]!;
    setHires((prev) =>
      prev.map((h) =>
        h.id === hire.id ? { ...h, stage: next, checklist: freshChecklist(next) } : h,
      ),
    );
    toast.success(`${hire.name} moved to ${next}`);
  };

  const progress = (h: NewHire) =>
    Math.round((h.checklist.filter((c) => c.done).length / h.checklist.length) * 100);

  const stageFiltered = showAllStages ? hires : hires.filter((h) => h.stage === stage);
  const filtered = stageFiltered.filter((h) => {
    const matchesDept = deptFilter === "all" || h.department === deptFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      h.name.toLowerCase().includes(q) ||
      h.position.toLowerCase().includes(q) ||
      h.department.toLowerCase().includes(q);
    return matchesDept && matchesSearch;
  });
  const {
    sort,
    toggle: onSort,
    sorted: visible,
  } = useSort<NewHire, "name" | "position" | "startDate" | "requirements" | "stage">(filtered, {
    name: (h) => h.name,
    position: (h) => h.position,
    startDate: (h) => h.startDate,
    requirements: (h) => progress(h),
    stage: (h) => h.stage,
  });

  const hirePage = usePagination(visible);

  const selectStage = (s: NewHire["stage"]) => {
    setStage(s);
    setShowAllStages(false);
    const firstInStage = hires.find((h) => h.stage === s);
    setSelectedId(firstInStage?.id ?? null);
  };

  const addHire = () => {
    if (!form.name || !form.position || !form.department || !form.startDate || !form.email) {
      toast.error("Name, position, department, email and start date are required.");
      return;
    }
    const id = `NH-${String(hires.length + 1).padStart(2, "0")}`;
    hireStore.add({
      id,
      name: form.name,
      position: form.position,
      department: form.department,
      stage: "Pre-onboarding",
      startDate: form.startDate,
      initials: initialsOf(form.name),
      email: form.email,
      phone: form.phone,
      checklist: defaultChecklist.map((item) => ({ item, done: false })),
    });

    setSelectedId(id);
    setStage("Pre-onboarding");
    setShowAllStages(false);
    setAddOpen(false);
    setNameLocked(false);
    setForm({
      name: "",
      position: "",
      department: "",
      startDate: todayIso,
      email: "",
      phone: "",
    });
    toast.success(`${form.name} added to pre-onboarding and Employee Records`);
  };

  return (
    <div>
      <PageHeader
        eyebrow={role === "superadmin" ? "Super Admin · Recruitment" : "Admin · Recruitment"}
        title="New Hire Onboarding"
        description="Track hires from pre-onboarding through probation to regularization."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total New Hires"
          value={hires.length}
          tone="primary"
          onClick={() => setShowAllStages(true)}
        />
        {stages.map((s) => (
          <StatCard
            key={s}
            label={s}
            value={hires.filter((h) => h.stage === s).length}
            tone={s === "Regular" ? "success" : s === "Probationary" ? "gold" : "default"}
            onClick={() => selectStage(s)}
          />
        ))}
      </div>

      {/* HORIZONTAL TRACKER */}
      <Card className="mt-6 border-border/70">
        <CardContent className="p-6">
          <h2 className="font-display text-2xl font-semibold">Onboarding Status Tracker</h2>
          <p className="text-xs text-muted-foreground">
            Applicant and candidate stages are handled in Applicant Management — onboarding starts
            once a candidate is hired.
          </p>

          <div className="relative mt-8 px-2">
            <div className="absolute left-[8%] right-[8%] top-4 h-0.5 bg-border" />
            <div
              className="absolute left-[8%] top-4 h-0.5 bg-primary transition-all"
              style={{ width: `${((stages.indexOf(stage) + 1) / stages.length) * 84}%` }}
            />

            <div className="relative grid grid-cols-3">
              {stages.map((s, i) => {
                const active = stages.indexOf(stage) >= i;
                return (
                  <button
                    key={s}
                    onClick={() => selectStage(s)}
                    className="flex cursor-pointer flex-col items-center text-center"
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground",
                        stage === s && !showAllStages && "ring-4 ring-primary/20",
                      )}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={cn(
                        "mt-2 text-sm font-medium",
                        stage === s && !showAllStages ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {s}
                    </span>
                    <span className="mt-1 max-w-[220px] text-[0.7rem] text-muted-foreground">
                      {stageBlurb[s]}
                    </span>
                    <Badge variant="secondary" className="mt-2">
                      {hires.filter((h) => h.stage === s).length} hires
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 2xl:grid-cols-[1.6fr_1fr]">
        <Card className="min-w-0 border-border/70">
          <CardContent className="min-w-0 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  {showAllStages ? "All Hired Applicants" : `${stage} List`}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Click a hire to open their requirements checklist on the right.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, position..."
                    className="w-56 pl-8"
                  />
                </div>
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Department" />
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
                <Select
                  value={showAllStages ? "all" : stage}
                  onValueChange={(v) => {
                    if (v === "all") setShowAllStages(true);
                    else selectStage(v as NewHire["stage"]);
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All hired applicants</SelectItem>
                    {stages.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={openAddHire}>
                  <UserPlus className="mr-2 h-4 w-4" /> Add new hire
                </Button>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortHead sortKey="name" sort={sort} onSort={onSort}>
                      New Hire
                    </SortHead>
                    <SortHead sortKey="position" sort={sort} onSort={onSort}>
                      Position
                    </SortHead>
                    <SortHead sortKey="startDate" sort={sort} onSort={onSort}>
                      Start Date
                    </SortHead>
                    <SortHead sortKey="requirements" sort={sort} onSort={onSort}>
                      Requirements
                    </SortHead>
                    <SortHead sortKey="stage" sort={sort} onSort={onSort}>
                      Stage
                    </SortHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hirePage.pageItems.map((h) => {
                    const pct = progress(h);
                    const complete = pct === 100;
                    return (
                      <TableRow
                        key={h.id}
                        onClick={() => setSelectedId(h.id)}
                        className={cn(
                          "cursor-pointer",
                          selectedId === h.id && "bg-primary/5",
                          complete && "bg-success/5",
                        )}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback
                                className={cn(
                                  "text-xs",
                                  complete
                                    ? "bg-success/15 text-success"
                                    : "bg-primary/10 text-primary",
                                )}
                              >
                                {h.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{h.name}</p>
                              <p className="text-xs text-muted-foreground">{h.department}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{h.position}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {h.startDate}
                        </TableCell>
                        <TableCell className="w-48">
                          <Progress
                            value={pct}
                            className={cn("h-2", complete && "[&>div]:bg-success")}
                          />
                          <p
                            className={cn(
                              "mt-1 text-[0.7rem]",
                              complete ? "text-success" : "text-muted-foreground",
                            )}
                          >
                            {h.checklist.filter((c) => c.done).length}/{h.checklist.length}{" "}
                            {complete ? "· all complete" : "complete"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              complete ? "border-success/30 bg-success/15 text-success" : undefined
                            }
                          >
                            {h.stage}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {editingId === h.id ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="cursor-pointer"
                              onClick={cancelEditChecklist}
                            >
                              Cancel
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="cursor-pointer"
                              onClick={() => startEditChecklist(h)}
                            >
                              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit Checklist
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {visible.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        No hires in this stage.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <TablePagination
              page={hirePage.page}
              pageCount={hirePage.pageCount}
              from={hirePage.from}
              to={hirePage.to}
              total={hirePage.total}
              label="hires"
              onPageChange={hirePage.setPage}
            />
          </CardContent>
        </Card>

        {/* CHECKLIST PANEL — right corner */}
        <Card
          className={cn(
            "flex h-full min-w-0 flex-col border-border/70 transition-colors",
            selected &&
              progress(selected) === 100 &&
              "border-success/50 bg-success/5 ring-1 ring-success/30",
          )}
        >
          <CardContent className="flex min-w-0 flex-1 flex-col p-6">
            {!selected ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center text-sm text-muted-foreground">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </span>
                Select a hire from the list to view their requirements checklist.
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback
                        className={cn(
                          "font-display",
                          progress(selected) === 100
                            ? "bg-success/15 text-success"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {selected.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-display text-xl font-semibold">{selected.name}</h2>
                      <p className="text-xs text-muted-foreground">{selected.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="cursor-pointer"
                      onClick={() => setSelectedId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                </div>

                <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                  <p>{selected.email}</p>
                  <p>{selected.phone}</p>
                  <p>Start date: {selected.startDate}</p>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="eyebrow">Requirements checklist</span>
                    <span
                      className={cn(
                        "font-medium",
                        progress(selected) === 100 ? "text-success" : "text-muted-foreground",
                      )}
                    >
                      {progress(selected)}%
                    </span>
                  </div>
                  <Progress
                    value={progress(selected)}
                    className={cn("mt-2 h-2", progress(selected) === 100 && "[&>div]:bg-success")}
                  />
                </div>

                <ul className="mt-4 space-y-1.5">
                  {[...selected.checklist]
                    .map((c, i) => ({ ...c, i }))
                    .sort((a, b) => Number(a.done) - Number(b.done) || a.i - b.i)
                    .map((c) => {
                      const isEditingThis = editingId === selected.id;
                      return (
                        <li key={c.item} className="transition-all duration-300 ease-in-out">
                          <button
                            type="button"
                            disabled={!isEditingThis}
                            onClick={() => toggleItem(selected.id, c.item)}
                            className={cn(
                              "flex w-full items-center gap-2.5 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                              isEditingThis ? "cursor-pointer" : "cursor-not-allowed opacity-80",
                              c.done
                                ? "border-success/30 bg-success/10 text-success"
                                : "border-border hover:border-primary/40",
                            )}
                          >
                            {c.done ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <span
                              className={cn("cursor-pointer", c.done && "line-through opacity-80")}
                            >
                              {c.item}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                </ul>

                {progress(selected) === 100 && (
                  <div className="mt-4 rounded-md border border-success/40 bg-success/10 p-3 text-xs text-success">
                    All requirements complete — this hire is ready to advance.
                  </div>
                )}

                <div className="mt-auto flex flex-wrap items-stretch gap-2 pt-4">
                  <Button
                    className="h-10 flex-1"
                    disabled={selected.stage === "Regular"}
                    onClick={() => advance(selected)}
                  >
                    Advance to{" "}
                    {stages[Math.min(stages.indexOf(selected.stage) + 1, stages.length - 1)]}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10"
                    onClick={() =>
                      setHires((prev) =>
                        prev.map((h) =>
                          h.id === selected.id
                            ? {
                                ...h,
                                checklist: h.checklist.map((c) => ({ ...c, done: true })),
                              }
                            : h,
                        ),
                      )
                    }
                  >
                    Mark all done
                  </Button>
                  {editingId === selected.id ? (
                    <Button
                      variant="outline"
                      className="h-10 cursor-pointer"
                      onClick={cancelEditChecklist}
                    >
                      Cancel
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="h-10 cursor-pointer"
                      onClick={() => startEditChecklist(selected)}
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ADD NEW HIRE */}
      <Dialog
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o);
          if (!o) setNameLocked(false);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Add New Hire</DialogTitle>
            <DialogDescription>
              Creates a pre-onboarding record with the standard requirements checklist, and adds the
              hire to Employee Records.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
            Account note: the employee portal account is created with the default password{" "}
            <span className="font-medium text-foreground">{DEFAULT_ACCOUNT_PASSWORD}</span> — the
            hire is prompted to change it on first login.
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Full name</Label>
              {nameLocked ? (
                <>
                  <Input value={form.name} readOnly className="bg-muted/50" />
                  <p className="text-[0.7rem] text-muted-foreground">
                    Accepted applicant — details carried over from assessment.
                  </p>
                </>
              ) : (
                <Select
                  value={form.name}
                  onValueChange={(v) => {
                    const a = applicants.find((x) => x.name === v);
                    const p = a ? positions.find((x) => x.title === a.position) : undefined;
                    setForm((prev) => ({
                      ...prev,
                      name: v,
                      position: p?.title ?? prev.position,
                      department: p?.department ?? prev.department,
                      email: a?.email ?? prev.email,
                      phone: a?.phone ?? prev.phone,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select applicant" />
                  </SelectTrigger>
                  <SelectContent>
                    {applicants
                      .filter((a) => !hires.some((h) => h.name === a.name))
                      .map((a) => (
                        <SelectItem key={a.id} value={a.name}>
                          {a.name} — {a.position}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Position</Label>
              <Select
                value={form.position}
                onValueChange={(v) => {
                  const p = positions.find((x) => x.title === v);
                  setForm({ ...form, position: v, department: p?.department ?? form.department });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((p) => (
                    <SelectItem key={p.id} value={p.title}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select
                value={form.department}
                onValueChange={(v) => setForm({ ...form, department: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
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
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Start date</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addHire}>Add new hire</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
