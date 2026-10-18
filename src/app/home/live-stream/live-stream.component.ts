import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { catchError, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ChurchAgendaService } from '../services/church-agenda.service';
import { NextLiveStream } from './next-live-stream.interface';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-live-stream',
  templateUrl: './live-stream.component.html',
  styleUrls: ['./live-stream.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-block' },
})
export class LiveStreamComponent implements OnInit {
  protected readonly agenda = inject(ChurchAgendaService);

  private readonly httpClient = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly liveStreamApi = `${environment.apiUrl}/next_live_stream.php`;

  protected readonly liveStreamEmbedUrl = signal(this.sanitizer.bypassSecurityTrustResourceUrl(''));

  ngOnInit(): void {
    // Skip during SSR prerendering; hydrate when the page JS loads.
    if (!this.isBrowser) {
      return;
    }

    this.loadNextLiveStream();
  }

  private loadNextLiveStream(): void {
    this.httpClient
      .get<NextLiveStream>(this.liveStreamApi)
      .pipe(
        catchError((error: unknown) => {
          console.error('Failed to load the next live stream', error);
          return of<NextLiveStream | null>(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        if (!response) {
          return;
        }

        this.liveStreamEmbedUrl.set(
          this.sanitizer.bypassSecurityTrustResourceUrl(response.embedUrl),
        );
      });
  }
}
