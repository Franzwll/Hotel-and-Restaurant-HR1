import { createFileRoute } from "@tanstack/react-router";
import { EmployeeOnboarding } from "@/components/modules/AdminModules";
export const Route = createFileRoute("/employee/onboarding")({
  head: () => ({
    meta: [
      { title: "My Onboarding — Oxford Suites Makati HRMS" },
      { name: "description", content: "Complete your onboarding requirements and track your employment stage." },
      { property: "og:title", content: "My Onboarding — Oxford Suites Makati HRMS" },
      { property: "og:description", content: "Complete your onboarding requirements and track your employment stage." },
    ],
  }),
  component: () => <EmployeeOnboarding />,
});
