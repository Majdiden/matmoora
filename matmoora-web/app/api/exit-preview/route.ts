import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

/** Leaves draft mode and returns to the public site (TECH_SPEC §8). */
export async function GET(req: NextRequest) {
  (await draftMode()).disable();
  const locale = new URL(req.url).searchParams.get('locale') ?? 'ar';
  redirect(`/${locale}`);
}
