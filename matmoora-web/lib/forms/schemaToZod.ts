import { z, type ZodTypeAny } from 'zod';
import type { FormField, FormSchema } from './schema';

/**
 * Build a Zod schema from a normalized WP form schema (TECH_SPEC §13.3-§13.4).
 * The same function is used client-side (react-hook-form resolver) and
 * server-side (re-validation in the submission proxy — never trust the client).
 */
export function schemaToZod(schema: FormSchema): z.ZodObject<Record<string, ZodTypeAny>> {
  const shape: Record<string, ZodTypeAny> = {};
  for (const field of schema.fields) {
    shape[field.name] = fieldToZod(field);
  }
  return z.object(shape);
}

function fieldToZod(field: FormField): ZodTypeAny {
  switch (field.type) {
    case 'email':
    case 'url':
    case 'tel':
    case 'text':
    case 'textarea':
    case 'hidden':
      return stringField(field);
    case 'number':
      return numberField(field);
    case 'checkbox':
      return field.required ? z.literal(true) : z.boolean().optional();
    case 'select':
    case 'radio':
      return enumField(field);
  }
}

function stringField(field: FormField): ZodTypeAny {
  let base: ZodTypeAny =
    field.type === 'email'
      ? z.email({ message: 'Invalid email' })
      : field.type === 'url'
        ? z.url({ message: 'Invalid URL' })
        : z.string();

  // Apply string constraints. Each call returns a new schema; we widen back
  // to ZodTypeAny because z.email() / z.url() aren't ZodString in Zod v4.
  if (field.minLength !== undefined) base = (base as z.ZodString).min(field.minLength);
  if (field.maxLength !== undefined) base = (base as z.ZodString).max(field.maxLength);
  if (field.pattern) base = (base as z.ZodString).regex(new RegExp(field.pattern));

  if (field.required) {
    // Required also implies "non-empty" — covered by min() when minLength is set,
    // otherwise enforce min(1) here.
    return field.minLength !== undefined
      ? base
      : (base as z.ZodString).min(1, 'Required');
  }

  // Optional: accept undefined or an empty string (normalized to undefined),
  // otherwise the full validation applies.
  return base.optional().or(z.literal('').transform(() => undefined));
}

function numberField(field: FormField): ZodTypeAny {
  const n = z.coerce.number();
  return field.required ? n : z.union([n, z.literal('').transform(() => undefined)]).optional();
}

function enumField(field: FormField): ZodTypeAny {
  const values = (field.options ?? []).map((o) => o.value);
  if (values.length === 0) return stringField({ ...field, type: 'text' });
  const enumSchema = z.enum(values as [string, ...string[]]);
  return field.required ? enumSchema : enumSchema.optional();
}
