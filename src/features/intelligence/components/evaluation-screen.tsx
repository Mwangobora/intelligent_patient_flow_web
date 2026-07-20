"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SelectField } from "@/components/forms/select-field";
import { TextInputField } from "@/components/forms/text-input-field";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ResponsiveFilterPanel } from "@/components/layout/responsive-filter-panel";
import { Button } from "@/components/ui/button";

import { useIntelligenceWorkspace, usePredictionEvaluationQuery } from "../hooks/use-intelligence-queries";
import type { PredictionEvaluationParams, PredictionEvaluationRow } from "../types/intelligence.types";
import { EvaluationStatusBadge, PredictionMethodBadge } from "./intelligence-badges";
import { average, formatIntelligenceDate, formatMinutes, formatOptional } from "./intelligence-formatters";
import { getFriendlyIntelligenceError } from "./intelligence-friendly-error";
import { IntelligencePageTabs } from "./intelligence-page-tabs";
import { IntelligenceTable } from "./intelligence-table";
import { PredictionErrorChart } from "./prediction-error-chart";

export function EvaluationScreen() {
  const workspace = useIntelligenceWorkspace();
  const [filters, setFilters] = useState<PredictionEvaluationParams>({ prediction_method: "" });
  const evaluationQuery = usePredictionEvaluationQuery(filters, { enabled: workspace.canEvaluatePredictions });
  const rows = evaluationQuery.data ?? [];

  if (workspace.isLoading) return <LoadingState title="Loading evaluation" description="Checking prediction evaluation permission." />;
  if (!workspace.canEvaluatePredictions) return <ErrorState title="Evaluation access required" description="You do not have permission to evaluate predictions." />;

  return (
    <PageContainer className="space-y-6">
      <IntelligencePageTabs activeTab="evaluation" />
      <PageHeader title="Prediction Evaluation" description="Compare predicted wait time against actual queue wait once service starts." />
      <ResponsiveActionBar>
        <Button variant="secondary" onClick={() => void evaluationQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
      </ResponsiveActionBar>
      <ResponsiveFilterPanel title="Evaluation filters" description="Filter by facility, method, model, and generation date range.">
        <div className="grid gap-4 lg:grid-cols-3">
          <TextInputField label="Facility ID" value={filters.facility_id ?? ""} onChange={(event) => setFilters((current) => ({ ...current, facility_id: event.target.value }))} />
          <SelectField label="Prediction method" value={filters.prediction_method ?? ""} onChange={(event) => setFilters((current) => ({ ...current, prediction_method: event.target.value as PredictionEvaluationParams["prediction_method"] }))} options={[{ label: "All methods", value: "" }, { label: "Rule based", value: "rule_based" }, { label: "Machine learning", value: "machine_learning" }]} />
          <TextInputField label="Model version" value={filters.model_version ?? ""} onChange={(event) => setFilters((current) => ({ ...current, model_version: event.target.value }))} />
          <TextInputField label="Generated from" type="datetime-local" value={filters.generated_from ?? ""} onChange={(event) => setFilters((current) => ({ ...current, generated_from: event.target.value }))} />
          <TextInputField label="Generated to" type="datetime-local" value={filters.generated_to ?? ""} onChange={(event) => setFilters((current) => ({ ...current, generated_to: event.target.value }))} />
        </div>
      </ResponsiveFilterPanel>
      <div className="grid gap-4 md:grid-cols-3">
        <Summary title="Evaluated predictions" value={formatOptional(rows.length)} />
        <Summary title="Average actual wait" value={formatMinutes(average(rows.map((row) => row.actual_wait_minutes)))} />
        <Summary title="Average error" value={formatMinutes(average(rows.map((row) => row.absolute_error_minutes)))} />
      </div>
      {evaluationQuery.error ? <ErrorState title="Unable to load evaluation" description={getFriendlyIntelligenceError(evaluationQuery.error)} actionLabel="Retry" onAction={() => void evaluationQuery.refetch()} /> : null}
      {evaluationQuery.isLoading ? <LoadingState title="Loading evaluation" description="Fetching prediction accuracy rows." /> : null}
      {!evaluationQuery.isLoading && !evaluationQuery.error ? (
        <>
          <PredictionErrorChart rows={rows} />
          <IntelligenceTable records={rows} columns={columns} emptyMessage="No evaluated predictions match these filters." />
        </>
      ) : null}
    </PageContainer>
  );
}

const columns = [
  { header: "Prediction", render: (row: PredictionEvaluationRow) => row.prediction_id },
  { header: "Method", render: (row: PredictionEvaluationRow) => <PredictionMethodBadge method={row.prediction_method} /> },
  { header: "Status", render: () => <EvaluationStatusBadge hasActual /> },
  { header: "Predicted", render: (row: PredictionEvaluationRow) => formatMinutes(row.predicted_wait_minutes) },
  { header: "Actual", render: (row: PredictionEvaluationRow) => formatMinutes(row.actual_wait_minutes) },
  { header: "Error", render: (row: PredictionEvaluationRow) => formatMinutes(row.absolute_error_minutes) },
  { header: "Model", render: (row: PredictionEvaluationRow) => formatOptional(row.model_version) },
  { header: "Generated", render: (row: PredictionEvaluationRow) => formatIntelligenceDate(row.generated_at) },
];

function Summary({ title, value }: { title: string; value: string }) {
  return <div className="rounded-xl border border-border bg-card p-4"><p className="text-sm text-muted-foreground">{title}</p><p className="mt-1 text-2xl font-semibold text-foreground">{value}</p></div>;
}
