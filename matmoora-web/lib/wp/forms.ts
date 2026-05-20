import type { FormSchema } from '@/lib/forms/schema';

/**
 * Fetch a normalized form schema from WordPress (TECH_SPEC §13.2).
 *
 * The shape of the GraphQL query depends on the chosen forms provider —
 * Fluent Forms is the default (TECH_SPEC §21 Q3). Once a `GetFormSchema`
 * `.graphql` operation lives under `lib/wp/queries/` and codegen has run,
 * replace the stub with a call to `wpClient.request(GetFormSchemaDocument, ...)`
 * and a transformer that maps the provider's payload into `FormSchema`.
 */
export async function getFormSchema(id: string): Promise<FormSchema | null> {
  void id;
  return null;
}

/**
 * REST endpoint used by the submission proxy to forward validated data into
 * WordPress. Defaults to Fluent Forms; override via env if needed.
 */
export function formSubmitEndpoint(formId: string): string {
  const base = process.env.WP_BASE_URL;
  if (!base) throw new Error('WP_BASE_URL is not set');
  const path =
    process.env.WP_FORM_SUBMIT_PATH ?? '/wp-json/fluentform/v1/submit';
  return `${base.replace(/\/$/, '')}${path}?form_id=${encodeURIComponent(formId)}`;
}
