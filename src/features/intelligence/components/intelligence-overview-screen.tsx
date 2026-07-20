"use client";

import Link from "next/link";
import { Activity, BarChart3, BrainCircuit, Clock, Timer, TrendingUp } from "lucide-react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { MetricCard } from "@/components/common/metric-card";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { Button } from "@/components/ui/button";

import { usePredictionEvaluationQuery, usePredictionsQuery, useIntelligenceWorkspace } from "../hooks/use-intelligence-queries";
import { average, formatMinutes, formatOptional } from "./intelligence-formatters";
import { getFriendlyIntelligenceError } from "./intelligence-friendly-error";
import { IntelligencePageTabs } from "./intelligence-page-tabs";
import { MlStatusBadge } from "./intelligence-badges";
import { PredictionErrorChart } from "./prediction-error-chart";

export function IntelligenceOverviewScreen() {
  const workspace = useIntelligenceWorkspace();
  const predictionsQuery = usePredictionsQuery({}, { enabled: workspace.canViewPredictions });
  const evaluationQuery = usePredictionEvaluationQuery({}, { enabled: workspace.canEvaluatePredictions });

  if (workspace.isLoading) {
    return <LoadingState title="Loading intelligence workspace" description="Checking intelligence permissions." />;
  }
  if (!workspace.canViewPredictions && !workspace.canEvaluatePredictions) {
    return <ErrorState title="Intelligence access required" description="You do not have permission to view intelligence data." />;
  }

  const predictions = predictionsQuery.data ?? [];
  const evaluationRows = evaluationQuery.data ?? [];
  const ruleBasedCount = predictions.filter((item) => item.prediction_method === "rule_based").length;
  const machineLearningCount = predictions.filter((item) => item.prediction_method === "machine_learning").length;

  return (
    <PageContainer className="space-y-6">
      <IntelligencePageTabs activeTab="overview" />
      <PageHeader title="Waiting-Time Intelligence" description="Review rule-based queue predictions, arrival forecasts, slot suggestions, and prediction accuracy." />
      <ResponsiveActionBar>
        <Link href="/intelligence/predictions"><Button>Open predictions</Button></Link>
        <Link href="/intelligence/evaluation"><Button variant="secondary">View evaluation</Button></Link>
      </ResponsiveActionBar>

      <SectionCard title="Phase 1 intelligence" description="Current predictions are rule-based until a trained machine-learning model is configured.">
        <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>We show real backend predictions only. No fake AI output is generated in this UI.</span>
          <MlStatusBadge configured={machineLearningCount > 0} />
        </div>
      </SectionCard>

      {predictionsQuery.error ? (
        <ErrorState title="Unable to load predictions" description={getFriendlyIntelligenceError(predictionsQuery.error)} actionLabel="Retry" onAction={() => void predictionsQuery.refetch()} />
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard title="Predictions Generated" value={formatOptional(predictions.length)} description="Stored wait-time prediction records." icon={BrainCircuit} />
        <MetricCard title="Average Predicted Wait" value={formatMinutes(average(predictions.map((item) => item.predicted_wait_minutes)))} description="Mean predicted wait across loaded records." icon={Clock} />
        <MetricCard title="Average Actual Wait" value={formatMinutes(average(evaluationRows.map((item) => item.actual_wait_minutes)))} description="Actual queue wait where service started." icon={Timer} />
        <MetricCard title="Average Error" value={formatMinutes(average(evaluationRows.map((item) => item.absolute_error_minutes)))} description="Difference between predicted and actual waits." icon={BarChart3} />
        <MetricCard title="Rule-Based Predictions" value={formatOptional(ruleBasedCount)} description="Deterministic prediction records." icon={Activity} />
        <MetricCard title="ML Predictions" value={formatOptional(machineLearningCount)} description="Only shown when backend has real ML records." icon={TrendingUp} />
      </section>

      {evaluationQuery.error ? (
        <ErrorState title="Unable to load evaluation" description={getFriendlyIntelligenceError(evaluationQuery.error)} actionLabel="Retry" onAction={() => void evaluationQuery.refetch()} />
      ) : (
        <PredictionErrorChart rows={evaluationRows} />
      )}
    </PageContainer>
  );
}
