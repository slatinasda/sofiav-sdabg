import { TestBed } from '@angular/core/testing';

import { AppTitleService } from '../../app-title.service';
import { CHURCH_NAME } from '../church-info';
import { DEFAULT_OG_IMAGE, OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, SeoService } from './seo.service';

const SEO_TAG_SELECTOR = [
  'meta[name]',
  'meta[property]',
  'link[rel="canonical"]',
  'script[data-seo-json-ld]',
].join(',');

function metaContent(selector: string): string | null {
  return document.head.querySelector<HTMLMetaElement>(selector)?.content ?? null;
}

function canonicalHref(): string | null {
  return document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? null;
}

describe('SeoService', () => {
  let service: SeoService;

  beforeEach(() => {
    document.head.querySelectorAll(SEO_TAG_SELECTOR).forEach((element) => element.remove());

    TestBed.configureTestingModule({ providers: [AppTitleService] });
    service = TestBed.inject(SeoService);
  });

  describe('absoluteUrl', () => {
    it('prefixes relative paths with the site URL', () => {
      expect(service.absoluteUrl('blog/post')).toBe('http://localhost:4200/blog/post');
      expect(service.absoluteUrl('/blog/post')).toBe('http://localhost:4200/blog/post');
      expect(service.absoluteUrl('')).toBe('http://localhost:4200/');
    });

    it('keeps already absolute URLs unchanged', () => {
      expect(service.absoluteUrl('https://cdn.example.com/cover.jpg')).toBe(
        'https://cdn.example.com/cover.jpg',
      );
    });
  });

  describe('setPageMeta', () => {
    it('sets the title, canonical URL and default social image', () => {
      service.setPageMeta({
        title: 'Начало',
        description: 'Описание',
        path: '',
      });

      expect(document.title).toContain('Начало');
      expect(canonicalHref()).toBe(service.absoluteUrl(''));
      expect(metaContent('meta[name="robots"]')).toBe('index,follow');
      expect(metaContent('meta[property="og:image"]')).toBe(service.absoluteUrl(DEFAULT_OG_IMAGE));
      expect(metaContent('meta[property="og:image:width"]')).toBe(String(OG_IMAGE_WIDTH));
      expect(metaContent('meta[property="og:image:height"]')).toBe(String(OG_IMAGE_HEIGHT));
      expect(metaContent('meta[name="twitter:card"]')).toBe('summary_large_image');
    });

    it('does not assume generated dimensions for a custom cover image', () => {
      service.setPageMeta({
        title: 'Статия',
        description: 'Описание',
        path: 'blog/post',
        image: 'https://cdn.example.com/cover.jpg',
      });

      expect(metaContent('meta[property="og:image"]')).toBe('https://cdn.example.com/cover.jpg');
      expect(metaContent('meta[property="og:image:width"]')).toBeNull();
      expect(metaContent('meta[property="og:image:height"]')).toBeNull();
      expect(metaContent('meta[property="og:image:type"]')).toBe('image/jpeg');
    });

    it('removes the canonical link for pages that must not be indexed', () => {
      service.setPageMeta({
        title: 'Начало',
        description: 'Описание',
        path: '',
      });
      expect(canonicalHref()).not.toBeNull();

      service.setPageMeta({
        title: 'Страницата не е намерена',
        description: 'Описание',
        path: 'missing',
        noIndex: true,
      });

      expect(metaContent('meta[name="robots"]')).toBe('noindex,follow');
      expect(canonicalHref()).toBeNull();
    });
  });

  describe('setJsonLd', () => {
    it('renders a BlogPosting schema', () => {
      const url = 'http://localhost:4200/blog/post';

      service.setJsonLd({
        headline: 'Заглавие',
        description: 'Описание',
        url,
        datePublished: '2026-01-01',
        authorName: CHURCH_NAME,
      });

      const script = document.head.querySelector<HTMLScriptElement>('script[data-seo-json-ld]');
      const schema = JSON.parse(script?.textContent ?? '{}');

      expect(schema['@type']).toBe('BlogPosting');
      expect(schema['mainEntityOfPage']).toEqual({ '@type': 'WebPage', '@id': url });
      expect(schema['publisher'].name).toBe(CHURCH_NAME);
      expect(schema['inLanguage']).toBe('bg-BG');
    });

    it('removes the schema when null is passed', () => {
      service.setJsonLd({
        headline: 'Заглавие',
        description: 'Описание',
        url: 'http://localhost:4200/blog/post',
        datePublished: '2026-01-01',
        authorName: CHURCH_NAME,
      });

      service.setJsonLd(null);

      expect(document.head.querySelector('script[data-seo-json-ld]')).toBeNull();
    });
  });
});
