import { sanitizeForDisplay } from "./audit-formatters";

export function AuditJsonView({ value }: { value: unknown }) {
  return (
    <pre className="max-h-[420px] overflow-auto rounded-xl border border-border bg-secondary/40 p-4 text-xs leading-relaxed text-foreground">
      {JSON.stringify(sanitizeForDisplay(value ?? {}), null, 2)}
    </pre>
  );
}
