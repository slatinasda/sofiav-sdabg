#!/usr/bin/env node

/**
 * Reads markdown posts from a content repo checkout and emits:
 *   - posts-index.json: lightweight per-post metadata, no HTML body (keeps the list/search bundle small)
 *   - posts/<slug>.json: full rendered post, loaded on demand per detail page
 *   - posts-fulltext.json: one combined { slug: plainText } map for opt-in full-text search
 *   - public/sitemap.xml, rss.xml, robots.txt, llms.txt, and every image next to a post's
 *     index.md (cover included), copied over so markdown bodies can reference them too
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked, Renderer } from 'marked';

// Keep the fallback in sync with src/environments/environment.prod.ts.
const SITE_URL = process.env.SITE_URL || 'https://sofia-v.sdabg.net';
const DEFAULT_AUTHOR = 'Църква София "В" Слатина';
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const COVER_MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

const rootDir = process.cwd();
const contentDir = path.resolve(rootDir, process.env.BLOG_CONTENT_PATH || './blog-content/posts');
const assetsOutDir = path.resolve(rootDir, 'src/assets/blog/generated');
const postsOutDir = path.resolve(assetsOutDir, 'posts');
const publicDir = path.resolve(rootDir, 'public');
const publicBlogDir = path.resolve(publicDir, 'blog');

const STATIC_ROUTES = ['', 'beliefs', 'songbook', 'video-archive', 'sabbath-school'];

/**
 * Rewrites relative markdown image paths to their public URL under the post's slug.
 */
function createPostRenderer(slug) {
  const renderer = new Renderer();
  const defaultImage = renderer.image.bind(renderer);
  renderer.image = (token) => {
    if (/^([a-z]+:)?\/\//i.test(token.href) || token.href.startsWith('/')) {
      return defaultImage(token);
    }
    return defaultImage({ ...token, href: `/blog/${slug}/${token.href}` });
  };
  return renderer;
}

function fail(message) {
  console.error(`[build-blog-content] ${message}`);
  process.exit(1);
}

/**
 * Copies every image next to index.md (cover included) so markdown can reference any by bare filename, not just `cover`.
 */
function copyPostImages(postDir, destDir) {
  const files = fs.readdirSync(postDir, { withFileTypes: true }).filter((entry) => entry.isFile());

  for (const file of files) {
    if (!(path.extname(file.name).toLowerCase() in COVER_MIME_TYPES)) {
      continue;
    }

    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(path.join(postDir, file.name), path.join(destDir, file.name));
  }
}

/**
 * Recurses to find post folders (containing index.md) at any depth, so content can be
 * organized as posts/<year>/<month>/<slug>/ - the slug is always the leaf folder name.
 */
function collectPostDirs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  const result = [];

  for (const entry of entries) {
    const subDir = path.join(dir, entry.name);
    if (fs.existsSync(path.join(subDir, 'index.md'))) {
      result.push({ slug: entry.name, postDir: subDir });
    } else {
      result.push(...collectPostDirs(subDir));
    }
  }

  return result;
}

function readPosts() {
  if (!fs.existsSync(contentDir)) {
    console.warn(
      `[build-blog-content] Content dir not found at ${contentDir} - emitting an empty blog (set BLOG_CONTENT_PATH to override).`,
    );
    return [];
  }

  const postDirs = collectPostDirs(contentDir);
  const seenSlugs = new Set();
  const posts = [];

  for (const { slug, postDir } of postDirs) {
    if (!SLUG_PATTERN.test(slug)) {
      fail(`Invalid slug "${slug}" - post folder names must be kebab-case (e.g. "my-first-post").`);
    }
    if (seenSlugs.has(slug)) {
      fail(`Duplicate slug "${slug}" (found at ${postDir}).`);
    }
    seenSlugs.add(slug);

    const indexPath = path.join(postDir, 'index.md');
    const { data: frontmatter, content: markdown } = matter(fs.readFileSync(indexPath, 'utf-8'));

    if (frontmatter.draft) {
      continue;
    }
    if (!frontmatter.title) {
      fail(`Post "${slug}" is missing required "title" frontmatter.`);
    }
    if (!frontmatter.description) {
      fail(`Post "${slug}" is missing required "description" frontmatter.`);
    }
    if (!frontmatter.date) {
      fail(`Post "${slug}" is missing required "date" frontmatter.`);
    }
    if (!frontmatter.category) {
      fail(`Post "${slug}" is missing required "category" frontmatter.`);
    }

    copyPostImages(postDir, path.join(publicBlogDir, slug));

    let cover;
    if (frontmatter.cover) {
      if (!fs.existsSync(path.join(postDir, frontmatter.cover))) {
        fail(`Post "${slug}" references cover "${frontmatter.cover}" which does not exist.`);
      }
      cover = `/blog/${slug}/${frontmatter.cover}`;
    }

    const contentHtml = marked.parse(markdown, { renderer: createPostRenderer(slug) });

    posts.push({
      slug,
      title: frontmatter.title,
      description: frontmatter.description,
      date: new Date(frontmatter.date).toISOString(),
      updated: frontmatter.updated ? new Date(frontmatter.updated).toISOString() : undefined,
      category: frontmatter.category,
      author: frontmatter.author || DEFAULT_AUTHOR,
      cover,
      contentHtml,
    });
  }

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return posts;
}

function writePostsJson(posts) {
  fs.mkdirSync(assetsOutDir, { recursive: true });
  fs.mkdirSync(postsOutDir, { recursive: true });

  const index = posts.map(({ contentHtml, ...summary }) => summary);
  fs.writeFileSync(path.join(assetsOutDir, 'posts-index.json'), JSON.stringify(index, null, 2));

  for (const post of posts) {
    fs.writeFileSync(path.join(postsOutDir, `${post.slug}.json`), JSON.stringify(post, null, 2));
  }

  // Clean up detail files for posts that no longer exist (renamed/removed/unpublished).
  const currentSlugs = new Set(posts.map((p) => p.slug));
  for (const file of fs.readdirSync(postsOutDir)) {
    if (!currentSlugs.has(file.replace(/\.json$/, ''))) {
      fs.unlinkSync(path.join(postsOutDir, file));
    }
  }

  // Keeps esbuild's per-slug import() glob non-empty (avoids its "no files matched" warning).
  if (posts.length === 0) {
    fs.writeFileSync(path.join(postsOutDir, '.empty.json'), '{}');
  }

  const stripHtml = (html) => html.replace(/<[^>]*>/g, ' ');

  const fullText = Object.fromEntries(
    posts.map((post) => [post.slug, stripHtml(post.contentHtml).toLowerCase()]),
  );

  fs.writeFileSync(path.join(assetsOutDir, 'posts-fulltext.json'), JSON.stringify(fullText));
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function writeSitemap(posts) {
  const categories = [...new Set(posts.map((p) => p.category))];

  const urls = [
    ...STATIC_ROUTES.map((route) => ({ loc: `${SITE_URL}/${route}`, lastmod: undefined })),
    { loc: `${SITE_URL}/blog`, lastmod: posts[0]?.date },
    ...categories.map((c) => ({ loc: `${SITE_URL}/blog/category/${c}`, lastmod: posts[0]?.date })),
    ...posts.map((p) => ({ loc: `${SITE_URL}/blog/${p.slug}`, lastmod: p.updated || p.date })),
  ];

  const body = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${escapeXml(u.loc.replace(/\/$/, '') || SITE_URL)}</loc>${
          u.lastmod ? `\n    <lastmod>${u.lastmod.slice(0, 10)}</lastmod>` : ''
        }\n  </url>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
}

function coverEnclosure(post) {
  if (!post.cover) {
    return '';
  }

  const coverPath = path.join(publicDir, post.cover);
  const mimeType = COVER_MIME_TYPES[path.extname(coverPath).toLowerCase()];
  if (!mimeType || !fs.existsSync(coverPath)) {
    return '';
  }

  const url = `${SITE_URL}${post.cover}`;
  const length = fs.statSync(coverPath).size;
  return `\n      <enclosure url="${escapeXml(url)}" length="${length}" type="${mimeType}" />
      <media:content url="${escapeXml(url)}" medium="image" type="${mimeType}" />`;
}

function writeRss(posts) {
  const items = posts
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${SITE_URL}/blog/${p.slug}</link>
      <guid>${SITE_URL}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <category>${escapeXml(p.category)}</category>
      <description>${escapeXml(p.description)}</description>${coverEnclosure(p)}
    </item>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Блог | Църква София В Слатина</title>
    <link>${SITE_URL}/blog</link>
    <description>Последни новини и статии</description>
    <language>bg-bg</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, 'rss.xml'), xml);
}

function writeRobotsTxt() {
  const aiCrawlers = [
    'GPTBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-Web',
    'anthropic-ai',
    'CCBot',
    'Google-Extended',
    'PerplexityBot',
  ];

  const content = [
    'User-agent: *',
    'Allow: /',
    '',
    ...aiCrawlers.flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', '']),
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');

  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), content);
}

function writeLlmsTxt(posts) {
  const categories = [...new Set(posts.map((p) => p.category))];

  const postLines = posts.map(
    (p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.description}`,
  );

  const content = `# Църква на Адвентистите от Седмия Ден - София "В" Слатина

> Официален сайт на Църквата на Адвентистите от Седмия Ден, София "В" Слатина.
> Съдържа информация за богослуженията, основните вярвания, съботно училище, видео архив
> с проповеди, църковна песнарка и блог с новини от живота на общността.

## Основни раздели

- [Начало](${SITE_URL}/): Информация за богослуженията, живо излъчване и контакти.
- [Вярвания](${SITE_URL}/beliefs): Основните вярвания на Адвентната църква по теми - Бог, човечеството, спасение, църквата, християнски живот, възстановяване.
- [Съботно училище](${SITE_URL}/sabbath-school): Тримесечни уроци за съботно училище.
- [Видео архив](${SITE_URL}/video-archive): Записи от проповеди и богослужения.
- [Песнарка](${SITE_URL}/songbook): Църковна песнарка с текстове и аудио.
- [Блог](${SITE_URL}/blog): Новини, статии и свидетелства от живота на църковната общност.${
    categories.length
      ? `\n\n## Категории в блога\n\n${categories.map((c) => `- [${c}](${SITE_URL}/blog/category/${c})`).join('\n')}`
      : ''
  }

## Блог публикации

${postLines.length ? postLines.join('\n') : '(все още няма публикувани статии)'}

## Допълнителни ресурси

- [XML карта на сайта](${SITE_URL}/sitemap.xml)
- [RSS фийд на блога](${SITE_URL}/rss.xml)
`;

  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, 'llms.txt'), content);
}

function main() {
  const posts = readPosts();
  writePostsJson(posts);
  writeSitemap(posts);
  writeRss(posts);
  writeRobotsTxt();
  writeLlmsTxt(posts);
  console.log(`[build-blog-content] Wrote ${posts.length} post(s).`);
}

main()
