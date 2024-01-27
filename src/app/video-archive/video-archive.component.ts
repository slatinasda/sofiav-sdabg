import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppTitleService } from '../app-title.service';

interface VideoItem {
  title: string,
  link: string,
  videoId: string,
  thumbnail: string,
  published: string,
}

@Component({
  selector: 'app-video-archive',
  templateUrl: './video-archive.component.html',
  styleUrls: ['./video-archive.component.scss']
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
    const feed = this.httpClient.get<VideoItem[]>(this.feedUrl);
    feed.subscribe((items: VideoItem[]) => this.videos = items);
  }
}
