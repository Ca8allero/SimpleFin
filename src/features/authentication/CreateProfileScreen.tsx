import { useState, type FormEvent } from "react";
import { createProfile } from "./api";

const CURRENCIES = [
  { code: "COP", name: "Colombian Peso" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
];

const AUTO_LOCK_OPTIONS: { label: string; minutes: number | null }[] = [
  { label: "1 minute", minutes: 1 },
  { label: "5 minutes", minutes: 5 },
  { label: "15 minutes", minutes: 15 },
  { label: "30 minutes", minutes: 30 },
  { label: "Never", minutes: null },
];

interface CreateProfileScreenProps {
  onCreated: () => void;
}

export default function CreateProfileScreen({ onCreated }: CreateProfileScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currency, setCurrency] = useState("COP");
  const [autoLockMinutes, setAutoLockMinutes] = useState<number | null>(15);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (username.trim().length < 2) {
      setError("Username must be at least 2 characters.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await createProfile({
        username: username.trim(),
        password,
        baseCurrency: currency,
        locale: navigator.language || "en-US",
        autoLockMinutes,
      });
      onCreated();
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="relative w-full max-w-sm">
        {/* signature accent: thin brand -> forecast gradient rule */}
        <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-brand via-forecast to-transparent" />

        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/40">
          <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase mb-2">
            Simple Fin
          </p>
          <h1 className="font-display text-2xl font-semibold text-foreground mb-1">
            Create your profile
          </h1>
          <p className="text-sm text-muted mb-6">
            Your data stays on this device. Nothing is sent anywhere.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="e.g. Camilo"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5" htmlFor="confirm-password">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand"
                autoComplete="new-password"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5" htmlFor="currency">
                  Primary currency
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1.5" htmlFor="auto-lock">
                  Auto-lock
                </label>
                <select
                  id="auto-lock"
                  value={autoLockMinutes ?? "never"}
                  onChange={(e) =>
                    setAutoLockMinutes(e.target.value === "never" ? null : Number(e.target.value))
                  }
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  {AUTO_LOCK_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.minutes ?? "never"}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-xs text-warning bg-warning/10 border border-warning/20 rounded-lg px-3 py-2">
              If you lose your password, Simple Fin cannot recover it.
            </p>

            {error && (
              <p className="text-xs text-loss bg-loss/10 border border-loss/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand text-white text-sm font-medium rounded-lg py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating..." : "Create profile"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}