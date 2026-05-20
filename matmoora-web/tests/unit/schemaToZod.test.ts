import { describe, it, expect } from 'vitest';
import { schemaToZod } from '@/lib/forms/schemaToZod';
import type { FormSchema } from '@/lib/forms/schema';

const schema: FormSchema = {
  id: 'contact',
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true, minLength: 2 },
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'topic', type: 'select', label: 'Topic', options: [
      { value: 'general', label: 'General' },
      { value: 'press', label: 'Press' },
    ] },
    { name: 'consent', type: 'checkbox', label: 'Consent', required: true },
    { name: 'note', type: 'textarea', label: 'Note', maxLength: 500 },
  ],
};

describe('schemaToZod', () => {
  it('accepts a valid payload', () => {
    const result = schemaToZod(schema).safeParse({
      name: 'Maya',
      email: 'maya@example.com',
      topic: 'general',
      consent: true,
      note: 'Hi',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = schemaToZod(schema).safeParse({
      name: 'Maya',
      email: 'not-an-email',
      consent: true,
    });
    expect(result.success).toBe(false);
  });

  it('requires fields marked required', () => {
    const result = schemaToZod(schema).safeParse({
      name: '',
      email: 'maya@example.com',
      consent: true,
    });
    expect(result.success).toBe(false);
  });

  it('treats unchecked required checkbox as invalid', () => {
    const result = schemaToZod(schema).safeParse({
      name: 'Maya',
      email: 'maya@example.com',
      consent: false,
    });
    expect(result.success).toBe(false);
  });
});
