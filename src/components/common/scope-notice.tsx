import { Info } from "lucide-react";

type ScopeNoticeProps = {
  title: string;
  description: string;
};

export function ScopeNotice({ title, description }: ScopeNoticeProps) {
  return (
    <div className="rounded-2xl border border-primary/15 bg-primary/5 px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <Info className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
