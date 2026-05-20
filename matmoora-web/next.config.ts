import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    // Self-hosted WordPress media subdomain — see TECH_SPEC §11.3.
    remotePatterns: [{ protocol: 'https', hostname: 'cms.matmoora.org' }],
    formats: ['image/avif', 'image/webp'],
  },
};

export default withNextIntl(nextConfig);
