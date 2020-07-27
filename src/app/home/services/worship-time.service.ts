import { Injectable } from '@angular/core';
import * as moment from 'moment-timezone';

/**
 * Calculates the start and end times for church services,
 * taking into account Daylight Saving
 */
@Injectable()
export class WorshipTimeService {
  private timeZone: string = 'Europe/Sofia';

  getTimeZone(): string {
    return this.timeZone;
  }

  /**
   * Operate with a specific time zone within this instance
   *
   * @param timeZone in the format "Country/City"
   */
  setTimeZone(timeZone: string): void {
    this.timeZone = timeZone;
  }

  isDaylightSaving(): boolean {
    return moment().tz(this.getTimeZone()).isDST();
  }

  /**
   * Daylight Saving Time - Summer Time
   * How it applies - Spring forward, Fall back.
   *
   * @param time
   */
  applyDSTChange(time: moment.Moment): moment.Moment {
    if (this.isDaylightSaving()) {
      return time.add(1, 'hours');
    }

    return time;
  }

  getTime(hour: number, minute: number): moment.Moment {
    return moment().set({ hour: hour, minute: minute }).startOf('minutes');
  }

  getTimeDST(hour: number, minute: number): moment.Moment {
    return this.applyDSTChange(this.getTime(hour, minute));
  }
}
