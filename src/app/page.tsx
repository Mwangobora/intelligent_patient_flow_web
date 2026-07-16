import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dashboardColorPreview, statusToneLabels } from "@/config/theme.config";

export default function Home() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <section className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Frontend Foundation Part 1B
          </p>
          <div className="max-w-3xl space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">
              Intelligent Patient Flow UI Foundation
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              Providers, scalable folders, and Trust Teal + Navy design tokens are
              now ready for the app shell.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Core Components</CardTitle>
              <CardDescription>
                Token-driven buttons, badges, and card styling for reusable UI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <Button>Primary action</Button>
                <Button variant="secondary">Secondary action</Button>
                <Button variant="danger">Danger action</Button>
              </div>
              <div className="flex flex-wrap gap-3">
                {Object.entries(statusToneLabels).map(([tone, label]) => (
                  <Badge key={tone} tone={tone as keyof typeof statusToneLabels}>
                    {label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Architecture Status</CardTitle>
              <CardDescription>
                Query, Axios, Zustand, and module folders are prepared.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>TanStack Query for server state.</p>
              <p>Zustand for lightweight UI state only.</p>
              <p>Axios uses `withCredentials: true` for future cookie auth.</p>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Hospital Dashboard Color Preview</CardTitle>
            <CardDescription>
              Shared semantic tokens for cards, charts, badges, and status states.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {dashboardColorPreview.map((color) => (
                <div key={color.name} className="rounded-lg border bg-card p-4">
                  <div className={`mb-4 h-12 rounded-md ${color.token}`} />
                  <p className="text-sm font-semibold">{color.name}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {color.value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
