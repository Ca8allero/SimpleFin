import { useState, type FormEvent } from "react";
import { login } from "./api";

interface LoginScreenProps {
  onUnlocked: () => void;
}

export default function LoginScreen({ onUnlocked }: LoginScreenProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const ok = await login(password);
      if (ok) {
        onUnlocked();
      } else {
        setError("Incorrect password.");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="relative w-full max-w-sm">
        <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-brand via-forecast to-transparent" />

        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/40">
          <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase mb-2">
            Simple Fin
          </p>
          <h1 className="font-display text-2xl font-semibold text-foreground mb-6">
            Unlock
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                autoComplete="current-password"
              />
            </div>

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
              {submitting ? "Unlocking..." : "Unlock"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}