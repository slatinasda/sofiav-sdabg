import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import { VideoSlot } from '../../interfaces/video-item.interface';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';

const FALLBACK_AVATAR_SRC = 'assets/img/logos/logo-sda-circle--green.svg';

@Component({
  standalone: true,
  imports: [CommonModule, RelativeTimePipe],
  selector: 'app-video-card',
  templateUrl: './video-card.component.html',
  styleUrls: ['./video-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoCardComponent {
  /** No video yet (`null`) renders the loading skeleton instead of the card. */
  readonly video = input<VideoSlot>(null);

  private readonly loadedVideoId = signal<string | null>(null);

  protected readonly isThumbLoaded = computed(() => {
    const video = this.video();
    return video !== null && this.loadedVideoId() === video.videoId;
  });

  protected onThumbLoad(): void {
    const video = this.video();
    if (video === null) {
      return;
    }

    this.loadedVideoId.set(video.videoId);
  }

  protected onChannelAvatarError(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (image.getAttribute('src') === FALLBACK_AVATAR_SRC) {
      return;
    }

    image.src = FALLBACK_AVATAR_SRC;
  }
}
