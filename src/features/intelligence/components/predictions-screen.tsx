"use client";

import Link from "next/link";
import { BarChart3, BrainCircuit, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { TextInputField } from "@/components/forms/text-input-field";
import { SelectField } from "@/components/forms/select-field";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ResponsiveFilterPanel } from "@/components/layout/responsive-filter-panel";
import { FormDialog } from "@/components/overlays/form-dialog";
import { FormSheet } from "@/components/overlays/form-sheet";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/features/appointments/hooks/use-debounced-value";

import {
  useCreatePredictionMutation,
  useGenerateMachineLearningPredictionMutation,
  useGenerateRuleBasedPredictionMutation,
} from "../hooks/use-intelligence-mutations";
import { useIntelligenceWorkspace, usePredictionsQuery } from "../hooks/use-intelligence-queries";
import type { PredictionListParams, WaitTimePredictionRecord } from "../types/intelligence.types";
import { CreatePredictionForm, MachineLearningPredictionForm, RuleBasedPredictionForm } from "./intelligence-forms";
import { average, cleanIntelligencePayload, formatIntelligenceDate, formatMinutes, formatOptional } from "./intelligence-formatters";
import { getFriendlyIntelligenceError } from "./intelligence-friendly-error";
import { IntelligencePageTabs } from "./intelligence-page-tabs";
import { IntelligenceTable } from "./intelligence-table";
import { PredictionMethodBadge } from "./intelligence-badges";

export function PredictionsScreen() {
  const workspace = useIntelligenceWorkspace();
  const [filters, setFilters] = useState<PredictionListParams>({ prediction_method: "" });
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [mlDialogOpen, setMlDialogOpen] = useState(false);
  const [manualSheetOpen, setManualSheetOpen] = useState(false);
  const debouncedQueueEntry = useDebouncedValue(filters.queue_entry_id ?? "");
  const queryParams = { ...filters, queue_entry_id: debouncedQueueEntry || undefined };
  const predictionsQuery = usePredictionsQuery(queryParams, { enabled: workspace.canViewPredictions });
  const ruleMutation = useGenerateRuleBasedPredictionMutation();
  const mlMutation = useGenerateMachineLearningPredictionMutation();
  const createMutation = useCreatePredictionMutation();

  const columns = useMemo(
    () => [
      { header: "Queue entry", render: (item: WaitTimePredictionRecord) => formatOptional(item.queue_entry) },
      { header: "Queue / service point", render: (item: WaitTimePredictionRecord) => <span>{formatOptional(item.queue)}<br /><span className="text-muted-foreground">{formatOptional(item.service_point)}</span></span> },
      { header: "Method", render: (item: WaitTimePredictionRecord) => <PredictionMethodBadge method={item.prediction_method} /> },
      { header: "Predicted wait", render: (item: WaitTimePredictionRecord) => formatMinutes(item.predicted_wait_minutes) },
      { header: "Confidence", render: (item: WaitTimePredictionRecord) => formatOptional(item.confidence_score) },
      { header: "Model version", render: (item: WaitTimePredictionRecord) => formatOptional(item.model_version) },
      { header: "Generated", render: (item: WaitTimePredictionRecord) => formatIntelligenceDate(item.generated_at) },
      { header: "Actions", render: (item: WaitTimePredictionRecord) => <Link href={`/intelligence/predictions/${item.id}`} className="font-semibold text-primary hover:underline">View detail</Link> },
    ],
    [],
  );

  if (workspace.isLoading) return <LoadingState title="Loading predictions" description="Checking intelligence permissions." />;
  if (!workspace.canViewPredictions) return <ErrorState title="Prediction access required" description="You do not have permission to view intelligence predictions." />;

  const predictions = predictionsQuery.data ?? [];

  return (
    <PageContainer className="space-y-6">
      <IntelligencePageTabs activeTab="predictions" />
      <PageHeader title="Wait-Time Predictions" description="Browse rule-based and AI-ready queue wait predictions from the backend." />
      <ResponsiveActionBar>
        {workspace.canCreatePredictions ? <Button onClick={() => setRuleDialogOpen(true)}><BrainCircuit className="mr-2 h-4 w-4" />Rule-based</Button> : null}
        {workspace.canCreatePredictions ? <Button variant="secondary" onClick={() => setManualSheetOpen(true)}><BarChart3 className="mr-2 h-4 w-4" />Manual prediction</Button> : null}
        {workspace.canCreatePredictions ? <Button variant="secondary" onClick={() => setMlDialogOpen(true)}>ML placeholder</Button> : null}
        <Button variant="secondary" onClick={() => void predictionsQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
      </ResponsiveActionBar>
      <ResponsiveFilterPanel title="Prediction filters" description="Use real backend filters for queue entry, facility, method, model, and date range.">
        <div className="grid gap-4 lg:grid-cols-3">
          <TextInputField label="Queue entry ID" value={filters.queue_entry_id ?? ""} onChange={(event) => setFilters((current) => ({ ...current, queue_entry_id: event.target.value }))} />
          <TextInputField label="Facility ID" value={filters.facility_id ?? ""} onChange={(event) => setFilters((current) => ({ ...current, facility_id: event.target.value }))} />
          <SelectField label="Prediction method" value={filters.prediction_method ?? ""} onChange={(event) => setFilters((current) => ({ ...current, prediction_method: event.target.value as PredictionListParams["prediction_method"] }))} options={[{ label: "All methods", value: "" }, { label: "Rule based", value: "rule_based" }, { label: "Machine learning", value: "machine_learning" }]} />
          <TextInputField label="Model version" value={filters.model_version ?? ""} onChange={(event) => setFilters((current) => ({ ...current, model_version: event.target.value }))} />
          <TextInputField label="Generated from" type="datetime-local" value={filters.generated_from ?? ""} onChange={(event) => setFilters((current) => ({ ...current, generated_from: event.target.value }))} />
          <TextInputField label="Generated to" type="datetime-local" value={filters.generated_to ?? ""} onChange={(event) => setFilters((current) => ({ ...current, generated_to: event.target.value }))} />
        </div>
      </ResponsiveFilterPanel>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4"><p className="text-sm text-muted-foreground">Loaded predictions</p><p className="mt-1 text-2xl font-semibold">{predictions.length}</p></div>
        <div className="rounded-xl border border-border bg-card p-4"><p className="text-sm text-muted-foreground">Average predicted wait</p><p className="mt-1 text-2xl font-semibold">{formatMinutes(average(predictions.map((item) => item.predicted_wait_minutes)))}</p></div>
        <div className="rounded-xl border border-border bg-card p-4"><p className="text-sm text-muted-foreground">Mode</p><p className="mt-1 text-2xl font-semibold">Rule-based first</p></div>
      </div>

      {predictionsQuery.isLoading ? <LoadingState title="Loading predictions" description="Fetching wait-time prediction records." /> : null}
      {predictionsQuery.error ? <ErrorState title="Unable to load predictions" description={getFriendlyIntelligenceError(predictionsQuery.error)} actionLabel="Retry" onAction={() => void predictionsQuery.refetch()} /> : null}
      {!predictionsQuery.isLoading && !predictionsQuery.error ? <IntelligenceTable records={predictions} columns={columns} emptyMessage="No predictions match these filters." /> : null}

      <FormDialog open={ruleDialogOpen} title="Generate rule-based prediction" description="Select a queue entry and create a real rule-based backend prediction." onOpenChange={setRuleDialogOpen}>
        <RuleBasedPredictionForm isSubmitting={ruleMutation.isPending} onSubmit={async (values) => { await ruleMutation.mutateAsync(cleanIntelligencePayload(values)); setRuleDialogOpen(false); }} />
      </FormDialog>
      <FormDialog open={mlDialogOpen} title="Machine-learning prediction" description="This intentionally returns a clear not-configured message until backend ML is ready." onOpenChange={setMlDialogOpen}>
        <MachineLearningPredictionForm isSubmitting={mlMutation.isPending} onSubmit={async (values) => { await mlMutation.mutateAsync(values); setMlDialogOpen(false); }} />
      </FormDialog>
      <FormSheet open={manualSheetOpen} title="Create manual prediction" description="Admin/staff manual prediction creation through the backend endpoint." onOpenChange={setManualSheetOpen}>
        <CreatePredictionForm isSubmitting={createMutation.isPending} onSubmit={async (values) => { await createMutation.mutateAsync(cleanIntelligencePayload(values)); setManualSheetOpen(false); }} />
      </FormSheet>
    </PageContainer>
  );
}
