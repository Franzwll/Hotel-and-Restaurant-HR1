import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { jobs, peso } from "@/data/jobs";

export const Route = createFileRoute("/jobs/")({
  head: () => ({
    meta: [
      { title: "Find Jobs — Oxford Suites Makati Careers" },
      {
        name: "description",
        content:
          "Browse hotel and restaurant job vacancies at Oxford Suites Makati. Filter by position, employment type, experience, education, and salary range.",
      },
      { property: "og:title", content: "Find Jobs — Oxford Suites Makati Careers" },
      {
        property: "og:description",
        content: "Browse and apply to hotel and restaurant vacancies in Makati City.",
      },
    ],
  }),
  component: FindJobs,
});

const departments = [...new Set(jobs.map((j) => j.department))];
const types = [...new Set(jobs.map((j) => j.employmentType))];
const experiences = [...new Set(jobs.map((j) => j.experience))];
const educations = [...new Set(jobs.map((j) => j.education))];

function FindJobs() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<string[]>([]);
  const [type, setType] = useState<string[]>([]);
  const [exp, setExp] = useState<string[]>([]);
  const [edu, setEdu] = useState<string[]>([]);
  const [maxSalary, setMaxSalary] = useState(30000);

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const results = useMemo(
    () =>
      jobs.filter((j) => {
        if (!j.active) return false;
        if (q && !`${j.title} ${j.department} ${j.summary}`.toLowerCase().includes(q.toLowerCase()))
          return false;
        if (dept.length && !dept.includes(j.department)) return false;
        if (type.length && !type.includes(j.employmentType)) return false;
        if (exp.length && !exp.includes(j.experience)) return false;
        if (edu.length && !edu.includes(j.education)) return false;
        if (j.salaryMin > maxSalary) return false;
        return true;
      }),
    [q, dept, type, exp, edu, maxSalary],
  );

  const FilterGroup = ({
    title,
    options,
    selected,
    onToggle,
  }: {
    title: string;
    options: string[];
    selected: string[];
    onToggle: (v: string) => void;
  }) => (
    <div>
      <p className="eyebrow mb-2">{title}</p>
      <div className="space-y-2">
        {options.map((o) => (
          <div key={o} className="flex items-center gap-2">
            <Checkbox
              id={`${title}-${o}`}
              checked={selected.includes(o)}
              onCheckedChange={() => onToggle(o)}
            />
            <Label htmlFor={`${title}-${o}`} className="text-sm font-normal text-muted-foreground">
              {o}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <p className="eyebrow">Careers</p>
        <h1 className="mt-1 font-display text-4xl font-semibold md:text-5xl">List of Jobs</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {results.length} open {results.length === 1 ? "vacancy" : "vacancies"} at Oxford Suites
          Makati. Apply directly — no account required.
        </p>
        <div className="gold-rule my-6" />

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-6 rounded-md border border-border bg-card p-5 lg:sticky lg:top-24 lg:h-fit">
            <div>
              <p className="eyebrow mb-3">Salary Grade</p>
              <Slider
                value={[maxSalary]}
                min={14000}
                max={30000}
                step={1000}
                onValueChange={(v) => setMaxSalary(v[0] ?? 30000)}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Up to {peso(maxSalary)} starting salary
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search"
                className="pl-9"
              />
            </div>

            <FilterGroup
              title="Position / Department"
              options={departments}
              selected={dept}
              onToggle={(v) => toggle(dept, setDept, v)}
            />
            <FilterGroup
              title="Employment Type"
              options={types}
              selected={type}
              onToggle={(v) => toggle(type, setType, v)}
            />
            <FilterGroup
              title="Experience"
              options={experiences}
              selected={exp}
              onToggle={(v) => toggle(exp, setExp, v)}
            />
            <FilterGroup
              title="Education"
              options={educations}
              selected={edu}
              onToggle={(v) => toggle(edu, setEdu, v)}
            />
          </aside>


          <div className="space-y-5">
            {results.map((job) => (
              <Card key={job.id} className="border-border/70">
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-2xl font-semibold">{job.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {job.department} · {job.employmentType} · {job.schedule}
                      </p>
                      <p className="mt-1 text-sm font-medium text-primary">
                        {peso(job.salaryMin)} – {peso(job.salaryMax)} per month
                      </p>
                    </div>
                    <Badge variant="outline" className="border-success/40 text-success">
                      {job.vacancies - job.filled} vacancies open
                    </Badge>
                  </div>

                  <p className="mt-4 text-sm text-muted-foreground">{job.description}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {job.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <Button asChild className="mt-5 w-full sm:w-auto">
                    <Link to="/jobs/$jobId" params={{ jobId: job.id }}>
                      Apply Now
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}

            {results.length === 0 && (
              <div className="rounded-md border border-dashed border-border p-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No vacancies match your filters. Try widening your search.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
