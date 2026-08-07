import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  ChevronsUpDown,
  Copy,
  Facebook,
  Globe,
  FilePlus2,
  FileText,
  GripVertical,
  Instagram,
  LayoutGrid,
  List,
  PencilRuler,
  Plus,
  Search,
  Send,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useBlocker } from "@tanstack/react-router";

import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TablePagination } from "@/components/ui/table-pagination";
import { DEFAULT_PAGE_SIZE } from "@/hooks/usePagination";
import { Textarea } from "@/components/ui/textarea";
import { jobs as seedJobs, peso, type Job } from "@/data/jobs";
import { departments, positions } from "@/data/hr";
import { requisitionStore, useRequisitions, type Requisition } from "@/data/requisitions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSort } from "@/components/portal/sortable";
import { cn } from "@/lib/utils";

/** Colour-coded urgency badge classes. */
const urgencyBadge = (urgency: string) =>
  urgency === "Urgent"
    ? "border-destructive/40 bg-destructive/10 text-destructive"
    : urgency === "High"
      ? "border-warning/40 bg-warning/20 text-warning-foreground"
      : urgency === "Low"
        ? "border-border bg-muted text-muted-foreground"
        : "border-primary/30 bg-secondary/50 text-primary";

/** One-click reveal of a requisition's justification note. */
function RequisitionNote({ req, label = "View note" }: { req: Requisition; label?: string }) {
  if (!req.justification) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <FileText className="h-3.5 w-3.5" /> {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-2 p-4 text-left">
        <div>
          <p className="font-display text-sm font-semibold">Request note — {req.id}</p>
          <p className="text-[0.7rem] text-muted-foreground">
            {req.position} · {req.department} · {req.count} opening(s)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={urgencyBadge(req.urgency)}>
            {req.urgency} urgency
          </Badge>
          <span className="text-[0.7rem] text-muted-foreground">
            Requested {req.requestedAt}
          </span>
        </div>
        <p className="rounded-md bg-secondary/40 p-3 text-xs italic leading-relaxed text-muted-foreground">
          “{req.justification}”
        </p>
      </PopoverContent>
    </Popover>
  );
}


const templates = [
  {
    id: "front-office",
    name: "Front Office Template",
    summary: "Guest-facing role template with PMS and shifting-schedule language.",
    responsibilities:
      "Welcome and assist hotel guests.\nProcess check-in and check-out procedures.\nHandle reservations, inquiries, and guest concerns.",
    qualifications:
      "Bachelor's degree in Hospitality, Tourism or related field.\nAt least 1 year front office experience.\nExcellent English communication skills.",
  },
  {
    id: "kitchen",
    name: "Kitchen / Culinary Template",
    summary: "Back-of-house template with TESDA certification and sanitation clauses.",
    responsibilities:
      "Prepare mise en place for assigned station.\nCook menu items to standard recipes.\nMaintain HACCP sanitation standards.",
    qualifications:
      "TESDA Cookery NC II holder.\nAt least 2 years hot-kitchen experience.\nWilling to work shifting schedules and holidays.",
  },
  {
    id: "housekeeping",
    name: "Housekeeping Template",
    summary: "Rooms division template covering turnover targets and safety.",
    responsibilities:
      "Clean and prepare assigned guestrooms.\nReport maintenance issues promptly.\nManage linen and amenity stocks.",
    qualifications:
      "High school graduate or vocational.\nPhysically fit, attentive to detail.\nPrevious hotel housekeeping experience an advantage.",
  },
];

const platformMeta = [
  { key: "Website", icon: Globe },
  { key: "Facebook", icon: Facebook },
  { key: "Instagram", icon: Instagram },
  { key: "Indeed", icon: Briefcase },
];

type BlockId =
  | "title"
  | "info"
  | "description"
  | "responsibilities"
  | "qualifications"
  | "skills"
  | "benefits"
  | "instructions"
  | "about"
  | "social";

const blockLibrary: { id: BlockId; label: string; hint: string }[] = [
  { id: "title", label: "Job Title", hint: "Headline + department" },
  { id: "info", label: "Job Info", hint: "Type, schedule, vacancies, salary" },
  { id: "description", label: "Job Description", hint: "Short role pitch" },
  { id: "responsibilities", label: "Key Responsibilities", hint: "Bulleted duties" },
  { id: "qualifications", label: "Qualifications", hint: "Bulleted requirements" },
  { id: "skills", label: "Required Skills", hint: "Bulleted skill tags" },
  { id: "benefits", label: "Benefits", hint: "Perks badges" },
  { id: "instructions", label: "Application Instruction", hint: "How to apply" },
  { id: "about", label: "About Company", hint: "Company blurb" },
  { id: "social", label: "Social Media Links", hint: "Facebook / Instagram / website" },
];

const fullBlocks: BlockId[] = blockLibrary.map((b) => b.id);

type Draft = {
  title: string;
  department: string;
  employmentType: string;
  schedule: string;
  salaryMin: string;
  salaryMax: string;
  vacancies: string;
  description: string;
  responsibilities: string;
  qualifications: string;
  skills: string;
  benefits: string;
  instructions: string;
  about: string;
  social: string;
};

const blankDraft: Draft = {
  title: "",
  department: departments[0]?.name ?? "Front Office",
  employmentType: "Full-time",
  schedule: "Shifting Schedule",
  salaryMin: "",
  salaryMax: "",
  vacancies: "1",
  description: "",
  responsibilities: "",
  qualifications: "",
  skills: "",
  benefits: "",
  instructions: "",
  about: "",
  social: "",
};

const defaultAbout =
  "Oxford Suites Makati is a premier all-suite hotel in the heart of Makati's business district, known for warm Filipino hospitality and dependable service.";
const defaultInstructions =
  "Interested applicants may send their updated resume through this posting or walk-in for an interview at the HR Office, Oxford Suites Makati.";
const defaultSocial = "facebook.com/OxfordSuitesMakati · instagram.com/oxfordsuitesmakati";

function jobToDraft(j: Job): Draft {
  return {
    title: j.title,
    department: j.department,
    employmentType: j.employmentType,
    schedule: j.schedule,
    salaryMin: String(j.salaryMin),
    salaryMax: String(j.salaryMax),
    vacancies: String(j.vacancies),
    description: j.summary,
    responsibilities: j.responsibilities.join("\n"),
    qualifications: j.qualifications.join("\n"),
    skills: j.skills.join("\n"),
    benefits: j.benefits.join("\n"),
    instructions: defaultInstructions,
    about: defaultAbout,
    social: defaultSocial,
  };
}

function hasContentFor(id: BlockId, d: Draft): boolean {
  switch (id) {
    case "title":
      return d.title.trim() !== "";
    case "info":
      return (
        d.salaryMin.trim() !== "" ||
        d.salaryMax.trim() !== "" ||
        (d.vacancies.trim() !== "" && d.vacancies !== "1")
      );
    case "description":
      return d.description.trim() !== "";
    case "responsibilities":
      return d.responsibilities.trim() !== "";
    case "qualifications":
      return d.qualifications.trim() !== "";
    case "skills":
      return d.skills.trim() !== "";
    case "benefits":
      return d.benefits.trim() !== "";
    case "instructions":
      return d.instructions.trim() !== "";
    case "about":
      return d.about.trim() !== "";
    case "social":
      return d.social.trim() !== "";
    default:
      return false;
  }
}

function snapshotOf(d: Draft, b: BlockId[]) {
  return JSON.stringify({ d, b });
}

export function RecruitmentManagement({ role }: { role: "superadmin" | "admin" }) {
  const [jobList, setJobList] = useState<Job[]>(seedJobs);
  const [tab, setTab] = useState("postings");
  const [mode, setMode] = useState<"template" | "custom">("custom");
  const [newOpen, setNewOpen] = useState(false);
  const [blocks, setBlocks] = useState<BlockId[]>([]);
  const [dragging, setDragging] = useState<BlockId | null>(null);
  const [activeBlock, setActiveBlock] = useState<BlockId>("title");
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [reqSearch, setReqSearch] = useState("");
  const [reqStatus, setReqStatus] = useState("all");
  const [reqDept, setReqDept] = useState("all");
  const [reqUrgency, setReqUrgency] = useState("all");
  const [reqPage, setReqPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sourceReqId, setSourceReqId] = useState<string | null>(null);

  const requisitions = useRequisitions();

  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [platforms, setPlatforms] = useState<Record<string, boolean>>({
    Website: true,
    Facebook: true,
    Instagram: false,
    Indeed: true,
  });
  const [preview, setPreview] = useState("Website");

  const [deptDialogOpen, setDeptDialogOpen] = useState(false);
  const [pendingDept, setPendingDept] = useState(departments[0]?.name ?? "Front Office");
  const [pendingPosition, setPendingPosition] = useState("");
  /** False shows the "create a job posting" entry card instead of the builder canvas. */
  const [builderStarted, setBuilderStarted] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string>(snapshotOf(blankDraft, []));

  const canSaveDraft = useMemo(
    () => blocks.some((id) => hasContentFor(id, draft)),
    [blocks, draft],
  );
  const isDirty = useMemo(
    () => tab === "builder" && canSaveDraft && snapshotOf(draft, blocks) !== savedSnapshot,
    [tab, canSaveDraft, draft, blocks, savedSnapshot],
  );

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const routeBlocker = useBlocker({
    shouldBlockFn: () => isDirty,
    withResolver: true,
  });

  const saveDraftAction = () => {
    const title = draft.title.trim() || "Untitled position";
    const draftId =
      editingJobId ??
      `draft-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
    const existing = jobList.find((j) => j.id === draftId);
    const payload: Job = {
      id: draftId,
      title,
      department: draft.department,
      employmentType: draft.employmentType as Job["employmentType"],
      schedule: draft.schedule,
      salaryMin: Number(draft.salaryMin) || 0,
      salaryMax: Number(draft.salaryMax) || 0,
      vacancies: Number(draft.vacancies) || 1,
      filled: existing?.filled ?? 0,
      posted: existing?.posted ?? new Date().toISOString().slice(0, 10),
      status: "Draft",
      active: false,
      experience: existing?.experience ?? "1-2 Years",
      education: existing?.education ?? "High School Graduate",
      summary: draft.description,
      description: draft.description,
      responsibilities: lines(draft.responsibilities),
      qualifications: lines(draft.qualifications),
      skills: lines(draft.skills),
      benefits: lines(draft.benefits),
      applicants: existing?.applicants ?? 0,
      platforms: [],
    };
    setJobList((prev) =>
      prev.some((j) => j.id === draftId)
        ? prev.map((j) => (j.id === draftId ? payload : j))
        : [payload, ...prev],
    );
    setEditingJobId(draftId);
    setSavedSnapshot(snapshotOf(draft, blocks));
    toast.success(`Draft saved — “${title}” is in your postings as a draft`);
  };

  const toggleActive = (id: string) =>
    setJobList((prev) =>
      prev.map((j) =>
        j.id === id
          ? { ...j, active: !j.active, status: !j.active ? "Open" : ("Closed" as const) }
          : j,
      ),
    );

  const totalVacancies = jobList.reduce((t, j) => t + j.vacancies, 0);
  const totalFilled = jobList.reduce((t, j) => t + j.filled, 0);

  const lines = (s: string) =>
    s
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

  const applyTemplate = (id: string) => {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setDraft((d) => ({
      ...d,
      description: t.summary,
      responsibilities: t.responsibilities,
      qualifications: t.qualifications,
    }));
    toast.success(`${t.name} applied to the draft`);
  };

  const publish = () => {
    const chosen = Object.keys(platforms).filter((k) => platforms[k]);
    if (!draft.title.trim()) {
      toast.error("Job title is required");
      return;
    }
    const jobPayload: Job = {
      id:
        editingJobId ??
        `${draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()
          .toString()
          .slice(-4)}`,
      title: draft.title,
      department: draft.department,
      employmentType: draft.employmentType as Job["employmentType"],
      schedule: draft.schedule,
      salaryMin: Number(draft.salaryMin) || 0,
      salaryMax: Number(draft.salaryMax) || 0,
      vacancies: Number(draft.vacancies) || 1,
      filled: editingJobId ? (jobList.find((j) => j.id === editingJobId)?.filled ?? 0) : 0,
      posted: editingJobId
        ? (jobList.find((j) => j.id === editingJobId)?.posted ??
          new Date().toISOString().slice(0, 10))
        : new Date().toISOString().slice(0, 10),
      status: chosen.length ? "Open" : "Draft",
      active: chosen.length > 0,
      experience: "1-2 Years",
      education: "High School Graduate",
      summary: draft.description,
      description: draft.description,
      responsibilities: lines(draft.responsibilities),
      qualifications: lines(draft.qualifications),
      skills: lines(draft.skills),
      benefits: lines(draft.benefits),
      applicants: editingJobId ? (jobList.find((j) => j.id === editingJobId)?.applicants ?? 0) : 0,
      platforms: chosen,
    };

    setJobList((prev) =>
      editingJobId
        ? prev.map((j) => (j.id === editingJobId ? jobPayload : j))
        : [jobPayload, ...prev],
    );
    if (sourceReqId) {
      requisitionStore.update(sourceReqId, { status: "Converted" });
    }
    setTab("postings");
    toast.success(
      editingJobId
        ? `“${jobPayload.title}” template updated`
        : chosen.length
          ? `“${jobPayload.title}” published to ${chosen.join(", ")}`
          : `“${jobPayload.title}” saved as a draft posting`,
    );
    setEditingJobId(null);
    setSourceReqId(null);
    setBuilderStarted(false);
    setSavedSnapshot(snapshotOf(blankDraft, []));
  };

  const startNewPost = (department: string, position?: string) => {
    const seeded: Draft = { ...blankDraft, department, title: position ?? "" };
    setDraft(seeded);
    setBlocks(position ? ["title"] : []);
    setBuilderStarted(true);
    setEditingJobId(null);
    setSourceReqId(null);
    setMode("custom");
    setNewOpen(false);
    setDeptDialogOpen(false);
    setSavedSnapshot(snapshotOf(seeded, position ? ["title"] : []));
    setTab("builder");
    setPendingTab(null);
  };

  const editTemplate = (job: Job) => {
    const seeded = jobToDraft(job);
    setDraft(seeded);
    setBlocks(fullBlocks);
    setEditingJobId(job.id);
    setSourceReqId(null);
    setMode("template");
    setBuilderStarted(true);
    setSavedSnapshot(snapshotOf(seeded, fullBlocks));
    setTab("builder");
    toast.message(`Editing template for “${job.title}”`);
  };

  const copyAndUseTemplate = (job: Job) => {
    const seeded = jobToDraft(job);
    setDraft(seeded);
    setBlocks(fullBlocks);
    setEditingJobId(null);
    setSourceReqId(null);
    setMode("template");
    setBuilderStarted(true);
    setSavedSnapshot(snapshotOf(seeded, fullBlocks));
    setTab("builder");
    toast.message(`Copied “${job.title}” — publish as a new posting`);
  };

  const convertRequisition = (reqId: string) => {
    const req = requisitions.find((r) => r.id === reqId);
    if (!req) return;
    const seeded: Draft = {
      ...blankDraft,
      title: req.position,
      department: req.department,
      vacancies: String(req.count),
      description: `We are looking for ${req.count} ${req.position}(s) to join our ${req.department} team.`,
    };
    setDraft(seeded);
    setBlocks(fullBlocks);
    setEditingJobId(null);
    setSourceReqId(reqId);
    setMode("template");
    setBuilderStarted(true);
    setSavedSnapshot(snapshotOf(seeded, fullBlocks));
    setTab("builder");
    toast.message(
      `Building a job post from requisition ${req.id} — it stays pending until you publish`,
    );
  };

  const addBlock = (id: BlockId) => {
    setBlocks((b) => (b.includes(id) ? b : [...b, id]));
    setActiveBlock(id);
  };
  const removeBlock = (id: BlockId) => setBlocks((b) => b.filter((x) => x !== id));
  const dropOn = (target: BlockId) => {
    if (!dragging || dragging === target) return;
    setBlocks((b) => {
      const next = b.includes(dragging) ? b.filter((x) => x !== dragging) : [...b];
      const i = next.indexOf(target);
      next.splice(i, 0, dragging);
      return next;
    });
    setDragging(null);
  };

  const has = (id: BlockId) => blocks.includes(id);

  const openCount = useMemo(() => jobList.filter((j) => j.active).length, [jobList]);

  const filteredJobs = useMemo(() => {
    const now = new Date();
    const cutoffFor = (f: string) => {
      if (f === "7") return new Date(now.getTime() - 7 * 86400000);
      if (f === "30") return new Date(now.getTime() - 30 * 86400000);
      if (f === "90") return new Date(now.getTime() - 90 * 86400000);
      if (f === "year") return new Date(now.getFullYear(), 0, 1);
      return null;
    };
    const cutoff = cutoffFor(dateFilter);
    return jobList.filter((j) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q || j.title.toLowerCase().includes(q) || j.department.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || j.status === statusFilter;
      const matchesDept = deptFilter === "all" || j.department === deptFilter;
      const matchesDate = !cutoff || new Date(`${j.posted}T00:00:00`) >= cutoff;
      return matchesSearch && matchesStatus && matchesDept && matchesDate;
    });
  }, [jobList, search, statusFilter, deptFilter, dateFilter]);

  const listSort = useSort(filteredJobs, {
    title: (j: Job) => j.title,
    department: (j: Job) => j.department,
    status: (j: Job) => j.status,
    salary: (j: Job) => j.salaryMin,
    filled: (j: Job) => j.filled,
    posted: (j: Job) => j.posted,
  });

  const PAGE_SIZE = DEFAULT_PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(listSort.sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pagedJobs = listSort.sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, deptFilter, dateFilter]);

  const listGridCols = "grid-cols-[minmax(220px,1.4fr)_110px_150px_190px_210px_110px_190px]";

  function ListSortHead({
    sortKey,
    children,
    align = "left",
  }: {
    sortKey: "title" | "department" | "status" | "salary" | "filled" | "posted";
    children: ReactNode;
    align?: "left" | "right" | "center";
  }) {
    const active = listSort.sort?.key === sortKey;
    const Icon = !active ? ChevronsUpDown : listSort.sort?.dir === "asc" ? ArrowUp : ArrowDown;
    return (
      <button
        type="button"
        onClick={() => listSort.toggle(sortKey)}
        className={cn(
          "flex items-center gap-1.5 text-left text-[0.65rem] font-semibold uppercase tracking-wide transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
          align === "right" && "justify-end text-right",
          align === "center" && "justify-center text-center",
        )}
      >
        <span>{children}</span>
        <Icon className={cn("h-3 w-3 shrink-0", active ? "opacity-100" : "opacity-40")} />
      </button>
    );
  }

  const pendingRequisitions = requisitions.filter((r) => r.status !== "Converted");

  /** A requisition counts as new when raised within a week of the latest request. */
  const latestReqTime = Math.max(
    ...requisitions.map((r) => new Date(r.requestedAt).getTime()).filter((t) => !Number.isNaN(t)),
    0,
  );
  const isNewRequisition = (requestedAt: string) =>
    latestReqTime - new Date(requestedAt).getTime() <= 7 * 24 * 60 * 60 * 1000;

  const reqUrgencies = Array.from(new Set(requisitions.map((r) => r.urgency)));
  const filteredRequisitions = pendingRequisitions.filter((r) => {
    const q = reqSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      `${r.id} ${r.position} ${r.department} ${r.urgency} ${r.justification}`
        .toLowerCase()
        .includes(q);
    return (
      matchesSearch &&
      (reqStatus === "all" || r.status === reqStatus) &&
      (reqDept === "all" || r.department === reqDept) &&
      (reqUrgency === "all" || r.urgency === reqUrgency)
    );
  });
  const REQ_PER_PAGE = DEFAULT_PAGE_SIZE;
  const reqPageCount = Math.max(1, Math.ceil(filteredRequisitions.length / REQ_PER_PAGE));
  const reqPageSafe = Math.min(reqPage, reqPageCount);
  const visibleRequisitions = filteredRequisitions.slice(
    (reqPageSafe - 1) * REQ_PER_PAGE,
    reqPageSafe * REQ_PER_PAGE,
  );


  const handleTabChange = (value: string) => {
    if (tab === "builder" && value !== "builder" && isDirty) {
      setPendingTab(value);
      setConfirmLeaveOpen(true);
      return;
    }
    if (value === "builder" && !editingJobId && !sourceReqId && !isDirty) {
      // Always land on the dashed "Create a job posting" card first.
      setBuilderStarted(false);
      setDeptDialogOpen(false);
      setNewOpen(false);
    }
    setTab(value);

  };

  const confirmLeaveSave = () => {
    saveDraftAction();
    setConfirmLeaveOpen(false);
    if (pendingTab) setTab(pendingTab);
    setPendingTab(null);
  };

  const confirmLeaveDiscard = () => {
    setSavedSnapshot(snapshotOf(draft, blocks));
    setConfirmLeaveOpen(false);
    if (pendingTab) setTab(pendingTab);
    setPendingTab(null);
  };

  const renderFullPreview = () => (
    <div className="space-y-3">
      {has("title") && (
        <div>
          <p className="eyebrow">{draft.department || "Department"}</p>
          <h3 className="font-display text-lg font-semibold text-primary">
            {draft.title || "Untitled role"}
          </h3>
          <div className="gold-rule my-2" />
        </div>
      )}
      {has("info") && (
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-[0.6rem]">
            {draft.employmentType}
          </Badge>
          <Badge variant="secondary" className="text-[0.6rem]">
            {draft.schedule}
          </Badge>
          <Badge variant="secondary" className="text-[0.6rem]">
            {draft.vacancies} slots
          </Badge>
          {(draft.salaryMin || draft.salaryMax) && (
            <Badge variant="secondary" className="text-[0.6rem]">
              {peso(Number(draft.salaryMin) || 0)} – {peso(Number(draft.salaryMax) || 0)}
            </Badge>
          )}
        </div>
      )}
      {has("description") && draft.description && (
        <div>
          <p className="eyebrow">Job Description</p>
          <p className="text-muted-foreground">{draft.description}</p>
        </div>
      )}
      {has("responsibilities") && lines(draft.responsibilities).length > 0 && (
        <div>
          <p className="eyebrow">Key Responsibilities</p>
          <ul className="list-inside list-disc text-muted-foreground">
            {lines(draft.responsibilities).map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}
      {has("qualifications") && lines(draft.qualifications).length > 0 && (
        <div>
          <p className="eyebrow">Qualifications</p>
          <ul className="list-inside list-disc text-muted-foreground">
            {lines(draft.qualifications).map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}
      {has("skills") && lines(draft.skills).length > 0 && (
        <div>
          <p className="eyebrow">Required Skills</p>
          <div className="flex flex-wrap gap-1">
            {lines(draft.skills).map((s) => (
              <Badge key={s} variant="outline" className="text-[0.6rem]">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {has("benefits") && lines(draft.benefits).length > 0 && (
        <div>
          <p className="eyebrow">Benefits</p>
          <div className="flex flex-wrap gap-1">
            {lines(draft.benefits).map((b) => (
              <Badge key={b} variant="outline" className="text-[0.6rem]">
                {b}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {has("instructions") && draft.instructions && (
        <div>
          <p className="eyebrow">Application Instruction</p>
          <p className="text-muted-foreground">{draft.instructions}</p>
        </div>
      )}
      {has("about") && draft.about && (
        <div>
          <p className="eyebrow">About Company</p>
          <p className="text-muted-foreground">{draft.about}</p>
        </div>
      )}
      {has("social") && draft.social && (
        <div>
          <p className="eyebrow">Social Media Links</p>
          <p className="text-muted-foreground">{draft.social}</p>
        </div>
      )}
      <Button size="sm" className="mt-1 h-7 w-full text-[0.7rem]">
        Apply Now
      </Button>
    </div>
  );

  return (
    <div>
      <PageHeader
        eyebrow={role === "superadmin" ? "Super Admin · Recruitment" : "Admin · Recruitment"}
        title="Recruitment Management"
        description="Open or close postings per position, then build job posts with live multi-platform previews."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Postings" value={openCount} icon={Send} tone="primary" />
        <StatCard label="Total Vacancies" value={totalVacancies} icon={Briefcase} tone="gold" />
        <StatCard
          label="Positions Filled"
          value={totalFilled}
          hint={`${Math.round((totalFilled / totalVacancies) * 100)}% of target`}
          tone="success"
        />
        <StatCard
          label="Applications Received"
          value={jobList.reduce((t, j) => t + j.applicants, 0)}
          icon={Share2}
        />
      </div>

      <Tabs value={tab} onValueChange={handleTabChange} className="mt-6">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="postings">Vacancies & Postings</TabsTrigger>
          <TabsTrigger value="builder">Job Post Builder</TabsTrigger>
          <TabsTrigger value="requisitions">
            Requisitions from Core HCM
            {pendingRequisitions.length ? ` (${pendingRequisitions.length})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="postings" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Vacancies &amp; Postings</h2>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <div className="relative w-56">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search posted positions…"
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-44">
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
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Date posted" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any time</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="year">This year</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
                <Button
                  type="button"
                  size="icon"
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  className="h-7 w-7"
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  className="h-7 w-7"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={() => setNewOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> New job post
              </Button>
            </div>
          </div>

          <div
            className={
              viewMode === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-2"
            }
          >
            {viewMode === "list" && (
              <div className="space-y-2">
                <div
                  className={cn(
                    "hidden items-center gap-3 rounded-md border border-transparent px-3 py-1.5 md:grid",
                    listGridCols,
                  )}
                >
                  <ListSortHead sortKey="title">Position</ListSortHead>
                  <ListSortHead sortKey="status">Status</ListSortHead>
                  <ListSortHead sortKey="salary">Salary</ListSortHead>
                  <ListSortHead sortKey="filled">Filled</ListSortHead>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                    Published to
                  </span>
                  <ListSortHead sortKey="posted">Posted</ListSortHead>
                  <span className="text-right text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                    Actions
                  </span>
                </div>
                {pagedJobs.map((j) => {
                  const pct = Math.min(
                    100,
                    Math.round((j.filled / Math.max(1, j.vacancies)) * 100),
                  );
                  return (
                    <Card
                      key={j.id}
                      className={j.active ? "border-success/40" : "border-border/70 opacity-80"}
                    >
                      <CardContent className={cn("grid items-center gap-3 p-3", listGridCols)}>
                        <div className="min-w-0">
                          <p className="eyebrow truncate">{j.department}</p>
                          <h3 className="truncate font-display text-base font-semibold leading-tight">
                            {j.title}
                          </h3>
                          <p className="truncate text-[0.7rem] text-muted-foreground">
                            {j.employmentType} · {j.schedule}
                          </p>
                        </div>
                        <div>
                          <Badge
                            variant="outline"
                            className={
                              j.status === "Open"
                                ? "border-success/30 bg-success/15 text-success"
                                : "border-border"
                            }
                          >
                            {j.status}
                          </Badge>
                        </div>
                        <p className="truncate text-xs font-medium">
                          {peso(j.salaryMin)} – {peso(j.salaryMax)}
                        </p>
                        <div>
                          <div className="flex justify-between text-[0.65rem] text-muted-foreground">
                            <span>
                              {j.filled}/{j.vacancies} filled
                            </span>
                            <span>{j.applicants} applicants</span>
                          </div>
                          <Progress value={pct} className="mt-1 h-1.5" />
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          {j.platforms.map((p) => (
                            <Badge key={p} variant="secondary" className="text-[0.6rem]">
                              {p}
                            </Badge>
                          ))}
                        </div>
                        <span className="truncate text-[0.65rem] text-muted-foreground">
                          Posted {j.posted}
                        </span>
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => editTemplate(j)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => copyAndUseTemplate(j)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Switch
                            checked={j.active}
                            onCheckedChange={() => toggleActive(j.id)}
                            aria-label={`Toggle posting for ${j.title}`}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            {viewMode === "grid" &&
              pagedJobs.map((j) => {
                const pct = Math.min(100, Math.round((j.filled / Math.max(1, j.vacancies)) * 100));
                return (
                  <Card
                    key={j.id}
                    className={j.active ? "border-success/40" : "border-border/70 opacity-80"}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="eyebrow">{j.department}</p>
                          <h3 className="font-display text-xl font-semibold">{j.title}</h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {j.employmentType} · {j.schedule}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            j.status === "Open"
                              ? "border-success/30 bg-success/15 text-success"
                              : "border-border"
                          }
                        >
                          {j.status}
                        </Badge>
                      </div>

                      <p className="mt-3 text-sm font-medium">
                        {peso(j.salaryMin)} – {peso(j.salaryMax)}
                      </p>

                      <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                        <span>
                          {j.filled} filled of {j.vacancies}
                        </span>
                        <span>{j.applicants} applicants</span>
                      </div>
                      <Progress value={pct} className="mt-2 h-2" />

                      <div className="mt-3 flex flex-wrap gap-1">
                        {j.platforms.map((p) => (
                          <Badge key={p} variant="secondary" className="text-[0.65rem]">
                            {p}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
                        <Button size="sm" variant="outline" onClick={() => editTemplate(j)}>
                          Edit Template
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => copyAndUseTemplate(j)}>
                          <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy & Use Template
                        </Button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Posted {j.posted}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">
                            {j.active ? "Open" : "Closed"}
                          </span>
                          <Switch
                            checked={j.active}
                            onCheckedChange={() => toggleActive(j.id)}
                            aria-label={`Toggle posting for ${j.title}`}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            {filteredJobs.length === 0 && (
              <Card className="border-border/70 md:col-span-2 xl:col-span-3">
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  No postings match your search or filters.
                </CardContent>
              </Card>
            )}
          </div>

          <TablePagination
            page={safePage}
            pageCount={pageCount}
            from={filteredJobs.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}
            to={Math.min(safePage * PAGE_SIZE, filteredJobs.length)}
            total={filteredJobs.length}
            label="postings"
            onPageChange={setPage}
          />
        </TabsContent>

        <TabsContent value="requisitions" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold">Vacancy Requisitions</h2>
                  <p className="text-xs text-muted-foreground">
                    Requests raised from Core HCM's job position list, pending conversion into a job
                    post.
                  </p>
                </div>
                <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="w-56 pl-9"
                      placeholder="Search position, department…"
                      value={reqSearch}
                      onChange={(e) => {
                        setReqSearch(e.target.value);
                        setReqPage(1);
                      }}
                    />
                  </div>
                  <Select
                    value={reqStatus}
                    onValueChange={(v) => {
                      setReqStatus(v);
                      setReqPage(1);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={reqDept}
                    onValueChange={(v) => {
                      setReqDept(v);
                      setReqPage(1);
                    }}
                  >
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
                    value={reqUrgency}
                    onValueChange={(v) => {
                      setReqUrgency(v);
                      setReqPage(1);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All urgencies</SelectItem>
                      {reqUrgencies.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {visibleRequisitions.map((r) => (
                  <div
                    key={r.id}
                    className="grid gap-3 rounded-lg border border-border p-4 transition-colors hover:border-primary/40 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold">{r.position}</p>
                        <Badge
                          variant="outline"
                          className={
                            r.status === "Approved"
                              ? "border-success/30 bg-success/15 text-success"
                              : r.status === "Converted"
                                ? "border-border bg-muted text-muted-foreground"
                                : "border-warning/40 bg-warning/20 text-warning-foreground"
                          }
                        >
                          {r.status}
                        </Badge>
                        <Badge variant="outline" className={urgencyBadge(r.urgency)}>
                          {r.urgency} urgency
                        </Badge>
                        {isNewRequisition(r.requestedAt) && (
                          <Badge className="bg-primary text-primary-foreground">New</Badge>
                        )}
                      </div>
                      <dl className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <dt className="uppercase tracking-wide">Ref</dt>
                          <dd className="font-medium text-foreground">{r.id}</dd>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <dt className="uppercase tracking-wide">Department</dt>
                          <dd className="font-medium text-foreground">{r.department}</dd>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <dt className="uppercase tracking-wide">Openings</dt>
                          <dd className="font-medium text-foreground">{r.count}</dd>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <dt className="uppercase tracking-wide">Requested</dt>
                          <dd className="font-medium text-foreground">{r.requestedAt}</dd>
                        </div>
                      </dl>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <RequisitionNote req={r} />
                      <Button size="sm" onClick={() => convertRequisition(r.id)}>
                        Convert to job post
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredRequisitions.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No requisitions match your filters.
                  </p>
                )}
              </div>
              <TablePagination
                page={reqPageSafe}
                pageCount={reqPageCount}
                from={
                  filteredRequisitions.length === 0 ? 0 : (reqPageSafe - 1) * REQ_PER_PAGE + 1
                }
                to={Math.min(reqPageSafe * REQ_PER_PAGE, filteredRequisitions.length)}
                total={filteredRequisitions.length}
                label="requisitions"
                onPageChange={setReqPage}
              />

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="mt-4">
          {!builderStarted ? (
            <button
              type="button"
              onClick={() => {
                setPendingDept(draft.department || departments[0]!.name);
                setPendingPosition("");
                setDeptDialogOpen(true);
              }}
              className="group flex min-h-[520px] w-full flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed border-border bg-muted/20 p-12 text-center transition-all hover:border-primary/60 hover:bg-primary/5 active:scale-[0.995]"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <FilePlus2 className="h-9 w-9" />
              </span>
              <span className="font-display text-3xl font-semibold">Create a job posting</span>
              <span className="max-w-lg text-sm text-muted-foreground">
                Choose a department and job position to start a new posting, then build it with
                drag-and-drop content blocks and preview it across every hiring channel.
              </span>
              <span className="mt-1 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card px-4 py-2 text-xs font-medium text-primary">
                <Plus className="h-3.5 w-3.5" /> Start a new posting
              </span>
            </button>
          ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => {
                  setBuilderStarted(false);
                  setNewOpen(false);
                  setDeptDialogOpen(false);
                }}
                className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                Create job post
              </button>
              <span>›</span>
              <button
                type="button"
                onClick={() => {
                  setPendingDept(draft.department || departments[0]!.name);
                  setPendingPosition(draft.title);
                  setDeptDialogOpen(true);
                }}
                className="underline-offset-4 hover:text-primary hover:underline"
              >
                {draft.department || "Department"}
              </button>
              <span>›</span>
              <button
                type="button"
                onClick={() => {
                  setPendingDept(draft.department || departments[0]!.name);
                  setPendingPosition(draft.title);
                  setDeptDialogOpen(true);
                }}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {draft.title || "Untitled position"}
              </button>
              {sourceReqId &&
                (() => {
                  const sourceReq = requisitions.find((r) => r.id === sourceReqId);
                  if (!sourceReq?.justification) return null;
                  return (
                    <span className="ml-auto">
                      <RequisitionNote req={sourceReq} label="View request note" />
                    </span>
                  );
                })()}
            </div>

            <div className="grid gap-4 xl:grid-cols-[190px_minmax(0,1fr)_360px]">
              {/* Component palette */}
              <Card className="border-border/70">
                <CardContent className="p-3">
                  <p className="eyebrow mb-2 font-bold">Add Components</p>
                  <div className="space-y-1.5">
                    {blockLibrary.map((b) => (
                      <div
                        key={b.id}
                        draggable
                        onDragStart={() => setDragging(b.id)}
                        onDragEnd={() => setDragging(null)}
                        onClick={() => addBlock(b.id)}
                        className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-[0.7rem] transition ${
                          has(b.id)
                            ? "border-primary/30 bg-secondary/60"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <Plus className="h-3 w-3 shrink-0 text-muted-foreground" />
                        <span className="font-semibold">{b.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[0.65rem] text-muted-foreground">
                    Drag onto the canvas to reorder, click to add.
                  </p>

                  <div className="mt-4 space-y-1.5 border-t border-border pt-3">
                    <p className="eyebrow font-bold">Content Templates</p>
                    {templates.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => applyTemplate(t.id)}
                        className="w-full rounded-md border border-border px-2 py-1.5 text-left text-[0.68rem] hover:border-primary/40"
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Canvas / composer */}
              <Card className="border-border/70">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-semibold">
                      {editingJobId ? "Edit Your Job Post" : "Edit Your Job Post"}
                    </h2>
                  </div>

                  <div className="space-y-2">
                    {blocks.map((id) => {
                      const meta = blockLibrary.find((b) => b.id === id)!;
                      return (
                        <div
                          key={id}
                          draggable
                          onDragStart={() => setDragging(id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => dropOn(id)}
                          onClick={() => setActiveBlock(id)}
                          className={`rounded-md border px-3 py-2 transition ${
                            activeBlock === id
                              ? "border-primary bg-secondary/40"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-xs font-medium">
                              <GripVertical className="h-3 w-3 cursor-grab text-muted-foreground" />
                              {meta.label}
                              <span className="text-[0.65rem] font-normal text-muted-foreground">
                                {meta.hint}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeBlock(id);
                              }}
                              aria-label={`Remove ${meta.label}`}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>

                          {activeBlock === id && (
                            <div className="mt-2 space-y-2">
                              {id === "title" && (
                                <div className="grid gap-2 sm:grid-cols-2">
                                  <div className="space-y-1">
                                    <Label className="text-[0.7rem]">Job title</Label>
                                    <Input
                                      className="h-8 text-xs"
                                      value={draft.title}
                                      onChange={(e) =>
                                        setDraft({ ...draft, title: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[0.7rem]">Department</Label>
                                    <Select
                                      value={draft.department}
                                      onValueChange={(v) => setDraft({ ...draft, department: v })}
                                    >
                                      <SelectTrigger className="h-8 text-xs">
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
                                </div>
                              )}
                              {id === "info" && (
                                <div className="grid gap-2 sm:grid-cols-3">
                                  <div className="space-y-1">
                                    <Label className="text-[0.7rem]">Type</Label>
                                    <Select
                                      value={draft.employmentType}
                                      onValueChange={(v) =>
                                        setDraft({ ...draft, employmentType: v })
                                      }
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {["Full-time", "Part-time", "Contract", "Seasonal"].map(
                                          (t) => (
                                            <SelectItem key={t} value={t}>
                                              {t}
                                            </SelectItem>
                                          ),
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[0.7rem]">Schedule</Label>
                                    <Input
                                      className="h-8 text-xs"
                                      value={draft.schedule}
                                      onChange={(e) =>
                                        setDraft({ ...draft, schedule: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[0.7rem]">Vacancies</Label>
                                    <Input
                                      className="h-8 text-xs"
                                      value={draft.vacancies}
                                      onChange={(e) =>
                                        setDraft({ ...draft, vacancies: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[0.7rem]">Salary min (₱)</Label>
                                    <Input
                                      className="h-8 text-xs"
                                      value={draft.salaryMin}
                                      onChange={(e) =>
                                        setDraft({ ...draft, salaryMin: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[0.7rem]">Salary max (₱)</Label>
                                    <Input
                                      className="h-8 text-xs"
                                      value={draft.salaryMax}
                                      onChange={(e) =>
                                        setDraft({ ...draft, salaryMax: e.target.value })
                                      }
                                    />
                                  </div>
                                </div>
                              )}
                              {id === "description" && (
                                <Textarea
                                  rows={2}
                                  className="text-xs"
                                  value={draft.description}
                                  onChange={(e) =>
                                    setDraft({ ...draft, description: e.target.value })
                                  }
                                  placeholder="Short pitch of the role…"
                                />
                              )}
                              {id === "responsibilities" && (
                                <Textarea
                                  rows={3}
                                  className="text-xs"
                                  value={draft.responsibilities}
                                  onChange={(e) =>
                                    setDraft({ ...draft, responsibilities: e.target.value })
                                  }
                                  placeholder="One responsibility per line…"
                                />
                              )}
                              {id === "qualifications" && (
                                <Textarea
                                  rows={3}
                                  className="text-xs"
                                  value={draft.qualifications}
                                  onChange={(e) =>
                                    setDraft({ ...draft, qualifications: e.target.value })
                                  }
                                  placeholder="One qualification per line…"
                                />
                              )}
                              {id === "skills" && (
                                <Textarea
                                  rows={2}
                                  className="text-xs"
                                  value={draft.skills}
                                  onChange={(e) => setDraft({ ...draft, skills: e.target.value })}
                                  placeholder="One skill per line…"
                                />
                              )}
                              {id === "benefits" && (
                                <Textarea
                                  rows={2}
                                  className="text-xs"
                                  value={draft.benefits}
                                  onChange={(e) => setDraft({ ...draft, benefits: e.target.value })}
                                  placeholder="One benefit per line…"
                                />
                              )}
                              {id === "instructions" && (
                                <Textarea
                                  rows={2}
                                  className="text-xs"
                                  value={draft.instructions}
                                  onChange={(e) =>
                                    setDraft({ ...draft, instructions: e.target.value })
                                  }
                                  placeholder="How should applicants apply?"
                                />
                              )}
                              {id === "about" && (
                                <Textarea
                                  rows={2}
                                  className="text-xs"
                                  value={draft.about}
                                  onChange={(e) => setDraft({ ...draft, about: e.target.value })}
                                  placeholder="Company blurb…"
                                />
                              )}
                              {id === "social" && (
                                <Textarea
                                  rows={2}
                                  className="text-xs"
                                  value={draft.social}
                                  onChange={(e) => setDraft({ ...draft, social: e.target.value })}
                                  placeholder="Social media links…"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => dragging && addBlock(dragging)}
                      className="rounded-md border border-dashed border-border py-3 text-center text-[0.7rem] text-muted-foreground"
                    >
                      Drop a component here
                    </div>
                  </div>

                  <div className="rounded-md border border-border p-3">
                    <p className="eyebrow mb-2">Publish To</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {platformMeta.map((p) => (
                        <div key={p.key} className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-xs">
                            <p.icon className="h-3.5 w-3.5 text-muted-foreground" /> {p.key}
                          </span>
                          <Switch
                            checked={platforms[p.key] ?? false}
                            onCheckedChange={(v) => setPlatforms({ ...platforms, [p.key]: v })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!canSaveDraft}
                      onClick={saveDraftAction}
                    >
                      Save draft
                    </Button>
                    <Button size="sm" onClick={publish}>
                      <Send className="mr-2 h-4 w-4" />
                      {editingJobId ? "Update template" : "Publish job post"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card className="border-border/70">
                <CardContent className="p-4">
                  <h2 className="font-display text-lg font-semibold">Preview</h2>
                  <Tabs value={preview} onValueChange={setPreview} className="mt-2">
                    <TabsList className="flex h-auto flex-wrap justify-start">
                      {platformMeta.map((p) => (
                        <TabsTrigger key={p.key} value={p.key} className="text-xs">
                          <p.icon className="mr-1.5 h-3.5 w-3.5" /> {p.key}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {platformMeta.map((p) => (
                      <TabsContent key={p.key} value={p.key} className="mt-3">
                        <div className="rounded-md border border-border bg-muted/30 p-3 text-[0.7rem]">
                          <p className="eyebrow mb-2">{p.key} preview — full listing</p>
                          <div className="rounded-md bg-card p-3">{renderFullPreview()}</div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={newOpen || deptDialogOpen}
        onOpenChange={(open) => {
          setNewOpen(open);
          setDeptDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose department and job position</DialogTitle>
            <DialogDescription>
              Pick the department and the position this job post is for — it seeds the builder with a
              blank, customizable template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Department</Label>
              <Select
                value={pendingDept}
                onValueChange={(v) => {
                  setPendingDept(v);
                  setPendingPosition("");
                }}
              >
                <SelectTrigger className="h-9 text-sm">
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
              <Label className="text-xs">Job position</Label>
              <Select value={pendingPosition} onValueChange={setPendingPosition}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select a position" />
                </SelectTrigger>
                <SelectContent>
                  {positions
                    .filter((p) => p.department === pendingDept)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.title}>
                        {p.title}
                      </SelectItem>
                    ))}
                  {positions.filter((p) => p.department === pendingDept).length === 0 && (
                    <div className="px-2 py-3 text-xs text-muted-foreground">
                      No positions defined for this department.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setNewOpen(false);
                setDeptDialogOpen(false);
              }}
            >
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button
              disabled={!pendingPosition}
              onClick={() => startNewPost(pendingDept, pendingPosition)}
            >
              <PencilRuler className="mr-2 h-4 w-4" /> Start job post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmLeaveOpen} onOpenChange={setConfirmLeaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save this job post as a draft?</DialogTitle>
            <DialogDescription>
              You have unsaved changes in the Job Post Builder. Save your progress as a draft before
              leaving, or discard the changes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmLeaveOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={confirmLeaveDiscard}>
              Discard
            </Button>
            <Button onClick={confirmLeaveSave}>Save as draft & leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={routeBlocker.status === "blocked"}
        onOpenChange={(open) => {
          if (!open) routeBlocker.reset?.();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save this job post as a draft?</DialogTitle>
            <DialogDescription>
              You’re navigating away with unsaved Job Post Builder changes. Save your progress as a
              draft before leaving, or discard the changes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => routeBlocker.reset?.()}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSavedSnapshot(snapshotOf(draft, blocks));
                routeBlocker.proceed?.();
              }}
            >
              Discard
            </Button>
            <Button
              onClick={() => {
                saveDraftAction();
                routeBlocker.proceed?.();
              }}
            >
              Save as draft & leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
