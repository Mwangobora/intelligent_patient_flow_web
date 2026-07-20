"use client";

import Link from "next/link";
import { Activity, BrainCircuit, Clock, Timer } from "lucide-react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { MetricCard } from "@/components/common/metric-card";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { Button } from "@/components/ui/button";

import { useIntelligenceWorkspace, usePredictionDetailQuery, usePredictionEvaluationQuery } from "../hooks/use-intelligence-queries";
import { EvaluationStatusBadge, PredictionMethodBadge } from "./intelligence-badges";
import { formatIntelligenceDate, formatMinutes, formatOptional } from "./intelligence-formatters";
import { getFriendlyIntelligenceError } from "./intelligence-friendly-error";
import { IntelligencePageTabs } from "./intelligence-page-tabs";

export function PredictionDetailScreen({ predictionId }: { predictionId: string }) {
  const workspace = useIntelligenceWorkspace();
  const detailQuery = usePredictionDetailQuery(predictionId, { enabled: workspace.canViewPredictions });
  const prediction = detailQuery.data;
  const evaluationQuery = usePredictionEvaluationQuery(
    { facility_id: prediction?.facility },
    { enabled: workspace.canEvaluatePredictions && Boolean(prediction?.facility) },
  );
  const evaluation = evaluationQuery.data?.find((row) => row.prediction_id === predictionId);

  if (workspace.isLoading || detailQuery.isLoading) {
    return <LoadingState title="Loading prediction" description="Fetching wait-time prediction detail." />;
  }
  if (!workspace.canViewPredictions) {
    return <ErrorState title="Prediction access required" description="You do not have permission to view intelligence predictions." />;
  }
  if (detailQuery.error || !prediction) {
    return <ErrorState title="Prediction not found" description={getFriendlyIntelligenceError(detailQuery.error)} actionLabel="Back to predictions" onAction={() => window.history.back()} />;
  }

  return (
    <PageContainer className="space-y-6">
      <IntelligencePageTabs activeTab="predictions" />
      <PageHeader title="Prediction Detail" description={`Generated ${formatIntelligenceDate(prediction.generated_at)} for queue entry ${prediction.queue_entry}.`} />
      <ResponsiveActionBar>
        <Link href="/intelligence/predictions"><Button variant="secondary">Back to predictions</Button></Link>
      </ResponsiveActionBar>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Predicted wait" value={formatMinutes(prediction.predicted_wait_minutes)} description="Backend prediction value." icon={Clock} />
        <MetricCard title="Actual wait" value={formatMinutes(evaluation?.actual_wait_minutes ?? null)} description="Available after service starts." icon={Timer} />
        <MetricCard title="Absolute error" value={formatMinutes(evaluation?.absolute_error_minutes ?? null)} description="Prediction accuracy gap." icon={Activity} />
        <MetricCard title="Confidence" value={formatOptional(prediction.confidence_score)} description="May be empty for rule-based output." icon={BrainCircuit} />
      </section>
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Prediction summary" description="Safe prediction fields only. No patient information is exposed.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Info label="Method" value={<PredictionMethodBadge method={prediction.prediction_method} />} />
            <Info label="Evaluation" value={<EvaluationStatusBadge hasActual={Boolean(evaluation)} />} />
            <Info label="Model version" value={formatOptional(prediction.model_version)} />
            <Info label="Queue entry status" value={formatOptional(prediction.queue_entry_status)} />
            <Info label="Generated at" value={formatIntelligenceDate(prediction.generated_at)} />
            <Info label="Created at" value={formatIntelligenceDate(prediction.created_at)} />
          </div>
        </SectionCard>
        <SectionCard title="Queue context" description="Identifiers only, shown for operational traceability without patient details.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Info label="Queue entry" value={prediction.queue_entry} />
            <Info label="Queue" value={prediction.queue} />
            <Info label="Service point" value={prediction.service_point} />
            <Info label="Facility" value={prediction.facility} />
          </div>
        </SectionCard>
      </div>
    </PageContainer>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 break-words text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
