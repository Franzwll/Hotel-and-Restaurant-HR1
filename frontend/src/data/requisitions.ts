import { useSyncExternalStore } from "react";

export type Requisition = {
  id: string;
  position: string;
  department: string;
  count: number;
  urgency: string;
  justification: string;
  status: "Pending" | "Approved" | "Converted";
  requestedAt: string;
};

const seedRequisitions: Requisition[] = [
  {
    id: "REQ-1001",
    position: "Front Desk Receptionist",
    department: "Front Office",
    count: 2,
    urgency: "High",
    justification:
      "Two front desk associates are due to transition to the Guest Relations team next month, and occupancy is trending up for the coming peak season. Backfilling now avoids a coverage gap on the AM/PM shift rotation.",
    status: "Pending",
    requestedAt: "2024-05-02",
  },
  {
    id: "REQ-1002",
    position: "Housekeeping Attendant",
    department: "Housekeeping",
    count: 3,
    urgency: "Urgent",
    justification:
      "Room turnover times have slipped past the 30-minute SLA due to persistent understaffing. Three additional attendants are needed to restore standard turnaround ahead of the group bookings arriving this quarter.",
    status: "Pending",
    requestedAt: "2024-05-05",
  },
  {
    id: "REQ-1003",
    position: "Line Cook",
    department: "Food & Beverage",
    count: 1,
    urgency: "Normal",
    justification:
      "The kitchen brigade is short one station cook following a resignation. A replacement hire keeps the current menu rotation and banquet commitments fully staffed.",
    status: "Pending",
    requestedAt: "2024-05-08",
  },
];

let requisitions: Requisition[] = [...seedRequisitions];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const requisitionStore = {
  getSnapshot: () => requisitions,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  add: (r: Requisition) => {
    requisitions = [r, ...requisitions];
    emit();
  },
  update: (id: string, patch: Partial<Requisition>) => {
    requisitions = requisitions.map((r) => (r.id === id ? { ...r, ...patch } : r));
    emit();
  },
};

export function useRequisitions() {
  return useSyncExternalStore(
    requisitionStore.subscribe,
    requisitionStore.getSnapshot,
    requisitionStore.getSnapshot,
  );
}
