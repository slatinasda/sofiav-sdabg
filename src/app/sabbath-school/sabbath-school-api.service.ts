import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quarterly, QuarterlyDetail, LessonDetail, DayRead, AudioItem, PublishingInfo } from './interfaces/quarterly.interface';

@Injectable({
  providedIn: 'root'
})
export class SabbathSchoolApiService {
  private readonly API_HOST = 'https://sabbath-school.adventech.io/api/v2';
  private readonly lang = 'bg';

  constructor(private http: HttpClient) { }

  getQuarterlies(): Observable<Quarterly[]> {
    return this.http.get<Quarterly[]>(`${this.API_HOST}/${this.lang}/quarterlies/index.json`);
  }

  getQuarterly(quarter: string): Observable<QuarterlyDetail> {
    return this.http.get<QuarterlyDetail>(`${this.API_HOST}/${this.lang}/quarterlies/${quarter}/index.json`);
  }

  getLesson(quarter: string, lesson: string): Observable<LessonDetail> {
    return this.http.get<LessonDetail>(`${this.API_HOST}/${this.lang}/quarterlies/${quarter}/lessons/${lesson}/index.json`);
  }

  getDayRead(quarter: string, lesson: string, day: string): Observable<DayRead> {
    return this.http.get<DayRead>(`${this.API_HOST}/${this.lang}/quarterlies/${quarter}/lessons/${lesson}/days/${day}/read/index.json`);
  }

  getAudio(quarter: string): Observable<AudioItem[]> {
    return this.http.get<AudioItem[]>(`${this.API_HOST}/${this.lang}/quarterlies/${quarter}/audio.json`);
  }

  getPublishingInfo(country: string, language: string): Observable<PublishingInfo> {
    return this.http.post<PublishingInfo>(`${this.API_HOST}/misc/publishing/info`, {
      country,
      language
    });
  }
}
