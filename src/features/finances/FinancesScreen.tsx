import { useCallback, useEffect, useState } from "react";
import {
  listTransactionsForMonth,
  getMonthlySummary,
  type TransactionRow,
  type MonthlySummary,
} from "./api";
import { getProfileSettings, type ProfileSettings } from "../authentication/api";
import { currentYearMonth, formatCurrency } from "../../shared/format";
import AddTransactionForm from "./AddTransactionForm";
import TransactionList from "./TransactionList";

export default function FinancesScreen() {
  const { year, month } = currentYearMonth();
  const [settings, setSettings] = useState<ProfileSettings | null>(null);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);

  const reload = useCallback(() => {
    listTransactionsForMonth(year, month).then(setTransactions);
    getMonthlySummary(year, month).then(setSummary);
  }, [year, month]);

  useEffect(() => {
    getProfileSettings().then(setSettings);
    reload();
  }, [reload]);

  if (!settings) {
    return null;
  }

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-foreground mb-1">Finances</h1>
        <p className="text-sm text-muted">This month's income and expenses.</p>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted mb-1.5">Income</p>
            <p className="font-mono text-lg text-profit">
              {formatCurrency(summary.income, settings.baseCurrency, settings.locale)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted mb-1.5">Expenses</p>
            <p className="font-mono text-lg text-loss">
              {formatCurrency(summary.expenses, settings.baseCurrency, settings.locale)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted mb-1.5">Available money</p>
            <p className="font-mono text-lg text-foreground">
              {formatCurrency(summary.available, settings.baseCurrency, settings.locale)}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <AddTransactionForm currencyCode={settings.baseCurrency} onCreated={reload} />
        <TransactionList transactions={transactions} locale={settings.locale} />
      </div>
    </div>
  );
}