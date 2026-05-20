'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { TurnstileWidget } from '@/components/forms/TurnstileWidget';

interface Props {
  postId: number;
  parentId?: number;
  turnstileSiteKey?: string;
}

/**
 * Comment submission form (TECH_SPEC §14.2). Posts to /api/comments/submit;
 * the proxy verifies Turnstile + forwards to WP. New comments default to
 * 'unapproved' and wait for moderation.
 */
export function CommentForm({ postId, parentId, turnstileSiteKey }: Props) {
  const t = useTranslations('Comments');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    const formData = new FormData(e.currentTarget);
    const payload = {
      post_id: postId,
      parent_id: parentId,
      author_name: String(formData.get('author_name') ?? ''),
      author_email: String(formData.get('author_email') ?? ''),
      content: String(formData.get('content') ?? ''),
      turnstileToken: String(formData.get('cf-turnstile-response') ?? ''),
    };
    const res = await fetch('/api/comments/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setStatus(res.ok ? 'success' : 'error');
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <div>
        <label htmlFor="c-name" className="mb-1 block text-sm font-medium">
          {t('name')}
        </label>
        <input
          id="c-name"
          name="author_name"
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="c-email" className="mb-1 block text-sm font-medium">
          {t('email')}
        </label>
        <input
          id="c-email"
          name="author_email"
          type="email"
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
        <p className="mt-1 text-xs text-neutral-500">{t('emailNote')}</p>
      </div>
      <div>
        <label htmlFor="c-content" className="mb-1 block text-sm font-medium">
          {t('comment')}
        </label>
        <textarea
          id="c-content"
          name="content"
          required
          rows={4}
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>

      {turnstileSiteKey ? (
        <TurnstileWidget siteKey={turnstileSiteKey} action="comment" />
      ) : null}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {status === 'submitting' ? '…' : t('submit')}
      </button>

      {status === 'success' ? (
        <p className="text-sm text-green-700">{t('queued')}</p>
      ) : null}
      {status === 'error' ? (
        <p className="text-sm text-red-700">{t('failed')}</p>
      ) : null}
    </form>
  );
}
