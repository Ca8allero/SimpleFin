interface ComingSoonProps {
  title: string;
}

export default function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="font-display text-xl text-foreground mb-1">{title}</p>
        <p className="text-sm text-muted">This module hasn't been built yet.</p>
      </div>
    </div>
  );
}