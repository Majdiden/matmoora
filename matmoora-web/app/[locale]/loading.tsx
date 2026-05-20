/**
 * Streaming fallback for any route under [locale]. Renders instantly while
 * the page's data fetches resolve. Keep it cheap — no client JS, just CSS.
 */
export default function LocaleLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24" aria-busy="true" aria-live="polite">
      <div className="h-8 w-2/3 animate-pulse rounded bg-neutral-200" />
      <div className="mt-4 space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-4/6 animate-pulse rounded bg-neutral-200" />
      </div>
    </div>
  );
}
