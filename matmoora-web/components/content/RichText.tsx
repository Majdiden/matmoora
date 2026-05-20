import DOMPurify from 'isomorphic-dompurify';

/**
 * Render HTML from WordPress safely (TECH_SPEC §17.1). The body of a post
 * comes through WP's own sanitizer, but we re-clean on the way out — anything
 * that slipped past kses or that comes from less-trusted fields (comments,
 * form values rendered into the page) is also covered.
 */
export function RichText({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const clean = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
  });
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />
  );
}
