import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/modules/AdminModules";
export const Route = createFileRoute("/employee/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Oxford Suites Makati HRMS" },
      { name: "description", content: "Account password and notification preferences." },
      { property: "og:title", content: "Settings — Oxford Suites Makati HRMS" },
      { property: "og:description", content: "Account password and notification preferences." },
    ],
  }),
  component: () => <SettingsPage role="employee" />,
});
