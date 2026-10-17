import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewEncapsulation,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { BlogApiService } from '../blog-api.service';
import { SeoService } from '../../shared/services/seo.service';
import { BlogPost, BlogPostSummary } from '../interfaces/blog-post.interface';
import { BlogPostCardComponent } from '../blog-post-card/blog-post-card.component';
import { ReaderSettingsComponent } from '../../shared/components/reader-settings/reader-settings.component';
import { ReaderSettingsTriggerDirective } from '../../shared/components/reader-settings/reader-settings-trigger.directive';
import {
  ReaderSettingsService,
  provideReaderSettings,
} from '../../shared/components/reader-settings/reader-settings.service';

interface ShareLinks {
  facebook: SafeUrl;
  x: SafeUrl;
  whatsapp: SafeUrl;
  viber: SafeUrl;
  email: SafeUrl;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BlogPostCardComponent,
    ReaderSettingsComponent,
    ReaderSettingsTriggerDirective,
  ],
  selector: 'app-blog-post',
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.scss'],
  // [innerHTML] bypasses style encapsulation (same tradeoff as sabbath-school-read.component.ts).
  encapsulation: ViewEncapsulation.None,
  providers: [provideReaderSettings('blog')],
})
export class BlogPostComponent implements OnInit, OnDestroy {
  readonly readerSettings = inject(ReaderSettingsService);

  post: BlogPost | null = null;
  notFound = false;
  relatedPosts: BlogPostSummary[] = [];
  contentHtml: SafeHtml = '';
  shareLinks: ShareLinks | null = null;

  private readonly isBrowser: boolean;
  private routeSub!: Subscription;

  constructor(
    private api: BlogApiService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private seo: SeoService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Post data comes from blogPostResolver (see blog.routes.ts), which the Router
    // re-runs and race-guards on every navigation - no manual guarding needed here.
    this.routeSub = this.route.data.subscribe((data) => {
      const post = (data['post'] as BlogPost | null) ?? null;
      this.applyPost(post);
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.seo.setJsonLd(null);
  }

  private applyPost(post: BlogPost | null): void {
    if (!post) {
      this.post = null;
      this.notFound = true;
      this.cdr.markForCheck();
      return;
    }

    this.post = post;
    this.notFound = false;
    this.contentHtml = this.sanitizer.bypassSecurityTrustHtml(post.contentHtml);
    this.relatedPosts = this.api.getRelatedPosts(post.slug);
    this.shareLinks = this.buildShareLinks(post);
    this.updateSeo(post);
    this.cdr.markForCheck();

    if (this.isBrowser) {
      window.scrollTo(0, 0);
    }
  }

  private postPath(post: BlogPost): string {
    return `blog/${post.slug}`;
  }

  private buildShareLinks(post: BlogPost): ShareLinks {
    const url = this.seo.absoluteUrl(this.postPath(post));
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(post.title);

    return {
      facebook: this.sanitizer.bypassSecurityTrustUrl(
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      ),
      x: this.sanitizer.bypassSecurityTrustUrl(
        `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      ),
      whatsapp: this.sanitizer.bypassSecurityTrustUrl(
        `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      ),
      viber: this.sanitizer.bypassSecurityTrustUrl(
        `viber://forward?text=${encodedTitle}%20${encodedUrl}`,
      ),
      email: this.sanitizer.bypassSecurityTrustUrl(
        `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      ),
    };
  }

  private updateSeo(post: BlogPost): void {
    const url = this.seo.absoluteUrl(this.postPath(post));
    this.seo.setPageMeta({
      title: post.title,
      description: post.description,
      path: this.postPath(post),
      image: post.cover ? this.seo.absoluteUrl(post.cover) : undefined,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated,
      tags: [post.category],
    });
    this.seo.setJsonLd({
      headline: post.title,
      description: post.description,
      url,
      datePublished: post.date,
      dateModified: post.updated,
      image: post.cover ? this.seo.absoluteUrl(post.cover) : undefined,
      authorName: post.author,
    });
  }
}
