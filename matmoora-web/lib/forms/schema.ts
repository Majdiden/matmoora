/**
 * Provider-agnostic WordPress form schema (TECH_SPEC §13).
 *
 * Editors author forms in WP (Fluent Forms is the default — TECH_SPEC §21 Q3).
 * The form's GraphQL output is normalized into this shape before reaching the
 * renderer, so swapping providers (or supporting both) is a transformer change,
 * not a renderer change.
 */

export type FieldType =
  | 'text'
  | 'email'
  | 'url'
  | 'tel'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'select'
  | 'radio'
  | 'hidden';

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormField {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  options?: FormFieldOption[];
  default?: string;
}

export interface FormSchema {
  id: string;
  title?: string;
  submitLabel?: string;
  fields: FormField[];
}
