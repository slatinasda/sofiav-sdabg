import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

export const CHURCH_NAME = 'Църква на Адвентистите от Седмия Ден - София "В" Слатина';

@Injectable()
export class AppTitleService {
  constructor(private titleService: Title) {}

  setTitle(pageTitle: string): void {
    const title = pageTitle ? `${pageTitle} | ${CHURCH_NAME}` : CHURCH_NAME;
    this.titleService.setTitle(title);
  }
}
