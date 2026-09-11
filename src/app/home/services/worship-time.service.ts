import { Injectable } from '@angular/core';
import moment from 'moment-timezone';

/**
 * Calculates the start and end times for church services,
 * taking into account Daylight Saving
 */
@Injectable({ providedIn: 'root' })
export class WorshipTimeService {
  private readonly timeZone = 'Europe/Sofia';

  isDaylightSaving(): boolean {
    return moment().tz(this.timeZone).isDST();
  }

  getTime(hour: number, minute: number): moment.Moment {
    return moment().set({ hour, minute }).startOf('minutes');
  }
}
