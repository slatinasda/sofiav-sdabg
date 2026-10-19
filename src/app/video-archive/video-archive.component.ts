import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, of } from 'rxjs';

import { CHURCH_NAME } from '../shared/church-info';
import { OG_IMAGE_ALT, OG_IMAGES, SeoService } from '../shared/services/seo.service';
import { VideoCardComponent } from '../shared/components/video-card/video-card.component';
import { VideoItem, VideoSlot } from '../shared/interfaces/video-item.interface';
import { VideoFeedService } from '../shared/services/video-feed.service';

const SKELETON_COUNT = 6;

@Component({
  standalone: true,
  imports: [CommonModule, VideoCardComponent],
  selector: 'app-video-archive',
  templateUrl: './video-archive.component.html',
  styleUrls: ['./video-archive.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoArchiveComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly videoFeed = inject(VideoFeedService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly videos = signal<VideoSlot[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);

  ngOnInit(): void {
    this.seo.setPageMeta({
      title: 'Проповеди',
      socialTitle: 'Проповеди и богослужения',
      description: `Видеозаписи от проповеди и богослужения в ${CHURCH_NAME}.`,
      path: 'video-archive',
      image: OG_IMAGES.sermons,
      imageAlt: OG_IMAGE_ALT,
      keywords: ['проповеди', 'видео архив', 'богослужение', 'адвентна църква София'],
    });
    this.loadVideos();
  }

  protected reload(): void {
    this.loadVideos();
  }

  protected trackByIndex(index: number): number {
    return index;
  }

  private loadVideos(): void {
    this.videos.set(Array.from({ length: SKELETON_COUNT }, () => null));
    this.isLoading.set(true);
    this.hasError.set(false);

    this.videoFeed
      .getVideos()
      .pipe(
        catchError((error: unknown) => {
          // Show an actionable error state instead of leaving skeletons on screen forever.
          console.error('Failed to load the video archive', error);
          this.hasError.set(true);
          return of<VideoItem[]>([]);
        }),
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((videos) => this.videos.set(videos));
  }
}
