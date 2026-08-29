import type { ReactNode } from "react";
import StatCard from "../../components/StatCard";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-mono text-xs tracking-[0.15em] text-muted uppercase mb-3">
      {children}
    </h2>
  );
}

export default function DashboardScreen() {
  return (
    <div className="p-8 space-y-10 overflow-y-auto h-full">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground mb-1">Overview</h1>
        <p className="text-sm text-muted">How am I doing?</p>
      </div>

      <section>
        <SectionLabel>Month overview</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Income" value="$0.00" />
          <StatCard label="Expenses" value="$0.00" />
          <StatCard label="Available money" value="$0.00" />
          <StatCard label="Savings" value="—" tone="muted" />
          <StatCard label="Investment contribution" value="$0.00" />
        </div>
      </section>

      <section>
        <SectionLabel>Portfolio</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Current value" value="$0.00" />
          <StatCard label="Invested capital" value="$0.00" />
          <StatCard label="Profit / Loss" value="$0.00" tone="muted" />
          <StatCard label="ROI" value="—" tone="muted" />
          <StatCard label="Monthly growth" value="—" tone="muted" />
        </div>
      </section>

      <section>
        <SectionLabel>Plan</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Monthly target" value="—" hint="No investment plan yet" tone="muted" />
          <StatCard label="Investment goal" value="—" hint="No goal set yet" tone="muted" />
          <StatCard label="Current alignment" value="—" hint="Not enough historical data yet" tone="muted" />
        </div>
      </section>
    </div>
  );
}