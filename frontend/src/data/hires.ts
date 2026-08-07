import { useSyncExternalStore } from "react";

import { newHires as seedHires, type Employee, type NewHire } from "@/data/hr";

/** Draft handed over from Applicant Management when an assessment is accepted. */
export type PendingHire = {
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
};

let hires: NewHire[] = [...seedHires];
/** Employees created from hires — merged into Employee Records. */
let hireEmployees: Employee[] = [];
let pendingHire: PendingHire | null = null;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const DEFAULT_ACCOUNT_PASSWORD = "Oxford@2026";

export const hireStore = {
  subscribe,
  getHires: () => hires,
  getEmployees: () => hireEmployees,
  getPending: () => pendingHire,
  setHires: (updater: (prev: NewHire[]) => NewHire[]) => {
    hires = updater(hires);
    emit();
  },
  /** Adds a hire and mirrors them into Employee Records straight away. */
  add: (hire: NewHire) => {
    hires = [hire, ...hires];
    hireEmployees = [
      {
        id: `EMP-${String(9000 + hireEmployees.length + 1)}`,
        name: hire.name,
        position: hire.position,
        department: hire.department,
        employmentType: "Probationary",
        dateHired: hire.startDate,
        email: hire.email,
        phone: hire.phone,
        supervisor: "—",
        status: "Active",
      },
      ...hireEmployees,
    ];
    emit();
  },
  setPending: (p: PendingHire | null) => {
    pendingHire = p;
    emit();
  },
  /** Atomically takes the pending hire (returns null if already consumed). */
  consumePending: () => {
    const p = pendingHire;
    pendingHire = null;
    if (p) emit();
    return p;
  },
  /** True when a hire with the same name + position already exists. */
  exists: (name: string, position: string) =>
    hires.some((h) => h.name === name && h.position === position),
};

export function useHires() {
  return useSyncExternalStore(subscribe, hireStore.getHires, hireStore.getHires);
}

export function useHireEmployees() {
  return useSyncExternalStore(subscribe, hireStore.getEmployees, hireStore.getEmployees);
}

export function usePendingHire() {
  return useSyncExternalStore(subscribe, hireStore.getPending, hireStore.getPending);
}
