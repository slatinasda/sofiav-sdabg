import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppTitleService } from '../app-title.service';
import { RelativeTimePipe } from '../shared/pipes/relative-time.pipe';

interface VideoItem {
  title: string;
  link: string;
  videoId: string;
  thumbnail: string;
  description: string;
  published: string;
  channelTitle: string;
  channelLink: string;
  channelAvatar: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, RelativeTimePipe],
  selector: 'app-video-archive',
  templateUrl: './video-archive.component.html',
  styleUrls: ['./video-archive.component.scss'],
})
export class VideoArchiveComponent implements OnInit {
  private feedUrl: string = 'https://sofia-v.sdabg.net/api/youtube_feed.php';
  protected videos: VideoItem[] = [];
  private loadedVideoThumbs = new Set<string>();

  constructor(
    private appTitleService: AppTitleService,
    private httpClient: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {
    this.appTitleService.setTitle('Проповеди');
  }

  ngOnInit() {
    this.latestVideos();
  }

  latestVideos() {
    this.httpClient.get<VideoItem[]>(this.feedUrl).subscribe((items: VideoItem[]) => {
      this.videos = items;
      this.cdr.markForCheck();
    });
  }

  protected isVideoThumbLoaded(videoId: string): boolean {
    return this.loadedVideoThumbs.has(videoId);
  }

  protected onVideoThumbLoad(videoId: string): void {
    this.loadedVideoThumbs.add(videoId);
  }

  protected onChannelAvatarError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/img/logos/logo-sda-circle--green.svg';
  }
}
