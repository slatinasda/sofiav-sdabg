#!/usr/bin/env node

/**
 * Renders the static social sharing cards in public/seo/ from scripts/seo/template.html.
 *
 * Outputs 1200x630 JPEG files, the safest format for Open Graph previews.
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import {
  CHURCH_CITY,
  CHURCH_DISTRICT,
  CHURCH_FAMILY_NAME,
  CHURCH_PLACE_NAME,
} from './church-info.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'public/seo');
const renderedDir = path.join(os.tmpdir(), 'sofiav-seo-images');
const templatePath = path.join(__dirname, 'seo/template.html');
const photosDir = path.join(__dirname, 'seo/photos');
const markPath = path.join(rootDir, 'src/assets/img/logos/logo-sda-square.svg');

const GENERATED_IMAGE_PATTERN = /^og-.*\.(jpe?g|png|webp)$/i;
const UNREPLACED_TOKEN_PATTERN = /\{\{\s*[A-Z_]+\s*\}\}/;
const SKIP_EXISTING = process.argv.includes('--if-missing');

const fileUrl = (filePath) => pathToFileURL(filePath).href;

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

const icons = {
  bookOpen: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 7v14"/>
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>
    </svg>`,
  bookMarked: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>
      <path d="m9 9 2 2 4-4"/>
    </svg>`,
  music: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M9 18V5l12-2v13"/>
      <circle cx="6" cy="18" r="3"/>
      <circle cx="18" cy="16" r="3"/>
    </svg>`,
  play: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="10 8 16 12 10 16"/>
    </svg>`,
  newspaper: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
      <path d="M18 14h-8"/>
      <path d="M15 18h-5"/>
      <path d="M10 6h8v4h-8V6Z"/>
    </svg>`,
};

const cards = [
  {
    file: 'og-default',
    photo: 'open-bible.jpg',
    photoPosition: '58% center',
    icon: '',
    kicker: 'Добре дошли',
    title: CHURCH_PLACE_NAME,
    subtitle: 'Опознайте Исус заедно с нас.',
    footer: `${CHURCH_CITY} · ${CHURCH_DISTRICT}`,
    titleSize: '64px',
    subtitleSize: '30px',
    accent: '#55a79a',
  },
  {
    file: 'og-beliefs',
    photo: 'bible-reading.jpg',
    photoPosition: '52% center',
    icon: icons.bookOpen,
    kicker: 'Библейски учения',
    title: 'Вярвания',
    subtitle: '28 основни учения, подредени в 6 теми: от Бог и човека до последните събития.',
    footer: '28 учения · 6 теми',
    titleSize: '92px',
    subtitleSize: '26px',
    accent: '#a3d3cb',
  },
  {
    file: 'og-songbook',
    photo: 'acoustic-guitar.jpg',
    photoPosition: '58% center',
    icon: icons.music,
    kicker: 'Църковна песнарка',
    title: 'Песни',
    subtitle: 'Химни, текстове, ноти и музика за богослужение и лична употреба.',
    footer: 'Текстове · Ноти · Аудио',
    titleSize: '92px',
    subtitleSize: '27px',
    accent: '#7cbfb4',
  },
  {
    file: 'og-sabbath-school',
    photo: 'study-books.jpg',
    photoPosition: '50% center',
    icon: icons.bookMarked,
    kicker: 'Изучаване на Библията',
    title: 'Съботен урок',
    subtitle: 'Тримесечни уроци за групови дискусии. Изучавайте Библията заедно с нас.',
    footer: 'Нов урок всяко тримесечие',
    titleSize: '82px',
    subtitleSize: '26px',
    accent: '#55a79a',
  },
  {
    file: 'og-sermons',
    photo: 'worship-hands.jpg',
    photoPosition: '55% center',
    icon: icons.play,
    kicker: 'Видео архив',
    title: 'Проповеди',
    subtitle: 'Записи от богослуженията и проповедите в нашата църква.',
    footer: 'Гледайте на живо и в запис',
    titleSize: '92px',
    subtitleSize: '27px',
    accent: '#7cbfb4',
  },
  {
    file: 'og-blog',
    photo: 'friends-sunset.jpg',
    photoPosition: '50% center',
    icon: icons.newspaper,
    kicker: 'Новини и статии',
    title: 'Блог',
    subtitle: 'Истории за вярата, църковния живот и нашата общност.',
    footer: 'Статии · Свидетелства · Новини',
    titleSize: '92px',
    subtitleSize: '27px',
    accent: '#a3d3cb',
  },
];

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

function renderTemplate(template, card) {
  const values = {
    MARK: fileUrl(markPath),
    PHOTO: fileUrl(path.join(photosDir, card.photo)),
    BRAND_NAME: escapeHtml(CHURCH_FAMILY_NAME),
    BRAND_PLACE: escapeHtml(CHURCH_PLACE_NAME),
    FONT_CYRILLIC: fileUrl(path.join(__dirname, 'seo/fonts/open-sans-cyrillic.woff2')),
    FONT_LATIN_EXT: fileUrl(path.join(__dirname, 'seo/fonts/open-sans-latin-ext.woff2')),
    FONT_LATIN: fileUrl(path.join(__dirname, 'seo/fonts/open-sans-latin.woff2')),
    PHOTO_POSITION: card.photoPosition,
    ICON: card.icon,
    KICKER: escapeHtml(card.kicker),
    TITLE: escapeHtml(card.title),
    SUBTITLE: escapeHtml(card.subtitle),
    FOOTER: escapeHtml(card.footer),
    TITLE_SIZE: card.titleSize,
    SUBTITLE_SIZE: card.subtitleSize,
    ACCENT: card.accent,
  };

  return Object.entries(values).reduce(
    (html, [key, value]) =>
      html.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), () => value),
    template,
  );
}

async function cleanOutputDir() {
  const expectedFiles = new Set(cards.map((card) => `${card.file}.jpg`));

  for (const file of await fs.readdir(outputDir)) {
    if (GENERATED_IMAGE_PATTERN.test(file) && !expectedFiles.has(file)) {
      await fs.rm(path.join(outputDir, file), { force: true });
    }
  }
}

async function filterMissingCards() {
  const missingCards = [];

  for (const card of cards) {
    const jpgPath = path.join(outputDir, `${card.file}.jpg`);

    if (!(await fileExists(jpgPath))) {
      missingCards.push(card);
    }
  }

  return missingCards;
}

async function renderCard(page, template, card) {
  const html = renderTemplate(template, card);

  if (UNREPLACED_TOKEN_PATTERN.test(html)) {
    throw new Error(`Unreplaced template token in ${card.file}.html`);
  }

  const htmlPath = path.join(renderedDir, `${card.file}.html`);
  const jpgPath = path.join(outputDir, `${card.file}.jpg`);

  await fs.writeFile(htmlPath, html);
  await page.goto(fileUrl(htmlPath), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }),
  );
  await page.screenshot({ path: jpgPath, type: 'jpeg', quality: 90 });

  return jpgPath;
}

async function main() {
  const template = await fs.readFile(templatePath, 'utf8');

  await fs.rm(renderedDir, { recursive: true, force: true });
  await fs.mkdir(renderedDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });
  await cleanOutputDir();

  const pendingCards = SKIP_EXISTING ? await filterMissingCards() : cards;

  if (pendingCards.length === 0) {
    console.log('[seo] Social images are up to date.');
    return;
  }

  const browser = await chromium.launch({
    args: ['--allow-file-access-from-files', '--font-render-hinting=none'],
  });

  try {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
    });

    for (const card of pendingCards) {
      const jpgPath = await renderCard(page, template, card);
      console.log(`[seo] ${path.relative(rootDir, jpgPath)}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('[seo] Failed to render social images:', error);
  console.error('[seo] If Chromium is missing, run: npx playwright install chromium');
  process.exitCode = 1;
});
