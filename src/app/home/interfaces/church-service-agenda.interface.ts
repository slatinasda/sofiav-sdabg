import { SafeHtml } from '@angular/platform-browser';

export interface IChurchServiceAgenda {
  day: string;
  label: string | SafeHtml;
  time: { startHour: string; endHour: string };
  icon: string;
}
