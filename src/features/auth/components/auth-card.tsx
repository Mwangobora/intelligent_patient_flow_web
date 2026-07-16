import type { ReactNode } from "react";

import { Hospital } from "lucide-react";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <section className="w-full max-w-[420px] space-y-10 py-4">
      <div className="space-y-7">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary shadow-sm">
          <Hospital className="h-7 w-7" />
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Intelligent Patient Flow
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="max-w-sm text-sm leading-7 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}
