import type { TransactionRow } from "./api";
import { formatCurrency, formatDate } from "../../shared/format";

interface TransactionListProps {
  transactions: TransactionRow[];
  locale: string;
}

export default function TransactionList({ transactions, locale }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-sm text-muted">No transactions this month yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm text-foreground">
              {tx.description || tx.categoryName || (tx.kind === "income" ? "Income" : "Expense")}
            </p>
            <p className="text-xs text-muted">
              {tx.categoryName ?? "Uncategorized"} · {formatDate(tx.occurredOn, locale)}
            </p>
          </div>
          <p className={`font-mono text-sm font-medium ${tx.kind === "income" ? "text-profit" : "text-loss"}`}>
            {tx.kind === "income" ? "+" : "-"}
            {formatCurrency(tx.amount, tx.currencyCode, locale)}
          </p>
        </div>
      ))}
    </div>
  );
}