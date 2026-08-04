import { useMemo, useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Mail,
  MoreHorizontal,
  Repeat2,
  ScanLine,
  Search,
  Settings2,
  Sliders,
  Sparkles,
  Star,
  Trophy,
  Upload,
  UserPlus,
  Users,
  XCircle,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
} from "recharts";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  applicants as seedApplicants,
  assessmentCriteria,
  interviewers,
  interviews as seedInterviews,
  screeningCriteria,
  statusMeta,
  type Applicant,
  type ApplicantStatus,
} from "@/data/applicants";
import { positions } from "@/data/hr";
import { cn } from "@/lib/utils";

const statusChartColor: Record<ApplicantStatus, string> = {
  fit: "var(--color-success)",
  "other-role": "var(--color-warning)",
  credential: "var(--color-caution)",
  "not-fit": "var(--color-destructive)",
};

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius)",
  fontSize: 12,
};

/** Keyword library suggested per job position for the screening setup checklist. */
const keywordLibrary: Record<string, string[]> = {
  "Front Desk Receptionist": [
    "Guest Relations",
    "Opera PMS",
    "Check-in / Check-out",
    "TESDA Front Office NC II",
    "Cash Handling",
    "Reservations",
  ],
  "Guest Relations Officer": [
    "Guest Relations",
    "Complaint Handling",
    "VIP Handling",
    "BS Tourism",
    "Multilingual",
  ],
  "Restaurant Server": [
    "Table Service",
    "POS Systems",
    "Banquet Service",
    "Food Safety",
    "Upselling",
  ],
  Bartender: ["Mixology", "TESDA Bartending NC II", "Inventory", "Cocktail Craft", "Bar Hygiene"],
  "Line Cook": [
    "Hot Kitchen",
    "TESDA Cookery NC II",
    "Food Handler",
    "HACCP",
    "Mise en Place",
    "Plating",
  ],
  "Pastry Chef": ["Pastry", "Baking", "Dessert Plating", "Culinary Arts Diploma", "HACCP"],
  "Housekeeping Attendant": [
    "Room Turnover",
    "Linen Handling",
    "Chemical Safety",
    "Public Area Cleaning",
    "TESDA Housekeeping NC II",
  ],
  "HR Assistant": ["Recruitment", "201 Files", "Payroll Support", "BS Psychology", "DOLE Compliance"],
};

const suggestedSlots = [
  { date: "2026-08-03", times: ["09:00 AM", "10:30 AM", "02:00 PM"] },
  { date: "2026-08-04", times: ["09:00 AM", "01:30 PM"] },
  { date: "2026-08-05", times: ["10:00 AM", "03:00 PM", "04:30 PM"] },
  { date: "2026-08-06", times: ["09:30 AM", "02:30 PM"] },
];

type AssessmentResult = {
  applicantId: string;
  name: string;
  position: string;
  scores: Record<string, number>;
  total: number;
  remarks: string;
  date: string;
  outcome: "Recommended" | "Hold" | "Not Recommended";
};

const seedAssessments: AssessmentResult[] = [
  {
    applicantId: "APP-1032",
    name: "Camille Ortega",
    position: "Front Desk Receptionist",
    scores: {},
    total: 94,
    remarks: "Excellent guest-facing presence; completed practical front desk simulation.",
    date: "2026-07-23",
    outcome: "Recommended",
  },
  {
    applicantId: "APP-1035",
    name: "Jompaks Berdugo",
    position: "Bartender",
    scores: {},
    total: 88,
    remarks: "Strong mixology demo, needs coaching on upselling scripts.",
    date: "2026-07-25",
    outcome: "Recommended",
  },
  {
    applicantId: "APP-1036",
    name: "Kevin Dela Cruz",
    position: "Line Cook",
    scores: {},
    total: 82,
    remarks: "Solid knife skills and station timing during the cook test.",
    date: "2026-07-26",
    outcome: "Recommended",
  },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

const reportOptions = [
  {
    id: "all",
    title: "All Applicants",
    description: "Complete list of every applicant on record with status and stage.",
  },
  {
    id: "status",
    title: "By Status",
    description: "Breakdown of applicants grouped by screening status.",
  },
  {
    id: "position",
    title: "By Position",
    description: "Applicant counts and pass rates segmented per job position.",
  },
  {
    id: "screening",
    title: "Screening Results",
    description: "Detailed NER screening scores, keywords and flags for each resume.",
  },
  {
    id: "interview",
    title: "Interview Summary",
    description: "Scheduled, completed and upcoming interviews with outcomes.",
  },
];

const isoOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function ApplicantManagement({ role }: { role: "superadmin" | "admin" }) {
  const [rows, setRows] = useState<Applicant[]>(seedApplicants);
  const [tab, setTab] = useState("ranking");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [review, setReview] = useState<Applicant | null>(null);
  const [evaluating, setEvaluating] = useState<Applicant | null>(null);
  const [referring, setReferring] = useState<Applicant | null>(null);
  const [referTarget, setReferTarget] = useState("");
  const [criteria, setCriteria] = useState(screeningCriteria);
  const [passing, setPassing] = useState(75);
  const [keywordPosition, setKeywordPosition] = useState(positions[0]!.title);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(
    keywordLibrary[positions[0]!.title] ?? [],
  );
  const [keywords, setKeywords] = useState(
    "guest relations, opera pms, tesda, food handler, mixology, housekeeping",
  );
  const [interviews, setInterviews] = useState(seedInterviews);
  const [assessments, setAssessments] = useState<AssessmentResult[]>(seedAssessments);
  const [assessmentFilter, setAssessmentFilter] = useState<"ready" | "completed" | "all">("all");
  const [evalScores, setEvalScores] = useState<Record<string, number>>({});
  const [evalRemarks, setEvalRemarks] = useState("");
  const [viewMonth, setViewMonth] = useState<Date>(new Date(2026, 7, 1));
  const [reportsOpen, setReportsOpen] = useState(false);
  const [screeningOpen, setScreeningOpen] = useState(false);
  const [interviewSearch, setInterviewSearch] = useState("");
  const [interviewStatusFilter, setInterviewStatusFilter] = useState<string>("all");
  const [interviewModeFilter, setInterviewModeFilter] = useState<string>("all");
  const [schedule, setSchedule] = useState({
    applicant: "",
    date: "2026-08-03",
    time: "09:00 AM",
    mode: "On-site",
    interviewer: interviewers[0]!.name,
  });

  // Add-applicant flow
  const [addOpen, setAddOpen] = useState(false);
  const [addStep, setAddStep] = useState<1 | 2 | 3>(1);
  const [addMethod, setAddMethod] = useState<"file" | "image">("file");
  const [addFileName, setAddFileName] = useState("");
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    position: positions[0]!.title,
  });
  const [screenResult, setScreenResult] = useState<{
    score: number;
    status: ApplicantStatus;
    entities: { label: string; value: string }[];
  } | null>(null);

  const distribution = useMemo(() => {
    const scoped = positionFilter === "all" ? rows : rows.filter((a) => a.position === positionFilter);
    return (Object.keys(statusMeta) as ApplicantStatus[]).map((k) => ({
      key: k,
      name: statusMeta[k].label,
      value: scoped.filter((a) => a.status === k).length,
    }));
  }, [rows, positionFilter]);

  const screenedTotal = distribution.reduce((t, d) => t + d.value, 0);

  const topFiveToday = useMemo(
    () =>
      [...rows]
        .filter((a) => a.stage !== "Rejected")
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
    [rows],
  );

  const filtered = rows.filter((a) => {
    if (positionFilter !== "all" && a.position !== positionFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (search && !`${a.name} ${a.email} ${a.position}`.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const setStage = (id: string, stage: Applicant["stage"]) =>
    setRows((prev) => prev.map((a) => (a.id === id ? { ...a, stage } : a)));

  /** Accept → prefill the scheduler and jump to the Interview Scheduling tab. */
  const acceptAndSchedule = (a: Applicant) => {
    setSchedule((s) => ({ ...s, applicant: a.name }));
    setReview(null);
    setTab("scheduling");
    toast.success(`${a.name} moved to scheduling`, {
      description: "Pick a suggested date and slot on the interview calendar.",
    });
  };

  const confirmSchedule = () => {
    if (!schedule.applicant) {
      toast.error("Select an applicant first");
      return;
    }
    const src = rows.find((a) => a.name === schedule.applicant);
    setInterviews((prev) => [
      {
        id: `INT-${300 + prev.length}`,
        applicant: schedule.applicant,
        position: src?.position ?? "—",
        date: schedule.date,
        time: schedule.time,
        mode: schedule.mode as "On-site" | "Virtual",
        interviewer: schedule.interviewer,
        status: "Scheduled",
      },
      ...prev,
    ]);
    if (src) setStage(src.id, "Interview Scheduled");
    toast.success(`Interview confirmed for ${schedule.applicant}`, {
      description: `${schedule.date} · ${schedule.time} · ${schedule.mode}`,
    });
  };

  const reject = (a: Applicant) => {
    setStage(a.id, "Rejected");
    toast(`${a.name} marked as rejected`, { description: "Regret letter queued for sending." });
  };

  const openRefer = (a: Applicant) => {
    setReferring(a);
    const suggested = a.flags.find((f) => f.startsWith("Stronger match:"));
    setReferTarget(
      suggested ? suggested.replace("Stronger match:", "").split("(")[0]!.trim() : "",
    );
  };

  const totalWeight = criteria.reduce((t, c) => t + (c.enabled ? c.weight : 0), 0);

  const runScreening = () => {
    const score = 62 + Math.floor(Math.random() * 34);
    const status: ApplicantStatus = score >= 85 ? "fit" : score >= 70 ? "other-role" : "credential";
    setScreenResult({
      score,
      status,
      entities: [
        { label: "PERSON", value: addForm.name || "Detected from document" },
        { label: "SKILL", value: (keywordLibrary[addForm.position] ?? ["Guest Service"])[0]! },
        { label: "ORG", value: "Previous employer detected" },
        { label: "EDU", value: "Hospitality-related coursework" },
      ],
    });
    setAddStep(3);
  };

  const saveNewApplicant = () => {
    if (!addForm.name || !addForm.email || !addForm.phone || !addForm.address) {
      toast.error("Complete name, email, phone number and address.");
      return;
    }
    const res = screenResult!;
    const now = new Date();
    setRows((prev) => [
      {
        id: `APP-${1042 + prev.length - seedApplicants.length}`,
        name: addForm.name,
        email: addForm.email,
        phone: addForm.phone,
        position: addForm.position,
        jobId: addForm.position.toLowerCase().replace(/[^a-z]+/g, "-"),
        appliedAt: `${isoOf(now)} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
        score: res.score,
        status: res.status,
        stage: "Screened",
        source: addMethod === "image" ? "Walk-in" : "Online Portal",
        entities: res.entities,
        breakdown: [
          { criterion: "Skills", score: Math.round(res.score * 0.4) },
          { criterion: "Work Experience", score: Math.round(res.score * 0.3) },
          { criterion: "Educational Background", score: Math.round(res.score * 0.2) },
          { criterion: "Certifications", score: Math.round(res.score * 0.1) },
        ],
        flags: res.status === "credential" ? ["Manual credential verification required"] : [],
        summary: `Added via ${addMethod === "image" ? "image (OCR)" : "document"} screening — ${addFileName || "uploaded resume"}.`,
      },
      ...prev,
    ]);
    toast.success(`${addForm.name} added to the applicant list`);
    setAddOpen(false);
    setAddStep(1);
    setScreenResult(null);
    setAddFileName("");
    setAddForm({ name: "", email: "", phone: "", address: "", position: positions[0]!.title });
  };

  const monthCells = useMemo(() => {
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return { date, inMonth: date.getMonth() === viewMonth.getMonth() };
    });
  }, [viewMonth]);

  const slotsForSelected = suggestedSlots.find((s) => s.date === schedule.date)?.times ?? [
    "09:00 AM",
    "01:00 PM",
    "03:30 PM",
  ];

  const readyToAssess = rows.filter(
    (a) => a.stage === "Interview Scheduled" && !assessments.some((x) => x.applicantId === a.id),
  );

  return (
    <div>
      <PageHeader
        eyebrow={role === "superadmin" ? "Super Admin · Recruitment" : "Admin · Recruitment"}
        title="Applicant Management"
        description="spaCy NER resume screening, candidate ranking, interview scheduling and evaluation."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setReportsOpen(true)}>
              <FileText className="mr-2 h-4 w-4" /> Reports
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label="Screening setup"
              title="Screening setup"
              onClick={() => setScreeningOpen(true)}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Applicants" value={rows.length} icon={Users} tone="primary" />
        <StatCard
          label="Passed Screening"
          value={rows.filter((a) => a.score >= passing).length}
          hint={`Passing score ${passing}%`}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Scheduled Interviews"
          value={interviews.filter((i) => i.status === "Scheduled").length}
          icon={CalendarDays}
          tone="gold"
          onClick={() => setTab("scheduling")}
        />
        <StatCard
          label="Ready to Assess"
          value={readyToAssess.length}
          icon={ClipboardCheck}
        />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="ranking">Ranking &amp; Applicants</TabsTrigger>
          <TabsTrigger value="scheduling">Interview Scheduling</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
        </TabsList>

        {/* RANKING + TABLE */}
        <TabsContent value="ranking" className="mt-4 space-y-6">
          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <Card className="border-border/70">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl font-semibold">Candidate Ranking</h2>
                    <p className="text-xs text-muted-foreground">
                      Resume screening results — {screenedTotal} resume
                      {screenedTotal === 1 ? "" : "s"} processed
                      {positionFilter !== "all" ? ` for ${positionFilter}` : " across all positions"}.
                    </p>
                  </div>
                  <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
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
                </div>

                <div className="mt-2 flex flex-col items-center">
                  <div className="h-[280px] w-full max-w-md">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distribution}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={58}
                          outerRadius={92}
                          paddingAngle={2}
                          label={(e: { value?: number }) =>
                            e.value && screenedTotal
                              ? `${Math.round(((e.value ?? 0) / screenedTotal) * 100)}%`
                              : ""
                          }
                          labelLine={false}
                        >
                          {distribution.map((d) => (
                            <Cell key={d.key} fill={statusChartColor[d.key]} />
                          ))}
                        </Pie>
                        <RTooltip contentStyle={tooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                    {distribution.map((d) => (
                      <div
                        key={d.key}
                        className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                      >
                        <span className="flex items-center gap-2 text-xs">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: statusChartColor[d.key] }}
                          />
                          {d.name}
                        </span>
                        <span className="font-display text-base font-semibold">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>

            <Card className="flex flex-col overflow-hidden border-border/70 xl:max-h-[34rem]">
              <CardContent className="flex min-h-0 flex-1 flex-col p-6">
                <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                  <Trophy className="h-5 w-5 text-gold" /> Top 5 Candidates Today
                </h2>
                <p className="text-xs text-muted-foreground">
                  Highest ranked resumes from today&apos;s screening batch.
                </p>
                <ol className="mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
                  {topFiveToday.map((a, i) => (
                    <li
                      key={a.id}
                      className="flex flex-col gap-2 rounded-md border border-border p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-display text-xs font-semibold",
                            i === 0
                              ? "bg-gold text-gold-foreground"
                              : "bg-secondary text-secondary-foreground",
                          )}
                        >
                          {i + 1}
                        </span>
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-secondary text-[0.65rem]">
                            {initials(a.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{a.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{a.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={statusMeta[a.status].className}>
                          {statusMeta[a.status].label}
                        </Badge>
                        <span className="font-display text-base font-semibold text-primary">
                          {a.score}%
                        </span>
                      </div>
                      <Button size="sm" variant="outline" className="w-full" onClick={() => setReview(a)}>
                        Review
                      </Button>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold">Applicant List</h2>
                  <p className="text-xs text-muted-foreground">
                    Based on the applied job position
                    {positionFilter !== "all" ? ` · ${positionFilter}` : " · all positions"}.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Input
                    placeholder="Search applicant…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-56"
                  />
                  <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger className="w-52">
                      <SelectValue />
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
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-52">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      {(Object.keys(statusMeta) as ApplicantStatus[]).map((k) => (
                        <SelectItem key={k} value={k}>
                          {statusMeta[k].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={() => setAddOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" /> Add applicant
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <Table className="table-fixed text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[22%]">Applicant</TableHead>
                      <TableHead className="hidden w-[18%] md:table-cell">Contact</TableHead>
                      <TableHead className="w-[16%]">Position</TableHead>
                      <TableHead className="w-[11%]">Applied</TableHead>
                      <TableHead className="w-[8%]">Score</TableHead>
                      <TableHead className="w-[13%]">Status</TableHead>
                      <TableHead className="w-[8%]">Stage</TableHead>
                      <TableHead className="w-[15%] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="max-w-0">
                          <div className="flex min-w-0 items-center gap-2">
                            <Avatar className="h-7 w-7 shrink-0">
                              <AvatarFallback className="bg-secondary text-[0.65rem]">
                                {initials(a.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate font-medium" title={a.name}>
                                {a.name}
                              </p>
                              <p className="truncate text-muted-foreground">{a.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden max-w-0 md:table-cell">
                          <p className="truncate" title={a.email}>
                            {a.email}
                          </p>
                          <p className="truncate text-muted-foreground">{a.phone}</p>
                        </TableCell>
                        <TableCell className="max-w-0 truncate" title={a.position}>
                          {a.position}
                        </TableCell>
                        <TableCell className="max-w-0 truncate text-muted-foreground" title={a.appliedAt}>
                          {a.appliedAt}
                        </TableCell>
                        <TableCell>
                          <span className="font-display text-sm font-semibold">{a.score}%</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("max-w-full truncate px-1.5 py-0.5", statusMeta[a.status].className)}
                            title={statusMeta[a.status].label}
                          >
                            <span
                              className={cn(
                                "mr-1 h-1.5 w-1.5 shrink-0 rounded-full",
                                statusMeta[a.status].dot,
                              )}
                            />
                            <span className="truncate">{statusMeta[a.status].label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-0 truncate" title={a.stage}>
                          {a.stage}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              title="Review resume screening result"
                              onClick={() => setReview(a)}
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              title="Accept and go to interview scheduling"
                              onClick={() => acceptAndSchedule(a)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              title="Refer to another position"
                              onClick={() => openRefer(a)}
                            >
                              <Repeat2 className="h-3.5 w-3.5 text-warning" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              title="Reject applicant"
                              onClick={() => reject(a)}
                            >
                              <XCircle className="h-3.5 w-3.5 text-destructive" />
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
        </TabsContent>

        {/* SCHEDULING */}
        <TabsContent value="scheduling" className="mt-4 space-y-6">
          <div className="grid items-start gap-6 xl:grid-cols-2">
            {/* ── Interview Calendar ─────────────────────────────── */}
            <Card className="rounded-xl border-border/70 shadow-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CalendarDays className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-display text-2xl font-semibold">Interview Calendar</h2>
                      <p className="text-xs text-muted-foreground">
                        Pick a date to view availability and interviews.
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const today = new Date("2026-08-03");
                        setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                        setSchedule((s) => ({ ...s, date: isoOf(today) }));
                      }}
                    >
                      Today
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="Previous month"
                      onClick={() =>
                        setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="Next month"
                      onClick={() =>
                        setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="mt-5 font-display text-xl font-semibold">
                  {viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>

                <div className="mt-3 grid grid-cols-7 text-center text-[0.65rem] font-semibold tracking-wide text-muted-foreground">
                  {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                    <span key={d} className="py-2">
                      {d}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-7 overflow-hidden rounded-lg border border-border">
                  {monthCells.map((cell) => {
                    const iso = isoOf(cell.date);
                    const count = interviews.filter((i) => i.date === iso).length;
                    const suggested = suggestedSlots.some((s) => s.date === iso);
                    const selected = schedule.date === iso;
                    return (
                      <button
                        key={iso}
                        type="button"
                        aria-label={cell.date.toDateString()}
                        aria-pressed={selected}
                        onClick={() => {
                          setSchedule((s) => ({ ...s, date: iso }));
                        }}
                        className={cn(
                          "relative h-[3.1rem] border-b border-r border-border/70 text-sm transition-colors last:border-r-0",
                          !cell.inMonth && "bg-muted/20 text-muted-foreground/50",
                          cell.inMonth && !selected && "hover:bg-muted/50",
                          count > 0 && !selected && "bg-primary/5 font-semibold text-primary",
                          selected && "bg-primary font-semibold text-primary-foreground",
                        )}
                      >
                        {cell.date.getDate()}
                        {count > 0 && (
                          <span
                            className={cn(
                              "absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full",
                              selected ? "bg-primary-foreground" : "bg-primary",
                            )}
                          />
                        )}
                        {count === 0 && suggested && cell.inMonth && (
                          <span className="absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gold" />
                        )}
                        {count > 1 && (
                          <span className="absolute -top-1 -right-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-semibold text-primary-foreground">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" /> Booked
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-gold" /> Suggested free day
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/30" /> No availability
                  </span>
                </div>

                <div className="mt-5">
                  <div className="flex items-center gap-2">
                    <p className="font-display text-base font-semibold">
                      Interviews on{" "}
                      {new Date(`${schedule.date}T00:00:00`).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                      {interviews.filter((i) => i.date === schedule.date).length}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-2">
                    {interviews
                      .filter((i) => i.date === schedule.date)
                      .map((i) => (
                        <button
                          key={i.id}
                          type="button"
                          onClick={() => toast(`Viewing interview — ${i.applicant}`)}
                          className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border/70 bg-muted/20 p-2.5 text-left transition-colors hover:bg-muted/40"
                        >
                          <span className="shrink-0 rounded-md bg-card px-2.5 py-1.5 text-xs font-semibold text-primary shadow-sm">
                            {i.time}
                          </span>
                          <span className="grid min-w-0 gap-1 sm:grid-cols-2">
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">
                                {i.applicant}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {i.position}
                              </span>
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">
                                {i.interviewer}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {i.mode}
                              </span>
                            </span>
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </button>
                      ))}
                    {interviews.filter((i) => i.date === schedule.date).length === 0 && (
                      <p className="rounded-lg border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
                        No interviews booked — the whole day is free.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Book an Interview ──────────────────────────────── */}
            <Card className="rounded-xl border-border/70 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CalendarClock className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-2xl font-semibold">Book an Interview</h2>
                    <p className="text-xs text-muted-foreground">
                      Fill in the details to schedule an interview and send an invite.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm">
                      <span className="text-primary">1.</span> Select Applicant
                    </Label>
                    <Select
                      value={schedule.applicant}
                      onValueChange={(v) => setSchedule({ ...schedule, applicant: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select applicant" />
                      </SelectTrigger>
                      <SelectContent>
                        {rows.map((a) => (
                          <SelectItem key={a.id} value={a.name}>
                            {a.name} — {a.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">
                      <span className="text-primary">2.</span> Choose Date
                    </Label>
                    <p className="text-xs font-medium text-muted-foreground">Suggested dates</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedSlots.map((s) => {
                        const active = schedule.date === s.date;
                        return (
                          <button
                            key={s.date}
                            type="button"
                            onClick={() => {
                              setSchedule((p) => ({ ...p, date: s.date, time: s.times[0]! }));
                              const d = new Date(`${s.date}T00:00:00`);
                              setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                            }}
                            className={cn(
                              "rounded-full border px-4 py-2 text-xs font-medium transition-colors",
                              active
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50",
                            )}
                          >
                            {new Date(`${s.date}T00:00:00`).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            <span className="ml-1 font-normal text-muted-foreground">
                              ({s.times.length} slots)
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">
                      <span className="text-primary">3.</span> Select Time Slot
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {slotsForSelected.map((t) => {
                        const taken = interviews.some(
                          (i) => i.date === schedule.date && i.time === t,
                        );
                        return (
                          <button
                            key={t}
                            type="button"
                            disabled={taken}
                            onClick={() => setSchedule((p) => ({ ...p, time: t }))}
                            className={cn(
                              "rounded-full border px-4 py-2 text-xs font-medium transition-colors",
                              taken && "cursor-not-allowed opacity-40 line-through",
                              schedule.time === t && !taken
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50",
                            )}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm">
                          <span className="text-primary">4.</span> Interview Details
                        </Label>
                        <Select
                          value={schedule.mode}
                          onValueChange={(v) => setSchedule({ ...schedule, mode: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="On-site">On-site</SelectItem>
                            <SelectItem value="Virtual">Virtual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Interviewer</Label>
                        <Select
                          value={schedule.interviewer}
                          onValueChange={(v) => setSchedule({ ...schedule, interviewer: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {interviewers.map((s) => (
                              <SelectItem key={s.id} value={s.name}>
                                {s.name} — {s.role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/25 p-4">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0 text-sm">
                      <p className="font-medium">
                        {schedule.mode === "Virtual" ? "Virtual Interview" : "On-site Interview"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {schedule.mode === "Virtual"
                          ? "Meeting link: meet.oxfordsuites.ph/interview-room"
                          : "Location: Oxford Suites Makati, HR Office, 3rd Floor"}
                      </p>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" onClick={confirmSchedule}>
                    <Mail className="mr-2 h-4 w-4" /> Confirm &amp; Send Invitation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>



          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-semibold">Scheduled Interviews</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search applicant…"
                      value={interviewSearch}
                      onChange={(e) => setInterviewSearch(e.target.value)}
                      className="w-52 pl-8"
                    />
                  </div>
                  <Select value={interviewStatusFilter} onValueChange={setInterviewStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={interviewModeFilter} onValueChange={setInterviewModeFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All modes</SelectItem>
                      <SelectItem value="On-site">On-site</SelectItem>
                      <SelectItem value="Virtual">Virtual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Interviewer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interviews
                      .filter((i) =>
                        interviewSearch
                          ? i.applicant.toLowerCase().includes(interviewSearch.toLowerCase())
                          : true,
                      )
                      .filter((i) =>
                        interviewStatusFilter === "all" ? true : i.status === interviewStatusFilter,
                      )
                      .filter((i) =>
                        interviewModeFilter === "all" ? true : i.mode === interviewModeFilter,
                      )
                      .map((i) => (
                        <TableRow key={i.id}>
                          <TableCell className="text-sm font-medium">{i.applicant}</TableCell>
                          <TableCell className="text-sm">{i.position}</TableCell>
                          <TableCell className="text-xs">
                            {i.date} · {i.time}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline">{i.mode}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">{i.interviewer}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                i.status === "Completed"
                                  ? "border-success/30 bg-success/10 text-success"
                                  : "border-primary/30 bg-primary/10 text-primary"
                              }
                            >
                              {i.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  aria-label={`Actions for ${i.applicant}`}
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toast(`Viewing interview — ${i.applicant}`)}>
                                  <Eye className="mr-2 h-3.5 w-3.5" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setInterviews((prev) =>
                                      prev.map((x) =>
                                        x.id === i.id
                                          ? {
                                              ...x,
                                              status: x.status === "Completed" ? "Scheduled" : "Completed",
                                            }
                                          : x,
                                      ),
                                    )
                                  }
                                >
                                  <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                                  {i.status === "Completed" ? "Reopen" : "Mark completed"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setInterviews((prev) => prev.filter((x) => x.id !== i.id));
                                    toast(`Interview cancelled — ${i.applicant}`);
                                  }}
                                >
                                  <XCircle className="mr-2 h-3.5 w-3.5 text-destructive" /> Cancel
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ASSESSMENT */}
        <TabsContent value="assessment" className="mt-4 space-y-6">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold">Assessments</h2>
                  <p className="text-xs text-muted-foreground">
                    Candidates ready for evaluation and those already assessed.
                  </p>
                </div>
                <Select
                  value={assessmentFilter}
                  onValueChange={(v) => setAssessmentFilter(v as typeof assessmentFilter)}
                >
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ready">Ready for Assessment</SelectItem>
                    <SelectItem value="completed">Completed Assessment</SelectItem>
                    <SelectItem value="all">All Assessments</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessmentFilter !== "completed" &&
                      readyToAssess.map((a) => {
                        const iv = interviews.find((i) => i.applicant === a.name);
                        return (
                          <TableRow key={a.id}>
                            <TableCell className="text-sm font-medium">{a.name}</TableCell>
                            <TableCell className="text-sm">{a.position}</TableCell>
                            <TableCell>{a.score}%</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-gold/40 bg-gold/15 text-gold-foreground">
                                Ready for Assessment
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {iv ? `Interviewed ${iv.date} · ${iv.time}` : "Interview not booked"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setEvaluating(a);
                                  setEvalScores(
                                    Object.fromEntries(assessmentCriteria.map((c) => [c, 4])),
                                  );
                                  setEvalRemarks("");
                                }}
                              >
                                Start assessment
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {assessmentFilter !== "ready" &&
                      assessments.map((a) => (
                        <TableRow key={a.applicantId}>
                          <TableCell className="text-sm font-medium">{a.name}</TableCell>
                          <TableCell className="text-sm">{a.position}</TableCell>
                          <TableCell>
                            <span className="font-display text-lg font-semibold text-primary">
                              {a.total}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                a.outcome === "Recommended"
                                  ? "border-success/30 bg-success/15 text-success"
                                  : a.outcome === "Hold"
                                    ? "border-warning/40 bg-warning/20 text-warning-foreground"
                                    : "border-destructive/30 bg-destructive/10 text-destructive"
                              }
                            >
                              {a.outcome}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[260px] truncate text-xs text-muted-foreground" title={a.remarks}>
                            Assessed {a.date} — {a.remarks}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setStage(a.applicantId, "Offer");
                                toast.success(`${a.name} advanced to job offer`);
                              }}
                            >
                              Advance to offer
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    {((assessmentFilter === "ready" && readyToAssess.length === 0) ||
                      (assessmentFilter === "completed" && assessments.length === 0) ||
                      (assessmentFilter === "all" &&
                        readyToAssess.length === 0 &&
                        assessments.length === 0)) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-sm text-muted-foreground">
                          Nothing to show for this filter yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* REPORTS DIALOG */}
      <Dialog open={reportsOpen} onOpenChange={setReportsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Generate Report</DialogTitle>
            <DialogDescription>Choose a report to generate from current applicant data.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {reportOptions.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toast.success(`${r.title} report generated`, {
                      description: "Ready to download from Reports history.",
                    })
                  }
                >
                  <Download className="mr-2 h-4 w-4" /> Generate
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* SCREENING SETUP DIALOG */}
      <Dialog open={screeningOpen} onOpenChange={setScreeningOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Screening Setup</DialogTitle>
            <DialogDescription>
              Configure screening criteria weights and keyword libraries used by the NER model.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/70">
              <CardContent className="space-y-5 p-6">
                <div>
                  <h2 className="font-display text-2xl font-semibold">
                    Resume Screening Customization
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Tune the criteria weights used by the spaCy NER scoring model.
                  </p>
                </div>
                {criteria.map((c, idx) => (
                  <div key={c.name} className="rounded-md border border-border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={c.enabled}
                          onCheckedChange={(v) =>
                            setCriteria((prev) =>
                              prev.map((x, i) => (i === idx ? { ...x, enabled: v } : x)),
                            )
                          }
                        />
                        <span className="text-sm font-medium">{c.name}</span>
                      </div>
                      <span className="font-display text-lg font-semibold text-primary">
                        {c.weight}%
                      </span>
                    </div>
                    <Slider
                      className="mt-3"
                      value={[c.weight]}
                      max={60}
                      step={5}
                      onValueChange={(v) =>
                        setCriteria((prev) =>
                          prev.map((x, i) => (i === idx ? { ...x, weight: v[0] ?? x.weight } : x)),
                        )
                      }
                    />
                  </div>
                ))}
                <p
                  className={cn(
                    "text-xs",
                    totalWeight === 100 ? "text-success" : "text-destructive",
                  )}
                >
                  Total weight: {totalWeight}% {totalWeight === 100 ? "✓" : "(should equal 100%)"}
                </p>
                <div className="space-y-2">
                  <Label>Passing score — {passing}%</Label>
                  <Slider
                    value={[passing]}
                    max={100}
                    step={1}
                    onValueChange={(v) => setPassing(v[0] ?? passing)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="space-y-5 p-6">
                <div>
                  <h2 className="font-display text-2xl font-semibold">
                    Skill &amp; Certification Keywords
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Pick a job position to load its suggested keyword checklist, then add any extras.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Job position</Label>
                  <Select
                    value={keywordPosition}
                    onValueChange={(v) => {
                      setKeywordPosition(v);
                      setSelectedKeywords(keywordLibrary[v] ?? []);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
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

                <div className="space-y-2">
                  <Label>Additional keywords (comma separated)</Label>
                  <Textarea
                    rows={3}
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Entity labels captured</Label>
                  <div className="flex flex-wrap gap-2">
                    {["PERSON", "EMAIL", "PHONE", "SKILL", "ORG", "EDU", "CERT", "DATE"].map((l) => (
                      <Badge key={l} variant="secondary">
                        {l}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="rounded-md border border-border p-4">
                  <p className="text-sm font-medium">NER training data</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Model v2.3 · 1,248 annotated resumes · last trained 2026-07-20
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast("Annotation set uploaded")}
                    >
                      <Upload className="mr-2 h-4 w-4" /> Upload training set
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success("Screening batch re-queued")}
                    >
                      <ScanLine className="mr-2 h-4 w-4" /> Re-run screening
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        toast.success(
                          `Configuration saved — ${selectedKeywords.length} keywords active for ${keywordPosition}`,
                        )
                      }
                    >
                      <Sliders className="mr-2 h-4 w-4" /> Save configuration
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

            {/* REVIEW DIALOG — resume screening result */}
      <Dialog open={!!review} onOpenChange={(o) => !o && setReview(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
          {review && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  Resume Screening Result — {review.name}
                </DialogTitle>
                <DialogDescription>
                  {review.position} · applied {review.appliedAt} · source {review.source} ·{" "}
                  {review.id}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                <div className="rounded-md border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border px-3 py-2">
                    <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate">{`${review.name.replace(/\s+/g, "_")}_Resume.pdf`}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-6 w-6" aria-label="Zoom out">
                        <ZoomOut className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-[0.65rem] text-muted-foreground">100%</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6" aria-label="Zoom in">
                        <ZoomIn className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="h-[420px] overflow-y-auto bg-muted/30 p-4">
                    <div className="mx-auto aspect-[8.5/11] w-full max-w-[280px] space-y-3 rounded-sm border border-border bg-card p-4 shadow-sm">
                      <div className="space-y-1 border-b border-border pb-2">
                        <p className="text-sm font-semibold">{review.name}</p>
                        <p className="text-[0.65rem] text-muted-foreground">
                          {review.email} · {review.phone}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[0.6rem] font-semibold uppercase text-primary">Objective</p>
                        <div className="h-1.5 w-full rounded-full bg-muted" />
                        <div className="h-1.5 w-4/5 rounded-full bg-muted" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[0.6rem] font-semibold uppercase text-primary">Experience</p>
                        <div className="h-1.5 w-full rounded-full bg-muted" />
                        <div className="h-1.5 w-full rounded-full bg-muted" />
                        <div className="h-1.5 w-3/4 rounded-full bg-muted" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[0.6rem] font-semibold uppercase text-primary">Education</p>
                        <div className="h-1.5 w-full rounded-full bg-muted" />
                        <div className="h-1.5 w-2/3 rounded-full bg-muted" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[0.6rem] font-semibold uppercase text-primary">Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {review.entities.slice(0, 4).map((e) => (
                            <span
                              key={e.label}
                              className="rounded-full bg-secondary px-1.5 py-0.5 text-[0.55rem]"
                            >
                              {e.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border px-3 py-1.5 text-[0.65rem] text-muted-foreground">
                    <span>Page 1 of 1</span>
                    <span>Mock preview — uploaded via {review.source}</span>
                  </div>
                </div>

                <div className="space-y-4">
                {(() => {
                  const verdictCopy: Record<string, string> = {
                    fit: "Strong match — meets or exceeds the requirements for this role.",
                    "other-role": "Not the strongest fit here, but the profile suggests they'd do well in a different role.",
                    credential: "Promising profile, but a required certification or credential couldn't be verified.",
                    "not-fit": "Falls short of the core requirements for this role.",
                  };
                  const passed = review.score >= passing;
                  const matched = (keywordLibrary[review.position] ?? []).filter((k) =>
                    review.entities.some((e) =>
                      e.value.toLowerCase().includes(k.toLowerCase().split(" ")[0]!),
                    ),
                  );
                  const missing = (keywordLibrary[review.position] ?? []).filter(
                    (k) => !matched.includes(k),
                  );
                  const experience = review.entities.filter((e) => e.label === "ORG");
                  const education = review.entities.filter((e) => e.label === "EDU");
                  const skills = review.entities.filter((e) => e.label === "SKILL");

                  return (
                    <>
                      {/* Score + verdict */}
                      <div className="flex items-center gap-4 rounded-md border border-border p-4">
                        <div className="text-center">
                          <p className="font-display text-4xl font-semibold text-primary">
                            {review.score}%
                          </p>
                          <p className="eyebrow">Match score</p>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={statusMeta[review.status].className}>
                              {statusMeta[review.status].label}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                passed
                                  ? "border-success/30 bg-success/10 text-success"
                                  : "border-destructive/30 bg-destructive/10 text-destructive"
                              }
                            >
                              {passed ? "Passed threshold" : "Below threshold"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {verdictCopy[review.status]}
                          </p>
                        </div>
                      </div>

                      {/* Keyword match */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-md border border-success/30 bg-success/5 p-3">
                          <p className="eyebrow mb-2 text-success">
                            Matched keywords ({matched.length})
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {matched.length === 0 && (
                              <span className="text-xs text-muted-foreground">None found</span>
                            )}
                            {matched.map((k) => (
                              <Badge
                                key={k}
                                variant="outline"
                                className="border-success/30 bg-success/10 text-success"
                              >
                                ✓ {k}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-md border border-border p-3">
                          <p className="eyebrow mb-2 text-muted-foreground">
                            Missing keywords ({missing.length})
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {missing.length === 0 && (
                              <span className="text-xs text-muted-foreground">
                                All keywords covered
                              </span>
                            )}
                            {missing.map((k) => (
                              <Badge key={k} variant="outline" className="text-muted-foreground">
                                ✕ {k}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Compact summary rows */}
                      <div className="divide-y divide-border rounded-md border border-border">
                        <div className="flex items-start justify-between gap-3 p-3">
                          <p className="w-32 shrink-0 text-xs font-medium text-muted-foreground">
                            Work experience
                          </p>
                          <p className="flex-1 text-sm">
                            {experience.length > 0
                              ? experience.map((e) => e.value).join(", ")
                              : "No employer history detected"}
                          </p>
                        </div>
                        <div className="flex items-start justify-between gap-3 p-3">
                          <p className="w-32 shrink-0 text-xs font-medium text-muted-foreground">
                            Education
                          </p>
                          <p className="flex-1 text-sm">
                            {education.length > 0
                              ? education.map((e) => e.value).join(", ")
                              : "Not specified"}
                          </p>
                        </div>
                        <div className="flex items-start justify-between gap-3 p-3">
                          <p className="w-32 shrink-0 text-xs font-medium text-muted-foreground">
                            Key skills
                          </p>
                          <p className="flex-1 text-sm">
                            {skills.length > 0 ? skills.map((s) => s.value).join(", ") : "None listed"}
                          </p>
                        </div>
                        <div className="flex items-start justify-between gap-3 p-3">
                          <p className="w-32 shrink-0 text-xs font-medium text-muted-foreground">
                            Red flags
                          </p>
                          <p
                            className={cn(
                              "flex-1 text-sm",
                              review.flags.length > 0 ? "text-caution" : "text-muted-foreground",
                            )}
                          >
                            {review.flags.length > 0 ? review.flags.join(" · ") : "None detected"}
                          </p>
                        </div>
                      </div>

                      {/* Recommendation */}
                      <div
                        className={cn(
                          "rounded-md border p-3 text-sm",
                          passed
                            ? "border-success/30 bg-success/10 text-success"
                            : "border-destructive/30 bg-destructive/10 text-destructive",
                        )}
                      >
                        <p className="font-medium">
                          {passed
                            ? "Recommendation: Move forward — accept and schedule an interview."
                            : "Recommendation: Reject or refer to a better-matching role."}
                        </p>
                      </div>
                    </>
                  );
                })()}
                </div>
              </div>

              <DialogFooter className="flex-wrap gap-2">
                <Button variant="outline" onClick={() => openRefer(review)}>
                  <Repeat2 className="mr-2 h-4 w-4" /> Refer to other position
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    reject(review);
                    setReview(null);
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Reject
                </Button>
                <Button onClick={() => acceptAndSchedule(review)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Accept &amp; schedule
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* REFER DIALOG */}
      <Dialog open={!!referring} onOpenChange={(o) => !o && setReferring(null)}>
        <DialogContent className="sm:max-w-lg">
          {referring && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Refer to Other Position</DialogTitle>
                <DialogDescription>
                  Choose a better-matching vacancy for {referring.name} ({referring.position}).
                </DialogDescription>
              </DialogHeader>

              <RadioGroup value={referTarget} onValueChange={setReferTarget} className="space-y-2">
                {positions
                  .filter((p) => p.title !== referring.position && p.filled < p.headcount)
                  .map((p) => {
                    const suggested = referring.flags.some((f) => f.includes(p.title));
                    return (
                      <label
                        key={p.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
                          referTarget === p.title
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40",
                        )}
                      >
                        <RadioGroupItem value={p.title} className="mt-1" />
                        <span className="flex-1">
                          <span className="flex items-center gap-2 text-sm font-medium">
                            {p.title}
                            {suggested && (
                              <Badge className="bg-gold text-gold-foreground">Best match</Badge>
                            )}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {p.department} · {p.headcount - p.filled} seat(s) open · {p.salaryBand}
                          </span>
                        </span>
                      </label>
                    );
                  })}
              </RadioGroup>

              <DialogFooter>
                <Button variant="outline" onClick={() => setReferring(null)}>
                  Cancel
                </Button>
                <Button
                  disabled={!referTarget}
                  onClick={() => {
                    setRows((prev) =>
                      prev.map((x) =>
                        x.id === referring.id
                          ? { ...x, position: referTarget, status: "fit", stage: "Screened" }
                          : x,
                      ),
                    );
                    toast.success(`${referring.name} referred to ${referTarget}`);
                    setReferring(null);
                    setReview(null);
                  }}
                >
                  Confirm referral
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* EVALUATION DIALOG */}
      <Dialog open={!!evaluating} onOpenChange={(o) => !o && setEvaluating(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          {evaluating && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Interview Assessment</DialogTitle>
                <DialogDescription>
                  {evaluating.name} · {evaluating.position}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {assessmentCriteria.map((c) => (
                  <div key={c} className="flex items-center justify-between gap-3">
                    <span className="text-sm">{c}</span>
                    <Select
                      value={String(evalScores[c] ?? 4)}
                      onValueChange={(v) => setEvalScores((p) => ({ ...p, [c]: Number(v) }))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 4, 3, 2, 1].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n} / 5
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                <div className="rounded-md border border-border p-3">
                  <p className="eyebrow">Computed score</p>
                  <p className="font-display text-3xl font-semibold text-primary">
                    {Math.round(
                      (assessmentCriteria.reduce((t, c) => t + (evalScores[c] ?? 4), 0) /
                        (assessmentCriteria.length * 5)) *
                        100,
                    )}
                    %
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Interviewer remarks</Label>
                  <Textarea
                    rows={3}
                    value={evalRemarks}
                    onChange={(e) => setEvalRemarks(e.target.value)}
                    placeholder="Observations and recommendation…"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    const total = Math.round(
                      (assessmentCriteria.reduce((t, c) => t + (evalScores[c] ?? 4), 0) /
                        (assessmentCriteria.length * 5)) *
                        100,
                    );
                    setAssessments((prev) => [
                      {
                        applicantId: evaluating.id,
                        name: evaluating.name,
                        position: evaluating.position,
                        scores: evalScores,
                        total,
                        remarks: evalRemarks || "No remarks recorded.",
                        date: isoOf(new Date()),
                        outcome:
                          total >= 80 ? "Recommended" : total >= 65 ? "Hold" : "Not Recommended",
                      },
                      ...prev,
                    ]);
                    setStage(evaluating.id, "Assessed");
                    setEvaluating(null);
                    toast.success(`Assessment saved — ${total}%`);
                  }}
                >
                  Save assessment
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ADD APPLICANT DIALOG */}
      <Dialog
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o);
          if (!o) {
            setAddStep(1);
            setScreenResult(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Add Applicant</DialogTitle>
            <DialogDescription>
              Step {addStep} of 3 ·{" "}
              {addStep === 1
                ? "choose how the resume will be screened"
                : addStep === 2
                  ? "upload the resume and run screening"
                  : "confirm applicant details"}
            </DialogDescription>
          </DialogHeader>

          {addStep === 1 && (
            <div className="space-y-3">
              {(
                [
                  {
                    id: "file" as const,
                    icon: FileText,
                    title: "Through file",
                    body: "PDF or DOCX resume — text is parsed directly by the NER model.",
                  },
                  {
                    id: "image" as const,
                    icon: ImageIcon,
                    title: "Through image",
                    body: "Photo or scan of a walk-in resume — OCR first, then NER screening.",
                  },
                ]
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setAddMethod(m.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-md border p-4 text-left transition-colors",
                    addMethod === m.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <m.icon className="mt-0.5 h-5 w-5 text-primary" />
                  <span>
                    <span className="block text-sm font-medium">{m.title}</span>
                    <span className="block text-xs text-muted-foreground">{m.body}</span>
                  </span>
                </button>
              ))}
              <DialogFooter>
                <Button onClick={() => setAddStep(2)}>Continue</Button>
              </DialogFooter>
            </div>
          )}

          {addStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Applying for</Label>
                <Select
                  value={addForm.position}
                  onValueChange={(v) => setAddForm({ ...addForm, position: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
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

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border bg-muted/40 p-8 text-center">
                {addMethod === "image" ? (
                  <ImageIcon className="h-9 w-9 text-muted-foreground" />
                ) : (
                  <FileText className="h-9 w-9 text-muted-foreground" />
                )}
                <span className="mt-3 text-sm font-medium">
                  {addFileName || `Choose resume ${addMethod === "image" ? "photo / scan" : "file"}`}
                </span>
                <span className="text-xs text-muted-foreground">
                  {addMethod === "image" ? "JPG or PNG up to 10 MB" : "PDF or DOCX up to 10 MB"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept={addMethod === "image" ? "image/*" : ".pdf,.doc,.docx"}
                  onChange={(e) => setAddFileName(e.target.files?.[0]?.name ?? "")}
                />
              </label>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setAddStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={() => {
                    if (!addFileName) {
                      toast.error("Select a resume file first.");
                      return;
                    }
                    toast(
                      addMethod === "image"
                        ? "Running OCR then NER screening…"
                        : "Running NER resume screening…",
                    );
                    runScreening();
                  }}
                >
                  <ScanLine className="mr-2 h-4 w-4" /> Run resume screening
                </Button>
              </DialogFooter>
            </div>
          )}

          {addStep === 3 && screenResult && (
            <div className="space-y-4">
              <div className="rounded-md border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="eyebrow">Screening result</p>
                    <Badge
                      variant="outline"
                      className={cn("mt-1", statusMeta[screenResult.status].className)}
                    >
                      {statusMeta[screenResult.status].label}
                    </Badge>
                  </div>
                  <p className="font-display text-3xl font-semibold text-primary">
                    {screenResult.score}%
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {screenResult.entities.map((e) => (
                    <Badge key={e.label} variant="secondary">
                      <span className="mr-1 text-muted-foreground">{e.label}</span> {e.value}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Full name</Label>
                  <Input
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone number</Label>
                  <Input
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input
                    value={addForm.address}
                    onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setAddStep(2)}>
                  Back
                </Button>
                <Button onClick={saveNewApplicant}>Save applicant</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
