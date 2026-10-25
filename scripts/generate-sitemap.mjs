import fs from 'node:fs';
import { writeFile } from 'node:fs/promises';

const SITE = 'https://newworldmanga.github.io';
const readJson = (file) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return {}; throw error; }
};
const content = readJson('data/content.json');
const manual = readJson('data/manual-chapters.json');
const upcoming = readJson('data/upcoming-chapters.json');
const extra = readJson('data/extra-chapters.json');

const urls = new Map();
const add = (loc, lastmod = '') => urls.set(loc, lastmod ? new Date(lastmod).toISOString().slice(0, 10) : '');
for (const page of [
  '/', '/latest-chapters.html', '/manga.html', '/country.html',
  '/japan-blog.html', '/france-blog.html', '/blog.html'
]) add(SITE + page);

for (const country of ['JP', 'US', 'FR', 'BR']) add(SITE + '/country.html?country=' + country);
for (const manga of (content.mangas || [])) {
  const slug = manga.slug || manga.id;
  if (slug) add(SITE + '/manga.html?slug=' + encodeURIComponent(slug), manga.updatedAt || manga.updated_at);
}
const chapters = new Map();
for (const source of [content, manual, upcoming, extra]) {
  for (const chapter of (source.chapters || [])) {
    if (chapter && chapter.slug) chapters.set(String(chapter.slug), chapter);
  }
}
for (const chapter of chapters.values()) {
  add(SITE + '/chapter.html?slug=' + encodeURIComponent(chapter.slug),
    chapter.updatedAt || chapter.updated_at || chapter.createdAt || chapter.created_at);
}
const escapeXml = value => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const body = [...urls].map(([loc, lastmod]) =>
  '  <url><loc>' + escapeXml(loc) + '</loc>' +
  (lastmod ? '<lastmod>' + lastmod + '</lastmod>' : '') + '</url>'
).join('\n');
await writeFile('sitemap.xml',
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  body + '\n</urlset>\n');
console.log('Generated sitemap with ' + urls.size + ' URLs.');
