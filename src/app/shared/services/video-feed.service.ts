import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { VideoItem } from '../interfaces/video-item.interface';

@Injectable({
  providedIn: 'root',
})
export class VideoFeedService {
  private readonly httpClient = inject(HttpClient);
  private readonly feedUrl = `${environment.apiUrl}/youtube_feed.php`;

  /**
   * Fetches the church's YouTube feed.
   *
   * @param limit Optional maximum number of newest videos to return.
   */
  getVideos(limit?: number): Observable<VideoItem[]> {
    return this.httpClient.get<VideoItem[]>(this.feedUrl).pipe(
      map((videos) => {
        if (limit === undefined) {
          return videos;
        }

        return videos.slice(0, limit);
      }),
    );
  }
}
