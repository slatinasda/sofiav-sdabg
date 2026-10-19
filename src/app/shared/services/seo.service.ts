import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { AppTitleService } from '../../app-title.service';
import { CHURCH_NAME, CHURCH_SHORT_NAME } from '../church-info';
import { environment } from '../../../environments/environment';

export interface BlogPostingSchema {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  authorName: string;
  section?: string;
  keywords?: string[];
}

export interface PageMeta {
  title: string;
  socialTitle?: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  keywords?: string[];
  noIndex?: boolean;
}

interface MetaSelector {
  name?: string;
  property?: string;
}

interface PageMetaContext {
  url: string;
  socialTitle: string;
  image: SocialImage;
}

interface SocialImage {
  url: string;
  alt: string;
  mimeType: string;
  width?: number;
  height?: number;
}

export const OG_IMAGES = {
  default: 'seo/og-default.jpg',
  beliefs: 'seo/og-beliefs.jpg',
  blog: 'seo/og-blog.jpg',
  sabbathSchool: 'seo/og-sabbath-school.jpg',
  sermons: 'seo/og-sermons.jpg',
  songbook: 'seo/og-songbook.jpg',
} as const;

export const DEFAULT_OG_IMAGE = OG_IMAGES.default;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT = CHURCH_NAME;
export const X_HANDLE = '@SlatinaChurch';

const GENERATED_IMAGE_PREFIX = 'seo/';
const ARTICLE_TAG_ATTR = 'data-seo-article-tag';
const JSON_LD_ATTR = 'data-seo-json-ld';
const THEME_COLOR = '#55a79a';

const IMAGE_MIME_TYPES: Record<string, string> = {
  avif: 'image/avif',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp',
};

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  constructor(
    private appTitleService: AppTitleService,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  absoluteUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    const baseUrl = environment.siteUrl.replace(/\/+$/, '');
    return `${baseUrl}/${path.replace(/^\/+/, '')}`;
  }

  setPageMeta(pageMeta: PageMeta): void {
    const context: PageMetaContext = {
      url: this.absoluteUrl(pageMeta.path),
      socialTitle: pageMeta.socialTitle ?? pageMeta.title,
      image: this.resolveSocialImage(pageMeta),
    };

    this.appTitleService.setTitle(pageMeta.title);
    this.setDocumentMeta(pageMeta);
    this.setOpenGraphMeta(pageMeta, context);
    this.setTwitterMeta(pageMeta, context);
    this.setArticleMeta(pageMeta);
    this.setKeywords(pageMeta.keywords ?? []);

    if (pageMeta.noIndex) {
      this.removeCanonicalUrl();
      return;
    }

    this.setCanonicalUrl(context.url);
  }

  setJsonLd(schema: BlogPostingSchema | null): void {
    this.removeJsonLd();

    if (!schema) {
      return;
    }

    this.appendJsonLd(this.buildBlogPostingSchema(schema));
  }

  private setDocumentMeta(pageMeta: PageMeta): void {
    this.setMeta({ name: 'description' }, pageMeta.description);
    this.setMeta({ name: 'robots' }, pageMeta.noIndex ? 'noindex,follow' : 'index,follow');
    this.setMeta({ name: 'theme-color' }, THEME_COLOR);
  }

  private setOpenGraphMeta(pageMeta: PageMeta, context: PageMetaContext): void {
    this.setMeta({ property: 'og:locale' }, 'bg_BG');
    this.setMeta({ property: 'og:type' }, pageMeta.type ?? 'website');
    this.setMeta({ property: 'og:site_name' }, CHURCH_SHORT_NAME);
    this.setMeta({ property: 'og:title' }, context.socialTitle);
    this.setMeta({ property: 'og:description' }, pageMeta.description);
    this.setMeta({ property: 'og:url' }, context.url);
    this.setMeta({ property: 'og:image' }, context.image.url);
    this.setMeta({ property: 'og:image:secure_url' }, context.image.url);
    this.setMeta({ property: 'og:image:type' }, context.image.mimeType);
    this.setMeta({ property: 'og:image:alt' }, context.image.alt);
    this.setMeta({ property: 'og:image:width' }, context.image.width?.toString());
    this.setMeta({ property: 'og:image:height' }, context.image.height?.toString());
  }

  private setTwitterMeta(pageMeta: PageMeta, context: PageMetaContext): void {
    this.setMeta({ name: 'twitter:card' }, 'summary_large_image');
    this.setMeta({ name: 'twitter:site' }, X_HANDLE);
    this.setMeta({ name: 'twitter:creator' }, X_HANDLE);
    this.setMeta({ name: 'twitter:title' }, context.socialTitle);
    this.setMeta({ name: 'twitter:description' }, pageMeta.description);
    this.setMeta({ name: 'twitter:image' }, context.image.url);
    this.setMeta({ name: 'twitter:image:alt' }, context.image.alt);
  }

  private setArticleMeta(pageMeta: PageMeta): void {
    this.setMeta({ property: 'article:published_time' }, pageMeta.publishedTime);
    this.setMeta({ property: 'article:modified_time' }, pageMeta.modifiedTime);
    this.setArticleTags(pageMeta.tags ?? []);
  }

  private setKeywords(keywords: string[]): void {
    this.setMeta({ name: 'keywords' }, keywords.length ? keywords.join(', ') : undefined);
  }

  private resolveSocialImage(pageMeta: PageMeta): SocialImage {
    const imagePath = pageMeta.image ?? DEFAULT_OG_IMAGE;
    const isGeneratedCard = imagePath.startsWith(GENERATED_IMAGE_PREFIX);

    return {
      url: this.absoluteUrl(imagePath),
      alt: pageMeta.imageAlt ?? OG_IMAGE_ALT,
      mimeType: this.imageMimeType(imagePath),
      width: pageMeta.imageWidth ?? (isGeneratedCard ? OG_IMAGE_WIDTH : undefined),
      height: pageMeta.imageHeight ?? (isGeneratedCard ? OG_IMAGE_HEIGHT : undefined),
    };
  }

  private buildBlogPostingSchema(schema: BlogPostingSchema): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: schema.headline,
      description: schema.description,
      url: schema.url,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': schema.url,
      },
      datePublished: schema.datePublished,
      ...(schema.dateModified ? { dateModified: schema.dateModified } : {}),
      ...(schema.image
        ? {
            image: {
              '@type': 'ImageObject',
              url: schema.image,
            },
          }
        : {}),
      author: {
        '@type': 'Organization',
        name: schema.authorName,
        url: environment.siteUrl,
      },
      publisher: {
        '@type': 'Organization',
        name: CHURCH_NAME,
        url: environment.siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: this.absoluteUrl('assets/img/logos/logo-sda-square.svg'),
        },
      },
      ...(schema.section ? { articleSection: schema.section } : {}),
      ...(schema.keywords?.length ? { keywords: schema.keywords.join(', ') } : {}),
      inLanguage: 'bg-BG',
    };
  }

  private setCanonicalUrl(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  private removeCanonicalUrl(): void {
    this.document.head.querySelector('link[rel="canonical"]')?.remove();
  }

  private setMeta(tag: MetaSelector, content?: string): void {
    if (content) {
      this.meta.updateTag({ ...tag, content });
      return;
    }

    const selector = tag.property
      ? `property="${tag.property}"`
      : tag.name
        ? `name="${tag.name}"`
        : null;

    if (!selector) {
      return;
    }

    this.meta.removeTag(selector);
  }

  private setArticleTags(tags: string[]): void {
    this.document.head.querySelectorAll(`meta[${ARTICLE_TAG_ATTR}]`).forEach((el) => el.remove());

    for (const tag of tags) {
      const meta = this.document.createElement('meta');
      meta.setAttribute('property', 'article:tag');
      meta.setAttribute('content', tag);
      meta.setAttribute(ARTICLE_TAG_ATTR, 'true');
      this.document.head.appendChild(meta);
    }
  }

  private removeJsonLd(): void {
    this.document.head.querySelectorAll(`script[${JSON_LD_ATTR}]`).forEach((el) => el.remove());
  }

  private appendJsonLd(schema: Record<string, unknown>): void {
    const script = this.document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute(JSON_LD_ATTR, 'true');
    script.textContent = JSON.stringify(schema);
    this.document.head.appendChild(script);
  }

  private imageMimeType(imagePath: string): string {
    const cleanPath = imagePath.split(/[?#]/)[0];
    const extension = cleanPath.split('.').pop()?.toLowerCase();

    if (!extension) {
      return 'image/jpeg';
    }

    return IMAGE_MIME_TYPES[extension] ?? 'image/jpeg';
  }
}
