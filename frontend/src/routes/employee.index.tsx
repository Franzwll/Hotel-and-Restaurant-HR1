import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Clock,
  FileText,
  TrendingUp,
  FileCheck,
  ClipboardCheck,
  Headset,
  ArrowRight,
} from "lucide-react";

import { AnnouncementsCard } from "@/components/portal/AnnouncementsCard";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { myProfile } from "@/data/ess";

export const Route = createFileRoute("/employee/")({
  component: EmployeeDashboard,
});

function EmployeeDashboard() {
  const firstName = myProfile.name.split(" ")[0];

  return (
    <div>
      <PageHeader
        eyebrow={`${myProfile.position} · ${myProfile.department}`}
        title={`Good day, ${firstName} 👋`}
        description="Here's what's happening with your employment today."
        actions={
          <Button asChild>
            <Link to="/employee/ess">Go to ESS Management</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Department" value={myProfile.department} hint="Oxford Suites Makati" icon={Headset} tone="primary" />
        <StatCard label="Position" value={myProfile.position} hint="Probationary Status" icon={ClipboardCheck} tone="gold" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Onboarding Progress Card */}
        <Card className="border-border/70 flex flex-col justify-between">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 font-display text-xl font-semibold">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Onboarding Progress
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1 font-medium">
                <span>Overall Progress</span>
                <span className="text-primary font-semibold">65% complete</span>
              </div>
              <Progress value={65} className="h-2.5" />
            </div>

            <div className="mt-4 space-y-2 text-sm border-t border-border pt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Overall progress</span>
                <span className="font-semibold">65% complete</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending requirements</span>
                <span className="font-semibold">2 items remaining</span>
              </div>
            </div>

            <Button asChild size="sm" className="mt-5 w-full sm:w-auto">
              <Link to="/employee/onboarding">
                Continue Onboarding <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* ESS Overview Card */}
        <Card className="border-border/70 flex flex-col justify-between">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 font-display text-xl font-semibold">
              <Headset className="h-5 w-5 text-primary" />
              ESS Overview
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Pending requests</span>
                <span className="font-semibold text-amber-600">3 pending</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Approved requests</span>
                <span className="font-semibold text-emerald-600">5 approved</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Recently submitted</span>
                <span className="font-medium">Overtime Request — Jul 28</span>
              </div>
            </div>

            <Button asChild variant="outline" size="sm" className="mt-5 w-full sm:w-auto">
              <Link to="/employee/ess">
                Go to ESS <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="mt-6">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="font-display text-xl font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button
                asChild
                variant="outline"
                className="h-auto flex-col items-start gap-2 p-4 text-left hover:border-primary hover:bg-primary/5 transition-all"
              >
                <Link to="/employee/ess">
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Attendance Request</p>
                    <p className="text-xs text-muted-foreground font-normal">File time-in/out correction</p>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto flex-col items-start gap-2 p-4 text-left hover:border-primary hover:bg-primary/5 transition-all"
              >
                <Link to="/employee/ess">
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Payroll Request</p>
                    <p className="text-xs text-muted-foreground font-normal">Overtime &amp; payslip inquiry</p>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto flex-col items-start gap-2 p-4 text-left hover:border-primary hover:bg-primary/5 transition-all"
              >
                <Link to="/employee/ess">
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Performance &amp; Promotion</p>
                    <p className="text-xs text-muted-foreground font-normal">Review goals &amp; apply</p>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto flex-col items-start gap-2 p-4 text-left hover:border-primary hover:bg-primary/5 transition-all"
              >
                <Link to="/employee/ess">
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Document Request</p>
                    <p className="text-xs text-muted-foreground font-normal">COE, BIR 2316, clearances</p>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <AnnouncementsCard role="employee" />
      </div>
    </div>
  );
}
