import { Badge } from "@/components/ui/badge";

import type { PredictionMethod } from "../types/intelligence.types";
import { formatLabel } from "./intelligence-formatters";

export function PredictionMethodBadge({ method }: { method: PredictionMethod }) {
  return <Badge tone={method === "rule_based" ? "info" : "warning"}>{formatLabel(method)}</Badge>;
}

export function MlStatusBadge({ configured }: { configured: boolean }) {
  return <Badge tone={configured ? "success" : "warning"}>{configured ? "Configured" : "Not configured"}</Badge>;
}

export function EvaluationStatusBadge({ hasActual }: { hasActual: boolean }) {
  return <Badge tone={hasActual ? "success" : "info"}>{hasActual ? "Evaluated" : "Pending actual"}</Badge>;
}
