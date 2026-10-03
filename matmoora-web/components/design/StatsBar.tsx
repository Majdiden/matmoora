export function StatsBar({ items }: { items: { value: string; label: string }[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 rounded-lg border border-[var(--color-cream)]/10 bg-[var(--color-navy-900)]/40 p-4 sm:grid-cols-4">
      {items.map((s) => (
        <li key={s.label} className="text-center sm:text-start">
          <p className="text-2xl font-bold text-[var(--color-orange)]">{s.value}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-cream)]/70">
            {s.label}
          </p>
        </li>
      ))}
    </ul>
  );
}
