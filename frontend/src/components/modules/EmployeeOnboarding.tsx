import { useState, useMemo } from "react";
import { Info, Check, Search, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ChecklistItem = {
  id: string;
  title: string;
  date: string;
  isoDate: string;
  done: boolean;
  rank: number;
  actionLabel: string;
};

export function EmployeeOnboarding() {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: "chk-info",
      title: "Confirm Personal Information",
      date: "Completed Feb 2, 2026",
      isoDate: "2026-02-02",
      done: true,
      rank: 1,
      actionLabel: "",
    },
    {
      id: "chk-gov",
      title: "Submit Government Requirements",
      date: "Completed Feb 3, 2026",
      isoDate: "2026-02-03",
      done: true,
      rank: 1,
      actionLabel: "",
    },
    {
      id: "chk-med",
      title: "Submit Medical Clearance",
      date: "Completed Feb 3, 2026",
      isoDate: "2026-02-03",
      done: true,
      rank: 1,
      actionLabel: "",
    },
    {
      id: "chk-policies",
      title: "Acknowledge Company Policies",
      date: "Pending your action",
      isoDate: "2026-08-01",
      done: false,
      rank: 0,
      actionLabel: "Acknowledge",
    },
    {
      id: "chk-agreement",
      title: "Accept Employment Agreement",
      date: "Pending your action",
      isoDate: "2026-08-01",
      done: false,
      rank: 0,
      actionLabel: "Review & Accept",
    },
  ]);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("status");

  const completedCount = items.filter((i) => i.done).length;
  const totalCount = items.length;
  const pct = Math.round((completedCount / totalCount) * 100);

  const handleComplete = (id: string, title: string) => {
    const todayIso = new Date().toISOString().slice(0, 10);
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        return {
          ...i,
          done: true,
          rank: 1,
          date: "Completed just now",
          isoDate: todayIso,
          actionLabel: "",
        };
      })
    );
    toast.success(`"${title}" step completed!`);
    if (completedCount + 1 >= totalCount) {
      setTimeout(() => {
        toast.success("Onboarding checklist complete! Awaiting HR verification.");
      }, 500);
    }
  };

  const filteredItems = useMemo(() => {
    return items
      .filter((i) => !search || i.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sort === "status") return a.rank - b.rank;
        if (sort === "date-desc") return b.isoDate.localeCompare(a.isoDate);
        if (sort === "date-asc") return a.isoDate.localeCompare(b.isoDate);
        return 0;
      });
  }, [items, search, sort]);

  return (
    <div>
      <PageHeader
        eyebrow="Employee Portal"
        title="New Hire Onboarding"
        description="Complete these requirements to finish your onboarding. This menu disappears once HR marks onboarding as complete."
      />

      {/* Yellow HR Notice Alert */}
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300">
        <Info className="h-5 w-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <p className="text-sm">
          Employee activation is performed by the HR Admin after all requirements below have been verified.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Overall Progress Card */}
        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-xl font-semibold">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Progress value={pct} className="h-2.5" />
            </div>

            <div className="divide-y divide-border border-t border-border pt-3">
              <div className="flex justify-between py-2 text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-semibold text-foreground">{pct}% complete</span>
              </div>
              <div className="flex justify-between py-2 text-sm items-center">
                <span className="text-muted-foreground">Current Status</span>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30 font-medium">
                  Probationary
                </Badge>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-muted-foreground">Employee ID</span>
                <span className="font-medium text-foreground">OSM-2026-0142</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Onboarding Checklist Card */}
        <Card className="border-border/70">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
            <CardTitle className="font-display text-xl font-semibold">Onboarding Checklist</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search checklist..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9 w-[160px] sm:w-[200px]"
                />
              </div>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-9 w-[160px]">
                  <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status">Status (pending first)</SelectItem>
                  <SelectItem value="date-desc">Newest first</SelectItem>
                  <SelectItem value="date-asc">Oldest first</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {filteredItems.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
                  <div className="flex items-start gap-3">
                    {item.done ? (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white mt-0.5">
                        <Check className="h-4 w-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 shrink-0 rounded-full border-2 border-muted-foreground/40 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.date}</p>
                    </div>
                  </div>

                  {!item.done && item.actionLabel && (
                    <Button
                      size="sm"
                      className="sm:ml-auto"
                      onClick={() => handleComplete(item.id, item.title)}
                    >
                      {item.actionLabel}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
