import { SafeHtml } from '@angular/platform-browser';

export interface IChurchServiceAgenda {
  day: string;
  label: string | SafeHtml;
  time: { [key: string]: string };
  icon: string;
}
