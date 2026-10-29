import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { CHURCH_SHORT_NAME } from './shared/church-info';

@Injectable()
export class AppTitleService {
  constructor(private titleService: Title) {}

  setTitle(pageTitle: string, appendSiteName = true): void {
    if (!pageTitle) {
      this.titleService.setTitle(CHURCH_SHORT_NAME);
      return;
    }

    const title = appendSiteName ? `${pageTitle} | ${CHURCH_SHORT_NAME}` : pageTitle;
    this.titleService.setTitle(title);
  }
}
