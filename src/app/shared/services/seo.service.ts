import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { AppTitleService } from '../../app-title.service';
import { environment } from '../../../environments/environment';

export interface BlogPostingSchema {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  authorName: string;
}

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}

const ARTICLE_TAG_ATTR = 'data-seo-article-tag';
const JSON_LD_ATTR = 'data-seo-json-ld';

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
    return `${environment.siteUrl}/${path.replace(/^\/+/, '')}`;
  }

  setPageMeta(pageMeta: PageMeta): void {
    const url = this.absoluteUrl(pageMeta.path);
    const type = pageMeta.type ?? 'website';

    this.appTitleService.setTitle(pageMeta.title);

    this.meta.updateTag({ name: 'description', content: pageMeta.description });
    this.meta.updateTag({ property: 'og:title', content: pageMeta.title });
    this.meta.updateTag({ property: 'og:description', content: pageMeta.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: type });
    this.meta.updateTag({
      name: 'twitter:card',
      content: pageMeta.image ? 'summary_large_image' : 'summary',
    });
    this.meta.updateTag({ name: 'twitter:title', content: pageMeta.title });
    this.meta.updateTag({ name: 'twitter:description', content: pageMeta.description });

    if (pageMeta.image) {
      this.meta.updateTag({ property: 'og:image', content: pageMeta.image });
      this.meta.updateTag({ name: 'twitter:image', content: pageMeta.image });
    } else {
      this.meta.removeTag(`property="og:image"`);
      this.meta.removeTag(`name="twitter:image"`);
    }

    if (pageMeta.publishedTime) {
      this.meta.updateTag({ property: 'article:published_time', content: pageMeta.publishedTime });
    } else {
      this.meta.removeTag(`property="article:published_time"`);
    }

    if (pageMeta.modifiedTime) {
      this.meta.updateTag({ property: 'article:modified_time', content: pageMeta.modifiedTime });
    } else {
      this.meta.removeTag(`property="article:modified_time"`);
    }

    this.setArticleTags(pageMeta.tags ?? []);
    this.setCanonicalUrl(url);
  }

  setJsonLd(schema: BlogPostingSchema | null): void {
    this.document.head.querySelectorAll(`script[${JSON_LD_ATTR}]`).forEach((el) => el.remove());

    if (!schema) {
      return;
    }

    const script = this.document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute(JSON_LD_ATTR, 'true');
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: schema.headline,
      description: schema.description,
      url: schema.url,
      datePublished: schema.datePublished,
      dateModified: schema.dateModified ?? schema.datePublished,
      image: schema.image,
      author: {
        '@type': 'Organization',
        name: schema.authorName,
      },
    });

    this.document.head.appendChild(script);
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
}
