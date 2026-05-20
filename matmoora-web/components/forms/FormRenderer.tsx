'use client';

import { useMemo, useState } from 'react';
import { useForm, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schemaToZod } from '@/lib/forms/schemaToZod';
import type { FormField, FormSchema } from '@/lib/forms/schema';
import { TurnstileWidget } from '@/components/forms/TurnstileWidget';

interface Props {
  schema: FormSchema;
  action: string;
  turnstileSiteKey?: string;
}

/**
 * Server-rendered form data, client-rendered UI (TECH_SPEC §13.3). Schema
 * comes from WP via GraphQL; the renderer is provider-agnostic.
 *
 * Turnstile token is read from the form on submit when a site key is provided
 * — the widget itself is mounted by the host page so it can be locale-aware.
 */
export function FormRenderer({ schema, action, turnstileSiteKey }: Props) {
  const zodSchema = useMemo(() => schemaToZod(schema), [schema]);
  const form = useForm<FieldValues>({ resolver: zodResolver(zodSchema) });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const onSubmit = async (data: FieldValues) => {
    setStatus('submitting');
    const tokenInput = document.querySelector<HTMLInputElement>(
      'input[name="cf-turnstile-response"]',
    );
    const res = await fetch(action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data,
        turnstileToken: tokenInput?.value,
      }),
    });
    setStatus(res.ok ? 'success' : 'error');
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {schema.fields.map((field) => (
        <Field key={field.name} field={field} form={form} />
      ))}

      {turnstileSiteKey ? (
        <TurnstileWidget siteKey={turnstileSiteKey} action={`form-${schema.id}`} />
      ) : null}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {status === 'submitting' ? '…' : (schema.submitLabel ?? 'Submit')}
      </button>

      {status === 'success' ? (
        <p className="text-sm text-green-700">Thanks — submitted.</p>
      ) : null}
      {status === 'error' ? (
        <p className="text-sm text-red-700">Something went wrong. Please try again.</p>
      ) : null}
    </form>
  );
}

function Field({
  field,
  form,
}: {
  field: FormField;
  form: ReturnType<typeof useForm<FieldValues>>;
}) {
  const error = form.formState.errors[field.name]?.message as string | undefined;
  const id = `field-${field.name}`;
  const commonProps = {
    id,
    'aria-invalid': error ? true : undefined,
    placeholder: field.placeholder,
    ...form.register(field.name),
  };

  if (field.type === 'hidden') return <input type="hidden" {...commonProps} />;

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {field.label}
        {field.required ? <span aria-hidden> *</span> : null}
      </label>

      {field.type === 'textarea' ? (
        <textarea
          {...commonProps}
          rows={5}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
        />
      ) : field.type === 'select' ? (
        <select
          {...commonProps}
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        >
          <option value="">—</option>
          {(field.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : field.type === 'checkbox' ? (
        <input type="checkbox" {...commonProps} />
      ) : field.type === 'radio' ? (
        <div className="space-y-1">
          {(field.options ?? []).map((o) => (
            <label key={o.value} className="flex items-center gap-2">
              <input type="radio" value={o.value} {...form.register(field.name)} />
              <span className="text-sm">{o.label}</span>
            </label>
          ))}
        </div>
      ) : (
        <input
          type={field.type === 'number' ? 'number' : field.type}
          {...commonProps}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
        />
      )}

      {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
