import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://event-planner-liard-beta.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/budget',
          '/timeline',
          '/vendors',
          '/guests',
          '/chat',
          '/ideas',
          '/plan',
          '/settings',
          '/create',
          '/auth/reset-password',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

