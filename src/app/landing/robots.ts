import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/dashboard/'],
    },
    sitemap: 'https://staffsync-example.com/sitemap.xml',
  }
}
