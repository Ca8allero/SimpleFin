interface NavItem {
  id: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview" },
  { id: "finances", label: "Finances" },
  { id: "investments", label: "Investments" },
  { id: "analytics", label: "Analytics" },
  { id: "forecast", label: "Forecast" },
  { id: "settings", label: "Settings" },
];

interface SidebarProps {
  active: string;
  onSelect: (id: string) => void;
  onLock: () => void;
}

export default function Sidebar({ active, onSelect, onLock }: SidebarProps) {
  return (
    <aside className="w-56 shrink-0 bg-surface border-r border-border flex flex-col">
      <div className="px-5 py-6">
        <p className="font-display text-lg font-semibold text-foreground">Simple Fin</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-brand/15 text-brand font-medium"
                  : "text-muted hover:text-foreground hover:bg-card"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-5">
        <button
          onClick={onLock}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted hover:text-loss hover:bg-loss/10 transition-colors"
        >
          🔒 Lock Simple Fin
        </button>
      </div>
    </aside>
  );
}