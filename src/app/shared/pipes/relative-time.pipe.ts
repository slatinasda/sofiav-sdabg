import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

const UNITS: { seconds: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { seconds: YEAR, unit: 'year' },
  { seconds: MONTH, unit: 'month' },
  { seconds: WEEK, unit: 'week' },
  { seconds: DAY, unit: 'day' },
  { seconds: HOUR, unit: 'hour' },
  { seconds: MINUTE, unit: 'minute' },
];

@Pipe({
  standalone: true,
  name: 'relativeTime',
})
export class RelativeTimePipe implements PipeTransform {
  private readonly formatter: Intl.RelativeTimeFormat;

  constructor(@Inject(LOCALE_ID) locale: string) {
    this.formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'always' });
  }

  transform(value: string | Date | number | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

    for (const { seconds: unitSeconds, unit } of UNITS) {
      const count = Math.floor(seconds / unitSeconds);
      if (count >= 1) {
        return this.formatter.format(-count, unit);
      }
    }

    return this.formatter.format(-seconds, 'second');
  }
}
