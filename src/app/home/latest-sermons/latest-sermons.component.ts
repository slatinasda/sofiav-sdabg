import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import { VideoCardComponent } from '../../shared/components/video-card/video-card.component';
import { VideoItem, VideoSlot } from '../../shared/interfaces/video-item.interface';
import { VideoFeedService } from '../../shared/services/video-feed.service';

const LATEST_SERMONS_COUNT = 3;

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, VideoCardComponent],
  selector: 'app-latest-sermons',
  templateUrl: './latest-sermons.component.html',
  styleUrls: ['./latest-sermons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-block' },
})
export class LatestSermonsComponent implements OnInit {
  private readonly videoFeed = inject(VideoFeedService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly latestVideos = signal<VideoSlot[]>(
    Array.from({ length: LATEST_SERMONS_COUNT }, () => null),
  );
  protected readonly isLoading = signal(true);

  ngOnInit(): void {
    // Skip during SSR prerendering; hydrate when the page JS loads.
    if (!this.isBrowser) {
      return;
    }

    this.loadLatestSermons();
  }

  protected trackByIndex(index: number): number {
    return index;
  }

  private loadLatestSermons(): void {
    this.videoFeed
      .getVideos(LATEST_SERMONS_COUNT)
      .pipe(
        catchError((error: unknown) => {
          // Hide the section instead of leaving skeletons on screen forever.
          console.error('Failed to load the latest sermons', error);
          return of<VideoItem[]>([]);
        }),
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((videos) => this.latestVideos.set(videos));
  }
}
