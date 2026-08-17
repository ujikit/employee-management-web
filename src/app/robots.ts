import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://employee-management-web-eight.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/landing', '/login'],
      disallow: ['/dashboard/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
