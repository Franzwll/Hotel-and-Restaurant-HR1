import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, ClipboardList, Clock, Wallet } from "lucide-react";

import { AnnouncementsCard } from "@/components/portal/AnnouncementsCard";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { myAttendance, myLeaveBalances, myPayroll, myProfile, mySchedule } from "@/data/ess";
import { peso } from "@/data/jobs";

export const Route = createFileRoute("/employee/")({
  component: EmployeeDashboard,
});

function EmployeeDashboard() {
  return (
    <div>
      <PageHeader
        eyebrow={`${myProfile.position} · ${myProfile.department}`}
        title={`Welcome back, ${myProfile.name.split(" ")[0]}`}
        description="Your attendance, schedule, payslips, and requests at a glance."
        actions={
          <Button asChild>
            <Link to="/employee/ess">File a Request</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Time In Today" value={myAttendance.today.timeIn} hint={`${myAttendance.today.hours} hours logged`} icon={Clock} tone="primary" />
        <StatCard label="Days Present" value={myAttendance.monthly.present} hint="This month" icon={ClipboardList} tone="success" />
        <StatCard label="Next Payout" value={peso(myPayroll.net)} hint={myPayroll.nextPayout} icon={Wallet} tone="gold" />
        <StatCard label="Overtime Hours" value={myAttendance.monthly.overtimeHours} hint="This month" icon={CalendarClock} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-2xl font-semibold">My Weekly Schedule</h2>
            <ul className="mt-4 space-y-2">
              {mySchedule.map((s) => (
                <li
                  key={s.day}
                  className="flex items-center justify-between border-b border-border pb-2 text-sm last:border-0"
                >
                  <span className="font-medium">{s.day}</span>
                  <span className="text-muted-foreground">
                    {s.shift} · {s.time}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-2xl font-semibold">Leave Balances</h2>
            <div className="mt-4 space-y-4">
              {myLeaveBalances.map((l) => (
                <div key={l.type}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{l.type}</span>
                    <span className="text-muted-foreground">
                      {l.total - l.used} of {l.total} days left
                    </span>
                  </div>
                  <Progress value={((l.total - l.used) / l.total) * 100} className="mt-2 h-2" />
                </div>
              ))}
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
