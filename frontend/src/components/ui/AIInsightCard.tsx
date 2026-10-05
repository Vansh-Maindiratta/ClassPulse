import { Info } from "lucide-react";
import { Card } from "./Card";

interface Props {
  text: string;
  loading?: boolean;
  unavailable?: boolean;
}

export function AIInsightCard({ text, loading, unavailable }: Props) {
  return (
    <Card>
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-secondary">
        <Info className="h-4 w-4" aria-hidden="true" />
        AI Insight
      </div>
      {loading ? (
        <p className="text-sm text-muted">Looking at your academic data…</p>
      ) : unavailable ? (
        <p className="text-sm text-muted">
          AI insights are currently unavailable. You can continue using ClassPulse normally.
        </p>
      ) : (
        <p className="text-sm leading-6 text-ink">{text}</p>
      )}
    </Card>
  );
}
