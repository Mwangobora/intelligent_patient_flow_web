"use client";

import { Filter } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ResponsiveFilterPanelProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
};

export function ResponsiveFilterPanel({
  title = "Filters",
  description,
  children,
}: ResponsiveFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between lg:hidden">
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        <Button variant="secondary" onClick={() => setIsOpen((current) => !current)}>
          <Filter className="mr-2 h-4 w-4" />
          {isOpen ? "Hide filters" : "Show filters"}
        </Button>
      </div>

      <Card className={isOpen ? "block lg:block" : "hidden lg:block"}>
        <CardContent className="p-5">{children}</CardContent>
      </Card>
    </>
  );
}
