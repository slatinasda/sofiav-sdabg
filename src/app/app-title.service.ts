import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';


@Injectable()
export class AppTitleService {
  private baseAppTitle = 'Църква на Адвентистите от Седмия Ден - София "В" Слатина';

  constructor(private titleService: Title) { }

  getBaseAppTitle(): string {
    return this.baseAppTitle;
  }
  
  getTitle(): string {
    return this.titleService.getTitle();
  }

  setTitle(pageTitle: string): void {
    if (pageTitle === '') {
      return this.titleService.setTitle(this.baseAppTitle);
    }

    this.titleService.setTitle(`${pageTitle} | ${this.baseAppTitle}`);
  }
}
