export function SectionMarker({ n }: { n: number }) {
  return (
    <div className="relative inline-flex items-center gap-3">
      <span aria-hidden className="text-4xl font-black tabular-nums text-[var(--color-navy)]/25 md:text-5xl">
        {String(n).padStart(2, '0')}
      </span>
      <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--color-orange)]" />
    </div>
  );
}
