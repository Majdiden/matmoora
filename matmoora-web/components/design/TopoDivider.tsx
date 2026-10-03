export function TopoDivider() {
  return (
    <div aria-hidden className="my-4 flex items-center justify-center py-2 md:my-6">
      <svg width="24" height="80" viewBox="0 0 24 80" fill="none">
        <line x1="12" y1="0" x2="12" y2="30" stroke="var(--color-orange)" strokeWidth="1.2" strokeDasharray="3 4" />
        <path d="M6 38 C 8 32, 18 32, 18 40 C 18 46, 8 48, 6 42 Z" stroke="var(--color-cream)" strokeWidth="1" strokeDasharray="1.5 2" fill="none" opacity="0.7" />
        <circle cx="12" cy="41" r="1.6" fill="var(--color-orange)" />
        <line x1="12" y1="52" x2="12" y2="80" stroke="var(--color-orange)" strokeWidth="1.2" strokeDasharray="3 4" />
      </svg>
    </div>
  );
}
