import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { BlogApiService } from '../../blog/blog-api.service';
import { BlogPostCardComponent } from '../../blog/blog-post-card/blog-post-card.component';
import { BlogPostSummary } from '../../blog/interfaces/blog-post.interface';

const LATEST_POSTS_COUNT = 3;

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, BlogPostCardComponent],
  selector: 'app-latest-posts',
  templateUrl: './latest-posts.component.html',
  styleUrls: ['./latest-posts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-block' },
})
export class LatestPostsComponent {
  private readonly blogApi = inject(BlogApiService);

  protected readonly latestPosts = this.blogApi.getPosts().slice(0, LATEST_POSTS_COUNT);

  protected trackBySlug(_index: number, post: BlogPostSummary): string {
    return post.slug;
  }
}
