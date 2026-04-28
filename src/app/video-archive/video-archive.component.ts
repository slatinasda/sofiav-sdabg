import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppTitleService } from '../app-title.service';
import { BibleStudiesCtaComponent } from '../shared/components/bible-studies-cta/bible-studies-cta.component';

interface VideoItem {
  title: string;
  link: string;
  videoId: string;
  thumbnail: string;
  published: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, BibleStudiesCtaComponent],
  selector: 'app-video-archive',
  templateUrl: './video-archive.component.html',
  styleUrls: ['./video-archive.component.scss'],
})
export class VideoArchiveComponent implements OnInit {
  private feedUrl: string = 'https://sofia-v.sdabg.net/api/youtube_feed.php';
  protected videos: VideoItem[] = [];

  constructor(
    private appTitleService: AppTitleService,
    private httpClient: HttpClient,
  ) {
    this.appTitleService.setTitle('Архив');
  }

  ngOnInit() {
    this.latestVideos();
  }

  latestVideos() {
    this.httpClient
      .get<VideoItem[]>(this.feedUrl)
      .subscribe((items: VideoItem[]) => (this.videos = items));
  }
}
