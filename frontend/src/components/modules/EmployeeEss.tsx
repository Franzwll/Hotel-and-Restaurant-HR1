import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/PageHeader";
import { TablePagination } from "@/components/ui/table-pagination";
import { usePagination } from "@/hooks/usePagination";
import { StatCard } from "@/components/portal/StatCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  essRequests,
  myAttendance,
  myBenefits,
  myLeaveBalances,
  myPayroll,
  myProfile,
  mySchedule,
  requestCategories,
} from "@/data/ess";

const peso = (n: number) => `₱${n.toLocaleString("en-PH")}`;

export function EmployeeEss() {
  const [category, setCategory] = useState(requestCategories[0]!.name);
  const mine = essRequests.filter((r) => r.employeeId === myProfile.employeeId);
  const types = requestCategories.find((c) => c.name === category)?.types ?? [];

  const attendancePage = usePagination(myAttendance.history);
  const payslipPage = usePagination(myPayroll.payslips);
  const minePage = usePagination(mine);

  return (
    <div>
      <PageHeader
        eyebrow="Employee"
        title="Employee Self-Service"
        description="Your real-time HR information, request submission, and request tracking."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's Time In" value={myAttendance.today.timeIn} tone="primary" />
        <StatCard label="Hours Worked" value={`${myAttendance.today.hours}h`} tone="gold" />
        <StatCard
          label="Leave Credits Left"
          value={myLeaveBalances.reduce((t, l) => t + (l.total - l.used), 0)}
          tone="success"
        />
        <StatCard label="Next Payout" value={myPayroll.nextPayout} />
      </div>

      <Tabs defaultValue="attendance" className="mt-6">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="benefits">Benefits &amp; Loans</TabsTrigger>
          <TabsTrigger value="submit">Submit a Request</TabsTrigger>
          <TabsTrigger value="tracking">My Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
            <Card className="border-border/70">
              <CardContent className="p-6">
                <h2 className="font-display text-2xl font-semibold">Today&apos;s Attendance</h2>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {Object.entries(myAttendance.today).map(([k, v]) => (
                    <div key={k} className="rounded-md border border-border p-3">
                      <p className="eyebrow">{k.replace(/([A-Z])/g, " $1")}</p>
                      <p className="mt-1 text-sm font-medium">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {Object.entries(myAttendance.monthly).map(([k, v]) => (
                    <div key={k} className="rounded-md border border-border p-3">
                      <p className="eyebrow">Monthly {k}</p>
                      <p className="font-display text-2xl font-semibold text-primary">{v}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/70">
              <CardContent className="p-6">
                <h2 className="font-display text-2xl font-semibold">Attendance History</h2>
                <Table className="mt-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>In</TableHead>
                      <TableHead>Out</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Remark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendancePage.pageItems.map((h) => (
                      <TableRow key={h.date}>
                        <TableCell className="text-xs">{h.date}</TableCell>
                        <TableCell className="text-xs">{h.in}</TableCell>
                        <TableCell className="text-xs">{h.out}</TableCell>
                        <TableCell className="text-xs">{h.hours}</TableCell>
                        <TableCell className="text-xs">{h.remark}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  page={attendancePage.page}
                  pageCount={attendancePage.pageCount}
                  from={attendancePage.from}
                  to={attendancePage.to}
                  total={attendancePage.total}
                  label="records"
                  onPageChange={attendancePage.setPage}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold">Weekly Schedule</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {mySchedule.map((s) => (
                  <div key={s.day} className="rounded-md border border-border p-4">
                    <p className="eyebrow">{s.day}</p>
                    <p className="mt-1 text-sm font-medium">{s.shift}</p>
                    <p className="text-xs text-muted-foreground">{s.time}</p>
                    <p className="text-xs text-muted-foreground">{s.location}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold">Leave Balances</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {myLeaveBalances.map((l) => (
                  <div key={l.type} className="rounded-md border border-border p-4">
                    <div className="flex justify-between text-sm">
                      <span>{l.type}</span>
                      <span className="font-medium">
                        {l.total - l.used} / {l.total} days
                      </span>
                    </div>
                    <Progress value={((l.total - l.used) / l.total) * 100} className="mt-2 h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/70">
              <CardContent className="p-6">
                <h2 className="font-display text-2xl font-semibold">Payroll Summary</h2>
                <div className="mt-3 flex gap-6">
                  <div>
                    <p className="eyebrow">Gross pay</p>
                    <p className="font-display text-3xl font-semibold">{peso(myPayroll.gross)}</p>
                  </div>
                  <div>
                    <p className="eyebrow">Net pay</p>
                    <p className="font-display text-3xl font-semibold text-primary">
                      {peso(myPayroll.net)}
                    </p>
                  </div>
                </div>
                <p className="eyebrow mt-4">Earnings</p>
                {myPayroll.breakdown.map((b) => (
                  <div
                    key={b.label}
                    className="flex justify-between border-b border-border py-1.5 text-sm"
                  >
                    <span>{b.label}</span>
                    <span>{peso(b.amount)}</span>
                  </div>
                ))}
                <p className="eyebrow mt-4">Deductions</p>
                {myPayroll.deductions.map((b) => (
                  <div
                    key={b.label}
                    className="flex justify-between border-b border-border py-1.5 text-sm"
                  >
                    <span>{b.label}</span>
                    <span className="text-destructive">-{peso(b.amount)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-border/70">
              <CardContent className="p-6">
                <h2 className="font-display text-2xl font-semibold">Payslip History</h2>
                <Table className="mt-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Net</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payslipPage.pageItems.map((p) => (
                      <TableRow key={p.period}>
                        <TableCell className="text-xs">{p.period}</TableCell>
                        <TableCell className="text-sm">{peso(p.net)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{p.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast("Payslip downloaded")}
                          >
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  page={payslipPage.page}
                  pageCount={payslipPage.pageCount}
                  from={payslipPage.from}
                  to={payslipPage.to}
                  total={payslipPage.total}
                  label="payslips"
                  onPageChange={payslipPage.setPage}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benefits" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold">
                Government &amp; Company Benefits
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {myBenefits.map((b) => (
                  <div key={b.name} className="rounded-md border border-border p-4">
                    <p className="eyebrow">{b.name}</p>
                    <p className="mt-1 text-sm font-medium">{b.value}</p>
                    <p className="text-xs text-muted-foreground">{b.note}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-md border border-border p-4">
                <p className="eyebrow">Company loan</p>
                <p className="mt-1 text-sm">
                  Outstanding balance ₱5,400 · ₱450 / cut-off · 12 of 24 paid
                </p>
                <Progress value={50} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submit" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="space-y-4 p-6">
              <h2 className="font-display text-2xl font-semibold">Submit a Request</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {requestCategories.map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Request type</Label>
                  <Select key={category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date from</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Date to</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reason / details</Label>
                <Textarea rows={4} placeholder="Provide details for HR…" />
              </div>
              <div className="space-y-2">
                <Label>Supporting document</Label>
                <Input type="file" />
              </div>
              <Button onClick={() => toast.success("Request submitted to HR")}>
                Submit request
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold">My Requests</h2>
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Request</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Filed</TableHead>
                    <TableHead>Assigned HR</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {minePage.pageItems.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs font-medium">{r.id}</TableCell>
                      <TableCell className="text-sm">{r.type}</TableCell>
                      <TableCell className="text-xs">{r.filed}</TableCell>
                      <TableCell className="text-xs">{r.assignedTo}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{r.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                <TablePagination
                  page={minePage.page}
                  pageCount={minePage.pageCount}
                  from={minePage.from}
                  to={minePage.to}
                  total={minePage.total}
                  label="requests"
                  onPageChange={minePage.setPage}
                />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function EmployeeProfile() {
  return (
    <div>
      <PageHeader
        eyebrow="Employee"
        title="My Profile"
        description="Your employment record on file."
      />
      <Card className="border-border/70">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-5">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-primary/10 font-display text-3xl text-primary">
                {myProfile.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-display text-3xl font-semibold">{myProfile.name}</h2>
              <p className="text-sm text-muted-foreground">
                {myProfile.position} · {myProfile.department}
              </p>
              <Badge variant="outline" className="mt-2">
                {myProfile.employmentType}
              </Badge>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Request info update
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl">
                    Personal Information Update Request
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Field to update</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Address",
                          "Contact Number",
                          "Email",
                          "Civil Status",
                          "Emergency Contact",
                          "Government ID",
                        ].map((f) => (
                          <SelectItem key={f} value={f}>
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>New value</Label>
                    <Input />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => toast.success("Update request submitted")}>Submit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Employee ID", myProfile.employeeId],
              ["Branch", myProfile.branch],
              ["Immediate supervisor", myProfile.supervisor],
              ["Date hired", myProfile.dateHired],
              ["Status", myProfile.status],
              ["Email", myProfile.email],
              ["Contact number", myProfile.phone],
              ["Address", myProfile.address],
              ["Emergency contact", myProfile.emergencyContact],
            ].map(([k, v]) => (
              <div key={k} className="rounded-md border border-border p-4">
                <p className="eyebrow">{k}</p>
                <p className="mt-1 text-sm">{v}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
