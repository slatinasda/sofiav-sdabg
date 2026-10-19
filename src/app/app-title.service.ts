import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { CHURCH_NAME } from './shared/church-info';

@Injectable()
export class AppTitleService {
  constructor(private titleService: Title) {}

  setTitle(pageTitle: string): void {
    const title = pageTitle ? `${pageTitle} | ${CHURCH_NAME}` : CHURCH_NAME;
    this.titleService.setTitle(title);
  }
}
