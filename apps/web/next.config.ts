import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname),
  allowedDevOrigins: ['192.168.0.101', 'localhost', '127.0.0.1'],
};

export default withNextIntl(nextConfig);
