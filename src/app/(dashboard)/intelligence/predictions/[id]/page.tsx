import { PredictionDetailScreen } from "@/features/intelligence/components/prediction-detail-screen";

export default async function IntelligencePredictionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PredictionDetailScreen predictionId={id} />;
}
