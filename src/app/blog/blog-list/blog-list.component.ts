import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BlogApiService } from '../blog-api.service';
import { SeoService } from '../../shared/services/seo.service';
import { BlogPostSummary } from '../interfaces/blog-post.interface';
import { BlogPostCardComponent } from '../blog-post-card/blog-post-card.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

type BlogListFilter = { type: 'none' } | { type: 'category'; value: string };

const SEARCH_DEBOUNCE_MS = 300;
const FULL_TEXT_SEARCH_KEY = 'blog-full-text-search';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BlogPostCardComponent, ModalComponent],
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss'],
})
export class BlogListComponent implements OnInit, OnDestroy {
  posts: BlogPostSummary[] = [];
  page = 1;
  totalPages = 1;
  filter: BlogListFilter = { type: 'none' };
  categories: string[] = [];

  searchQuery = '';
  categoriesModalOpen = false;
  searchSettingsModalOpen = false;

  fullTextSearch = false;
  fullTextIndexLoading = false;

  private fullTextIndex: Map<string, string> | null = null;
  private readonly isBrowser: boolean;
  private routeFilteredPosts: BlogPostSummary[] = [];
  private pageParam = 1;
  private routeSub!: Subscription;
  private readonly searchInput$ = new Subject<string>();
  private searchInputSub!: Subscription;

  constructor(
    private api: BlogApiService,
    private route: ActivatedRoute,
    private router: Router,
    private seo: SeoService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      window.scrollTo(0, 0);
    }

    this.loadFullTextPreference();
    this.categories = this.api.getCategories();

    this.searchInputSub = this.searchInput$
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged())
      .subscribe(() => this.applyDisplay());

    this.routeSub = this.route.paramMap.subscribe((params) => {
      const category = params.get('category');
      this.pageParam = Number(params.get('page')) || 1;

      if (category) {
        this.filter = { type: 'category', value: category };
        this.routeFilteredPosts = this.api.getPostsByCategory(category);
      } else {
        this.filter = { type: 'none' };
        this.routeFilteredPosts = this.api.getPosts();
      }

      this.searchQuery = '';
      this.applyDisplay();
      this.updateSeo();
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.searchInputSub?.unsubscribe();
  }

  onSearchChange(): void {
    this.searchInput$.next(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyDisplay();
  }

  clearAllFilters(): void {
    this.searchQuery = '';
    if (this.filter.type === 'none') {
      this.applyDisplay();
    } else {
      this.router.navigate(['/blog']);
    }
  }

  openCategoriesModal(): void {
    this.categoriesModalOpen = true;
  }

  closeCategoriesModal(): void {
    this.categoriesModalOpen = false;
  }

  onCategoriesModalOpenChange(open: boolean): void {
    this.categoriesModalOpen = open;
  }

  openSearchSettingsModal(): void {
    this.searchSettingsModalOpen = true;
  }

  onSearchSettingsModalOpenChange(open: boolean): void {
    this.searchSettingsModalOpen = open;
  }

  onFullTextSearchToggle(enabled: boolean): void {
    this.fullTextSearch = enabled;
    this.saveFullTextPreference();
    this.applyDisplay();
  }

  // Category is already shown on the filter pill, so the page <title>/meta description
  // keep the category-specific text without repeating it in the visible h2.
  private get seoTitle(): string {
    return this.filter.type === 'category' ? `Категория: ${this.filter.value}` : 'Блог';
  }

  get isSearching(): boolean {
    return this.searchQuery.trim().length > 0;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get showFeatured(): boolean {
    return (
      this.filter.type === 'none' && this.page === 1 && !this.isSearching && this.posts.length > 0
    );
  }

  get featuredPost(): BlogPostSummary | undefined {
    return this.showFeatured ? this.posts[0] : undefined;
  }

  get restPosts(): BlogPostSummary[] {
    return this.showFeatured ? this.posts.slice(1) : this.posts;
  }

  private async applyDisplay(): Promise<void> {
    if (this.fullTextSearch && this.isSearching && !this.fullTextIndex) {
      this.fullTextIndexLoading = true;
      this.cdr.markForCheck();
      this.fullTextIndex = await this.api.getFullTextIndex();
      this.fullTextIndexLoading = false;
    }

    const searched = this.api.searchPosts(
      this.searchQuery,
      this.routeFilteredPosts,
      this.fullTextSearch ? (this.fullTextIndex ?? undefined) : undefined,
    );

    if (this.isSearching || this.filter.type !== 'none') {
      this.posts = searched;
      this.page = 1;
      this.totalPages = 1;
      this.cdr.markForCheck();
      return;
    }

    const result = this.api.getPage(this.pageParam, searched);
    this.posts = result.posts;
    this.page = result.page;
    this.totalPages = result.totalPages;
    this.cdr.markForCheck();
  }

  private loadFullTextPreference(): void {
    if (!this.isBrowser) {
      return;
    }
    this.fullTextSearch = localStorage.getItem(FULL_TEXT_SEARCH_KEY) === 'true';
  }

  private saveFullTextPreference(): void {
    if (!this.isBrowser) {
      return;
    }
    localStorage.setItem(FULL_TEXT_SEARCH_KEY, String(this.fullTextSearch));
  }

  private get path(): string {
    if (this.filter.type === 'category') return `blog/category/${this.filter.value}`;
    return this.page > 1 ? `blog/page/${this.page}` : 'blog';
  }

  private updateSeo(): void {
    this.seo.setPageMeta({
      title: this.seoTitle,
      description:
        this.filter.type === 'none'
          ? 'Последни новини и статии от Църква на Адвентистите от Седмия Ден - София "В" Слатина.'
          : `Публикации в ${this.seoTitle.toLowerCase()}.`,
      path: this.path,
      type: 'website',
    });
    this.seo.setJsonLd(null);
  }
}
