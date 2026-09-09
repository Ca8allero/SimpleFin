import { useEffect, useState, type FormEvent } from "react";
import { listCategories, createTransaction, type Category } from "./api";
import { todayIsoDate } from "../../shared/format";

interface AddTransactionFormProps {
  currencyCode: string;
  onCreated: () => void;
}

export default function AddTransactionForm({ currencyCode, onCreated }: AddTransactionFormProps) {
  const [kind, setKind] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [occurredOn, setOccurredOn] = useState(todayIsoDate());
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listCategories().then(setCategories).catch((e) => setError(String(e)));
  }, []);

  const relevantCategories = categories.filter((c) => c.kind === kind);

  useEffect(() => {
    setCategoryId(null);
  }, [kind]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedAmount = Number(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }

    setSubmitting(true);
    try {
      await createTransaction({
        kind,
        amount: parsedAmount,
        currencyCode,
        occurredOn,
        categoryId,
        description,
      });
      setAmount("");
      setDescription("");
      onCreated();
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setKind("income")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            kind === "income" ? "bg-profit/15 text-profit border border-profit/30" : "bg-surface text-muted border border-border"
          }`}
        >
          Income
        </button>
        <button
          type="button"
          onClick={() => setKind("expense")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            kind === "expense" ? "bg-loss/15 text-loss border border-loss/30" : "bg-surface text-muted border border-border"
          }`}
        >
          Expense
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Amount ({currencyCode})</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Date</label>
          <input
            type="date"
            value={occurredOn}
            onChange={(e) => setOccurredOn(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Category</label>
        <select
          value={categoryId ?? ""}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">No category</option>
          {relevantCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Description (optional)</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          placeholder="e.g. Groceries"
        />
      </div>

      {error && (
        <p className="text-xs text-loss bg-loss/10 border border-loss/20 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-brand text-white text-sm font-medium rounded-lg py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitting ? "Adding..." : `Add ${kind}`}
      </button>
    </form>
  );
}