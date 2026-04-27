import fs from 'node:fs';
import path from 'node:path';

const siteUrl = String(process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://hirexo.com').replace(/\/$/, '');
const today = new Date().toISOString();

const publicRoutes = [
  '/',
  '/jobs',
  '/blogs',
  '/about',
  '/contact',
  '/login',
  '/register/candidate',
  '/register/employer'
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '/' ? '1.0' : '0.7'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

const targetPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
fs.writeFileSync(targetPath, xml, 'utf8');
console.log(`sitemap generated: ${targetPath}`);
