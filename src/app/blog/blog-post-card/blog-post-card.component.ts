import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogPostSummary } from '../interfaces/blog-post.interface';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-blog-post-card',
  templateUrl: './blog-post-card.component.html',
  styleUrls: ['./blog-post-card.component.scss'],
})
export class BlogPostCardComponent {
  @Input({ required: true }) post!: BlogPostSummary;
  @Input() size: 'featured' | 'compact' = 'compact';
  @Input() showReadMore = true;
}
