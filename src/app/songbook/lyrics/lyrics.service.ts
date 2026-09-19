import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import manifestData from './manifest.json';
import { LyricsEntry, LyricsManifest, ParsedLyrics } from './lyrics.types';
import { parseLyrics } from './lyrics-parser';

export const LYRICS_MISSING_ERROR = 'LYRICS_MISSING';

const MANIFEST = manifestData as LyricsManifest;

@Injectable({
  providedIn: 'root',
})
export class LyricsService {
  readonly manifest: LyricsManifest = MANIFEST;

  private readonly lyricsCache = new Map<number, Observable<ParsedLyrics>>();

  constructor(private http: HttpClient) {}

  getLyrics(songNumber: number): Observable<ParsedLyrics> {
    const cached = this.lyricsCache.get(songNumber);
    if (cached) {
      return cached;
    }

    const entry: LyricsEntry | undefined = this.manifest[String(songNumber)];
    if (!entry?.lyrics) {
      return throwError(() => new Error(LYRICS_MISSING_ERROR));
    }

    const { lyrics, format } = entry;
    const lyrics$ = this.http.get(lyrics, { responseType: 'text' }).pipe(
      map((raw) => parseLyrics(raw, format)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.lyricsCache.set(songNumber, lyrics$);
    return lyrics$;
  }
}
