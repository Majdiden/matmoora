'use client';

import Script from 'next/script';

/**
 * Mounts the Cloudflare Turnstile script + widget. The token lands as a hidden
 * input named `cf-turnstile-response` inside the closest form; the submission
 * proxy verifies it server-side (TECH_SPEC §13.4, §14.3).
 */
export function TurnstileWidget({
  siteKey,
  action,
}: {
  siteKey: string;
  action?: string;
}) {
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        async
        defer
      />
      <div className="cf-turnstile" data-sitekey={siteKey} data-action={action} />
    </>
  );
}
