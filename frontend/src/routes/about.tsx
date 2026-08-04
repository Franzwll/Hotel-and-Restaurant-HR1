import { createFileRoute } from "@tanstack/react-router";

import { PublicShell } from "@/components/public/PublicShell";
import { Card, CardContent } from "@/components/ui/card";
import { company, facilities } from "@/data/company";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Oxford Suites Makati" },
      {
        name: "description",
        content:
          "Learn about Oxford Suites Makati: our mission, vision, values, facilities, and hospitality culture in Makati City.",
      },
      { property: "og:title", content: "About Us — Oxford Suites Makati" },
      {
        property: "og:description",
        content: "Our mission, vision, values, and facilities in the heart of Makati City.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-5xl px-4 py-14 md:px-8">
        <p className="eyebrow">About</p>
        <h1 className="mt-1 font-display text-4xl font-semibold md:text-5xl">{company.name}</h1>
        <div className="gold-rule my-6" />
        <p className="text-base leading-relaxed text-muted-foreground">{company.overview}</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold">Our Mission</h2>
              <p className="mt-2 text-sm text-muted-foreground">{company.mission}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold">Our Vision</h2>
              <p className="mt-2 text-sm text-muted-foreground">{company.vision}</p>
            </CardContent>
          </Card>
        </div>

        <h2 className="mt-12 font-display text-3xl font-semibold">Our Values</h2>
        <div className="gold-rule my-5" />
        <div className="grid gap-6 sm:grid-cols-2">
          {company.values.map((v) => (
            <div key={v.title} className="rounded-md border border-border bg-card p-5">
              <h3 className="font-display text-xl font-semibold text-primary">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-12 font-display text-3xl font-semibold">Facilities</h2>
        <div className="gold-rule my-5" />
        <div className="grid gap-6 sm:grid-cols-2">
          {facilities.map((f) => (
            <div key={f.name} className="rounded-md border border-border bg-card p-5">
              <h3 className="font-display text-xl font-semibold">{f.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
