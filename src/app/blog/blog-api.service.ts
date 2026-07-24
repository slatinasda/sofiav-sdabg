import { Injectable } from '@angular/core';
import { BlogPost, BlogPostSummary } from './interfaces/blog-post.interface';
import generatedIndex from '../../assets/blog/generated/posts-index.json';

const POSTS = generatedIndex as BlogPostSummary[];

export const BLOG_PAGE_SIZE = 9;

export interface BlogPage {
  posts: BlogPostSummary[];
  page: number;
  totalPages: number;
}

// Only posts-index.json loads eagerly; bodies and full-text are fetched on demand.
@Injectable({
  providedIn: 'root',
})
export class BlogApiService {
  getPosts(): BlogPostSummary[] {
    return POSTS;
  }

  async getPostBySlug(slug: string): Promise<BlogPost | undefined> {
    if (!POSTS.some((post) => post.slug === slug)) {
      return undefined;
    }

    const module = await import(`../../assets/blog/generated/posts/${slug}.json`);
    return module.default as BlogPost;
  }

  getPostsByCategory(category: string): BlogPostSummary[] {
    return POSTS.filter((post) => post.category === category);
  }

  getCategories(): string[] {
    return [...new Set(POSTS.map((post) => post.category))];
  }

  getPage(
    pageNumber: number,
    posts: BlogPostSummary[] = POSTS,
    pageSize = BLOG_PAGE_SIZE,
  ): BlogPage {
    const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
    const page = Math.min(Math.max(1, pageNumber), totalPages);
    const start = (page - 1) * pageSize;
    return {
      posts: posts.slice(start, start + pageSize),
      page,
      totalPages,
    };
  }

  getRelatedPosts(slug: string, limit = 2): BlogPostSummary[] {
    const current = POSTS.find((post) => post.slug === slug);
    if (!current) {
      return [];
    }

    const others = POSTS.filter((post) => post.slug !== slug);
    const sameCategory = others.filter((post) => post.category === current.category);
    const rest = others.filter((post) => post.category !== current.category);
    return [...sameCategory, ...rest].slice(0, limit);
  }

  // Matches title/description only unless fullTextIndex is passed (see getFullTextIndex()).
  searchPosts(
    query: string,
    posts: BlogPostSummary[] = POSTS,
    fullTextIndex?: ReadonlyMap<string, string>,
  ): BlogPostSummary[] {
    const term = query.trim().toLowerCase();
    if (!term) {
      return posts;
    }

    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(term) ||
        post.description.toLowerCase().includes(term) ||
        (fullTextIndex?.get(post.slug)?.includes(term) ?? false),
    );
  }

  // Fetches all post bodies (HTML stripped) as one combined file rather than per-post,
  // since full-text search needs every post's text at once. Only called on opt-in.
  async getFullTextIndex(): Promise<Map<string, string>> {
    const module = await import('../../assets/blog/generated/posts-fulltext.json');
    return new Map(Object.entries(module.default as Record<string, string>));
  }
}
