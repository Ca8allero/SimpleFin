import { invoke } from "@tauri-apps/api/core";

export interface Category {
  id: number;
  name: string;
  kind: "income" | "expense";
}

export function listCategories(): Promise<Category[]> {
  return invoke("list_categories");
}

export interface NewTransaction {
  kind: "income" | "expense";
  amount: number;
  currencyCode: string;
  occurredOn: string; // YYYY-MM-DD
  categoryId: number | null;
  description: string;
}

export function createTransaction(tx: NewTransaction): Promise<number> {
  return invoke("create_transaction", {
    transaction: {
      kind: tx.kind,
      amount: tx.amount,
      currency_code: tx.currencyCode,
      occurred_on: tx.occurredOn,
      category_id: tx.categoryId,
      description: tx.description || null,
    },
  });
}

export interface TransactionRow {
  id: number;
  kind: "income" | "expense";
  amount: number;
  currencyCode: string;
  occurredOn: string;
  categoryName: string | null;
  description: string | null;
}

interface RawTransactionRow {
  id: number;
  kind: "income" | "expense";
  amount: number;
  currency_code: string;
  occurred_on: string;
  category_name: string | null;
  description: string | null;
}

export function listTransactionsForMonth(year: number, month: number): Promise<TransactionRow[]> {
  return invoke<RawTransactionRow[]>("list_transactions_for_month", { year, month }).then((rows) =>
    rows.map((r) => ({
      id: r.id,
      kind: r.kind,
      amount: r.amount,
      currencyCode: r.currency_code,
      occurredOn: r.occurred_on,
      categoryName: r.category_name,
      description: r.description,
    })),
  );
}

export interface MonthlySummary {
  income: number;
  expenses: number;
  available: number;
}

export function getMonthlySummary(year: number, month: number): Promise<MonthlySummary> {
  return invoke("monthly_summary", { year, month });
}