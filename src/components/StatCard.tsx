interface StatCardProps {
  label: string;
  value: string;
  tone?: "default" | "profit" | "loss" | "muted";
  hint?: string;
}

const TONE_CLASSES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-foreground",
  profit: "text-profit",
  loss: "text-loss",
  muted: "text-muted",
};

export default function StatCard({ label, value, tone = "default", hint }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs text-muted mb-1.5">{label}</p>
      <p className={`font-mono text-xl font-medium ${TONE_CLASSES[tone]}`}>{value}</p>
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}