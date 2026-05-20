/**
 * Inject a JSON-LD blob for schema.org structured data (TECH_SPEC §10.4).
 * Pass `data` typed as the relevant schema.org shape (Organization,
 * ScholarlyArticle, CreativeWork, BreadcrumbList, ...).
 */
export function StructuredData<T extends Record<string, unknown>>({
  data,
}: {
  data: T;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ '@context': 'https://schema.org', ...data }),
      }}
    />
  );
}
