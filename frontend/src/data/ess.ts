export type ESSRequest = {
  id: string;
  employee: string;
  employeeId: string;
  department: string;
  category: string;
  type: string;
  filed: string;
  status: "Pending" | "Under Review" | "Approved" | "Rejected" | "Completed";
  assignedTo: string;
  details: string;
};

export const essRequests: ESSRequest[] = [
  {
    id: "REQ-4410",
    employee: "Kevin Dela Cruz",
    employeeId: "EMP-0005",
    department: "Kitchen / Culinary",
    category: "Leave",
    type: "Sick Leave",
    filed: "2026-07-25",
    status: "Pending",
    assignedTo: "Juan Dela Cruz",
    details: "1 day sick leave with medical certificate attached.",
  },
  {
    id: "REQ-4409",
    employee: "Marjun Devera",
    employeeId: "EMP-0006",
    department: "Food & Beverage",
    category: "HR Document",
    type: "Certificate of Employment",
    filed: "2026-07-24",
    status: "Under Review",
    assignedTo: "Maria Lim",
    details: "COE for bank loan application, needs salary details.",
  },
  {
    id: "REQ-4408",
    employee: "Rosa Aquino",
    employeeId: "EMP-0008",
    department: "Housekeeping",
    category: "Attendance",
    type: "Attendance Correction",
    filed: "2026-07-24",
    status: "Approved",
    assignedTo: "Juan Dela Cruz",
    details: "Missing time-out on 2026-07-22, verified with floor logbook.",
  },
  {
    id: "REQ-4407",
    employee: "Camille Ortega",
    employeeId: "EMP-0004",
    department: "Front Office",
    category: "Payroll",
    type: "Payslip Request",
    filed: "2026-07-23",
    status: "Completed",
    assignedTo: "Paolo Cruz",
    details: "Payslip copies for June 2026 cut-offs.",
  },
  {
    id: "REQ-4406",
    employee: "Kevin Dela Cruz",
    employeeId: "EMP-0005",
    department: "Kitchen / Culinary",
    category: "Reimbursement",
    type: "Transportation",
    filed: "2026-07-21",
    status: "Rejected",
    assignedTo: "Paolo Cruz",
    details: "Missing official receipt for claimed amount.",
  },
  {
    id: "REQ-4405",
    employee: "Ana Ramos",
    employeeId: "EMP-0001",
    department: "Front Office",
    category: "Loan",
    type: "Company Loan",
    filed: "2026-07-20",
    status: "Under Review",
    assignedTo: "Paolo Cruz",
    details: "₱50,000 company loan payable in 12 months.",
  },
  {
    id: "REQ-4404",
    employee: "Rosa Aquino",
    employeeId: "EMP-0008",
    department: "Housekeeping",
    category: "Personal Info",
    type: "Contact Number Update",
    filed: "2026-07-19",
    status: "Completed",
    assignedTo: "Maria Lim",
    details: "Updated mobile number and emergency contact.",
  },
];

export const requestCategories = [
  { name: "Leave", types: ["Vacation", "Sick", "Emergency", "Maternity", "Paternity", "Solo Parent", "Bereavement"] },
  { name: "Attendance", types: ["Correction", "Missing Time In", "Missing Time Out", "Overtime", "Shift Change", "Rest Day Work"] },
  { name: "Payroll", types: ["Payslip Request", "Payroll Inquiry", "Discrepancy Report", "Salary Certificate", "BIR 2316"] },
  { name: "Payroll Update", types: ["Bank Account Update", "Payment Method", "Voluntary Deduction"] },
  { name: "Loan", types: ["Company Loan", "Salary Loan", "Cash Advance", "Emergency Loan"] },
  { name: "Reimbursement", types: ["Transportation", "Travel", "Meal Allowance", "Hotel Expense", "Communication"] },
  { name: "HR Document", types: ["Certificate of Employment", "Service Record", "Employment Verification", "Certificate of Compensation"] },
  { name: "Personal Info", types: ["Address", "Contact Number", "Email", "Civil Status", "Emergency Contact", "Government ID"] },
  { name: "Account", types: ["Password Reset", "Unlock Account", "System Access", "Login Problem"] },
];

export const myProfile = {
  employeeId: "EMP-0005",
  name: "Kevin Dela Cruz",
  initials: "KDC",
  position: "Line Cook",
  department: "Kitchen / Culinary",
  branch: "Oxford Suites Makati",
  supervisor: "Executive Chef Marco",
  dateHired: "2026-04-15",
  employmentType: "Probationary",
  status: "Active",
  email: "kevin.delacruz@oxfordsuites.com.ph",
  phone: "0921 774 9903",
  address: "14 Kalayaan Ave, Makati City",
  emergencyContact: "Liza Dela Cruz — 0918 222 4410 (Spouse)",
  onboardingComplete: false,
};

export const myAttendance = {
  today: {
    timeIn: "07:52 AM",
    timeOut: "—",
    breakIn: "12:00 PM",
    breakOut: "12:58 PM",
    hours: "6.2",
    late: "0",
    undertime: "0",
    overtime: "0",
  },
  monthly: { present: 21, late: 2, absent: 0, leave: 1, overtimeHours: 12.5 },
  history: [
    { date: "2026-07-25", in: "07:48 AM", out: "04:32 PM", hours: 8.2, remark: "Present" },
    { date: "2026-07-24", in: "08:07 AM", out: "05:10 PM", hours: 8.5, remark: "Late 7 mins" },
    { date: "2026-07-23", in: "07:55 AM", out: "06:40 PM", hours: 10.2, remark: "Overtime 2h" },
    { date: "2026-07-22", in: "—", out: "—", hours: 0, remark: "Sick Leave" },
    { date: "2026-07-21", in: "07:50 AM", out: "04:30 PM", hours: 8.1, remark: "Present" },
  ],
};

export const mySchedule = [
  { day: "Monday", shift: "AM Shift", time: "07:00 – 16:00", location: "Main Kitchen" },
  { day: "Tuesday", shift: "AM Shift", time: "07:00 – 16:00", location: "Main Kitchen" },
  { day: "Wednesday", shift: "Mid Shift", time: "11:00 – 20:00", location: "Banquet" },
  { day: "Thursday", shift: "Mid Shift", time: "11:00 – 20:00", location: "Banquet" },
  { day: "Friday", shift: "PM Shift", time: "14:00 – 23:00", location: "Main Kitchen" },
  { day: "Saturday", shift: "Rest Day", time: "—", location: "—" },
  { day: "Sunday", shift: "Rest Day", time: "—", location: "—" },
];

export const myLeaveBalances = [
  { type: "Vacation Leave", total: 15, used: 4 },
  { type: "Sick Leave", total: 15, used: 3 },
  { type: "Emergency Leave", total: 5, used: 1 },
  { type: "Solo Parent Leave", total: 7, used: 0 },
];

export const myPayroll = {
  nextPayout: "2026-08-05",
  gross: 21500,
  net: 18240,
  breakdown: [
    { label: "Basic Pay", amount: 16000 },
    { label: "Overtime Pay", amount: 2100 },
    { label: "Night Differential", amount: 900 },
    { label: "Meal Allowance", amount: 1500 },
    { label: "Service Charge", amount: 1000 },
  ],
  deductions: [
    { label: "SSS", amount: 900 },
    { label: "PhilHealth", amount: 550 },
    { label: "Pag-IBIG", amount: 200 },
    { label: "Withholding Tax", amount: 1160 },
    { label: "Company Loan", amount: 450 },
  ],
  payslips: [
    { period: "2026-07-01 – 07-15", net: 9120, status: "Released" },
    { period: "2026-06-16 – 06-30", net: 9040, status: "Released" },
    { period: "2026-06-01 – 06-15", net: 8975, status: "Released" },
  ],
};

export const myBenefits = [
  { name: "SSS", value: "34-1234567-8", note: "Active contributions" },
  { name: "PhilHealth", value: "12-345678901-2", note: "Active" },
  { name: "Pag-IBIG", value: "1234-5678-9012", note: "Active + MP2" },
  { name: "BIR Tax Status", value: "S — Single", note: "TIN 123-456-789" },
  { name: "HMO", value: "Maxicare Platinum", note: "Effective after regularization" },
  { name: "Insurance", value: "Group Life", note: "₱500,000 coverage" },
];
