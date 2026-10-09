import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.101', 'localhost', '127.0.0.1'],
};

export default withNextIntl(nextConfig);
