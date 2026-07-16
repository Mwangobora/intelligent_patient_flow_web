import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card className="w-full max-w-md border-border shadow-md">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto inline-flex rounded-full bg-secondary px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Intelligent Patient Flow
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
